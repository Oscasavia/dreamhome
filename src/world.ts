import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent';
import {Scene} from '@babylonjs/core/scene';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {Color3,Color4} from '@babylonjs/core/Maths/math.color';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {HemisphericLight} from '@babylonjs/core/Lights/hemisphericLight';
import {DirectionalLight} from '@babylonjs/core/Lights/directionalLight';
import {PointLight} from '@babylonjs/core/Lights/pointLight';
import {ShadowGenerator} from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import {surfaceTexture} from './surfaceTextures';
import {createLandscape} from './landscape';
import {socialMaterials,furnishSocial} from './interior';
import {SOCIAL} from './interiorPlan';
import {rooms, SITE_SIDE, STOREY, LEVEL, ARCH, SITE, stairs, approachStairs, disjoint, stairLandings, stairPoint, groundPlates, upperPlates, roofPlates, balconies, outline, roomRect, roomEntry, ensuiteRect, type Rect, type Room, type Obstacle, type Surface} from './plan';

import {ENVELOPE,FRONT,sideWalls} from './facades';

export interface Door {name:string; pivot:TransformNode; leaf:Mesh; open:boolean; angle:number; target:number; x:number; y:number; z:number; width:number; along:'x'|'z'; swing:number; slide?:boolean;group?:string}
export interface LightZone {name:string;position:Vector3;on:boolean;light:PointLight;material:StandardMaterial;strips:Mesh[]}
export interface World {obstacles:Obstacle[];surfaces:Surface[];doors:Door[];zones:LightZone[];sun:DirectionalLight;ambient:HemisphericLight;shadows:ShadowGenerator;setNight:(night:boolean)=>void;update:(dt:number,player:Vector3)=>void;meshCount:number}

export function createWorld(scene:Scene, headless=false):World {
 const obstacles:Obstacle[]=[],surfaces:Surface[]=[],doors:Door[]=[],zones:LightZone[]=[];
 let night=false;
 const sun=new DirectionalLight('sun',new Vector3(-.45,-.85,.35),scene);sun.position.set(35,50,-35);sun.intensity=1.15;sun.diffuse=Color3.FromHexString('#fff0d9');
 const ambient=new HemisphericLight('sky',Vector3.Up(),scene);ambient.intensity=.58;ambient.groundColor=Color3.FromHexString('#a1a49c');
 // Fit depth and XY coverage to casters. Back faces suppress planar self-shadowing; PCF softens the retained 1024px map.
 const shadows=new ShadowGenerator(1024,sun);shadows.usePercentageCloserFiltering=true;shadows.filteringQuality=ShadowGenerator.QUALITY_MEDIUM;shadows.forceBackFacesOnly=true;shadows.bias=.006;shadows.normalBias=.025;sun.autoCalcShadowZBounds=true;sun.shadowOrthoScale=.02;shadows.setDarkness(.22);
 scene.clearColor=Color4.FromHexString('#cbdde5ff');scene.fogMode=Scene.FOGMODE_EXP2;scene.fogDensity=.0028;scene.fogColor=Color3.FromHexString('#cbdde5');
 const mat=(name:string,hex:string,spec=.035)=>{const m=new StandardMaterial(name,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor=new Color3(spec,spec,spec);m.specularPower=48;return m;};
 const plaster=mat('Warm ivory plaster','#eee7d7'),stone=mat('Pale travertine','#d9c7a7'),dark=mat('Dark bronze','#332c25'),wood=mat('Walnut','#624125'),floor=mat('Honed limestone floor','#bcb9b0',.06),oak=mat('Natural oak floor','#a5835e'),grass=mat('Garden lawn','#69764c'),asphalt=mat('Stone pavers','#a89b83'),water=mat('Pool water','#52a6a4',.8),white=mat('Ivory upholstery','#eee8db'),cloth=mat('Sage upholstery','#818d7c'),black=mat('Cinema charcoal','#242626'),leaf=mat('Olive canopy','#354b32',.02),brass=mat('Brushed brass','#b6a170',.5),soil=mat('Planting earth','#615343');
 const interior=socialMaterials(scene,headless);
 water.alpha=.85;water.specularPower=128;
 const entryWood=mat('Dark walnut entry doors','#30251b');
 const glass=mat('Smoked architectural glazing','#9eb9b5',.65);glass.alpha=.25;glass.backFaceCulling=false;
 if(!headless){
  for(const [m,kind] of [[stone,'travertine'],[floor,'floor'],[oak,'wood'],[wood,'wood'],[grass,'grass'],[asphalt,'paver']] as const)surfaceTexture(scene,m,kind);
 }
 function box(name:string,x:number,y:number,z:number,w:number,h:number,d:number,m:StandardMaterial,solid=false,shadow=false){
  const b=MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);
  // Project each face in metres. Default box face rotations otherwise turn side stone courses upright.
  const positions=b.getVerticesData('position')!,normals=b.getVerticesData('normal')!,uvs:number[]=[];
  for(let i=0;i<positions.length;i+=3){const px=positions[i]+x,py=positions[i+1]+y,pz=positions[i+2]+z;
   uvs.push((Math.abs(normals[i])>.5?pz:px)/3,(Math.abs(normals[i+1])>.5?pz:py)/3);
  }
  b.setVerticesData('uv',uvs);b.position.set(x,y,z);b.material=m;b.receiveShadows=m!==glass;b.isPickable=false;
  if(solid){obstacles.push({name,x,z,w,d,bottom:y-h/2,top:y+h/2});b.isPickable=true;b.metadata={solid:true};}if(shadow&&m!==glass)shadows.addShadowCaster(b);return b;
 }
 function cylinder(name:string,x:number,y:number,z:number,d:number,h:number,m:StandardMaterial,top=d){const b=MeshBuilder.CreateCylinder(name,{diameterBottom:d,diameterTop:top,height:h,tessellation:16},scene);b.position.set(x,y,z);b.material=m;b.isPickable=false;b.receiveShadows=true;return b;}
 function slab(name:string,x:number,z:number,w:number,d:number,y:number,m=floor){box(name,x,y-LEVEL.slabThickness/2,z,w,LEVEL.slabThickness,d,m,false,y>=STOREY);surfaces.push({name,x,z,w,d,y});}
 function panel(name:string,x:number,z:number,w:number,d:number,base:number,h=3.95,m=plaster){if(base+h<=LEVEL.roof+.001&&base+h>0&&Math.abs((base+h)/STOREY-Math.round((base+h)/STOREY))<.0001)h-=LEVEL.slabThickness;return box(name,x,base+h/2,z,w,h,d,m,true,true);}
 function zone(name:string,x:number,y:number,z:number,w:number,d:number,ceiling=true){
  const lm=mat(name+' LEDs','#fff1c8');lm.emissiveColor=Color3.FromHexString('#ffdc99');lm.disableLighting=true;
  const strips=ceiling?[box(name+' cove west',x-w/2+.32,y+3.72,z,.025,.018,d-.64,lm),box(name+' cove east',x+w/2-.32,y+3.72,z,.025,.018,d-.64,lm),box(name+' cove north',x,y+3.72,z+d/2-.32,w-.64,.018,.025,lm),box(name+' cove south',x,y+3.72,z-d/2+.32,w-.64,.018,.025,lm)]:[];
  const light=new PointLight(name,new Vector3(x,y+3.25,z),scene);light.diffuse=Color3.FromHexString('#ffdfaa');light.range=10;light.intensity=.35;
  const q={name,position:new Vector3(x,y+1,z),on:true,light,material:lm,strips};zones.push(q);
  // The ceiling recess leaves a dark reveal around the warm strip.
  if(ceiling)box(name+' floating ceiling',x,y+3.88,z,w-.9,.12,d-.9,plaster);
  return q;
 }
 function door(name:string,x:number,y:number,z:number,width=1.3,along:'x'|'z'='z',material=wood,slide=false,reversed=false,height=2.7){
  const p=new TransformNode(name+' hinge',scene);const baseRotation=(along==='x'?Math.PI/2:0)+(reversed?Math.PI:0);p.position.set(x+(reversed&&along==='x'?width:0),y,z+(reversed&&along==='z'?width:0));p.rotation.y=baseRotation;
  const b=box(name,0,height/2,width/2,.11,height,width,material);b.parent=p;b.isPickable=true;
  for(const side of [-1,1]){const handle=box(name+' handle',side*.09,name.startsWith('Front entrance')?1.5:1.2,width-.18,.05,name.startsWith('Front entrance')?1.05:.38,.06,brass);handle.parent=p;}
  const q:Door={name,pivot:p,leaf:b,open:false,angle:0,target:0,x,y,z,width,along,swing:reversed?-1:along==='z'&&x<0?-1:1,slide};doors.push(q);
  // The moving rectangle follows the rendered leaf, including the open swing.
  const progress=()=>q.angle/(Math.PI/2);
  const theta=()=>baseRotation+(slide?0:q.angle*q.swing);
  const length=()=>width*(slide?1-progress()*.97:1);
  obstacles.push({name,bottom:y,top:y+height,
   get x(){return q.pivot.position.x+Math.sin(theta())*length()/2;},
   get z(){return q.pivot.position.z+Math.cos(theta())*length()/2;},
   get w(){return Math.abs(Math.sin(theta()))*length()+Math.abs(Math.cos(theta()))*.11;},
   get d(){return Math.abs(Math.cos(theta()))*length()+Math.abs(Math.sin(theta()))*.11;}
  });
  return q;
 }
 // A wall and its aperture share the same dimensions for rendering and collision.
 function wallOpening(name:string,x:number,z:number,length:number,along:'x'|'z',base:number,
   opening:{offset:number;width:number;sill:number;head:number},material=plaster,glazed=true,thickness:number=ARCH.wall,recess=0,wallHeight=STOREY){
  const {offset,width,sill,head}=opening;
  const segment=(label:string,start:number,end:number,bottom:number,height:number,m=material)=>{
   if(end-start<.001||height<.001)return;
   const c=(start+end)/2;
   panel(name+' '+label,x+(along==='x'?c:0),z+(along==='z'?c:0),along==='x'?end-start:thickness,along==='z'?end-start:thickness,base+bottom,height,m);
  };
  segment('left',-length/2,offset-width/2,0,wallHeight);
  segment('right',offset+width/2,length/2,0,wallHeight);
  segment('sill',offset-width/2,offset+width/2,0,sill);
  segment('head',offset-width/2,offset+width/2,head,wallHeight-head);
  if(glazed){
   const gx=x+(along==='x'?offset:recess),gz=z+(along==='z'?offset:recess);
   box(name+' recessed glass',gx,base+(sill+head)/2,gz,along==='x'?width:.035,head-sill,along==='z'?width:.035,glass,true);
   for(const t of [-width/2,width/2,0])box(name+' vertical frame',gx+(along==='x'?t:0),base+(sill+head)/2,gz+(along==='z'?t:0),.055,head-sill,.055,dark);
   for(const h of [sill,head])box(name+' horizontal frame',gx,base+h,gz,along==='x'?width:.06,.06,along==='z'?width:.06,dark);
  }
 }
 function sofa(x:number,y:number,z:number,rot=0,m=cloth){
  obstacles.push({name:'Sofa',x,z,w:Math.abs(Math.cos(rot))*2.7+Math.abs(Math.sin(rot)),d:Math.abs(Math.sin(rot))*2.7+Math.abs(Math.cos(rot)),bottom:y,top:y+1.1});
  const root=new TransformNode('Sofa',scene);root.position.set(x,y,z);root.rotation.y=rot;
  for(const [name,px,py,pz,w,h,d] of [['base',0,.3,0,2.7,.45,1],['back',0,.75,.43,2.7,.7,.18],['left',-1.3,.55,0,.16,.7,1],['right',1.3,.55,0,.16,.7,1],['cushion left',-.65,.57,-.02,1.18,.18,.8],['cushion right',.65,.57,-.02,1.18,.18,.8]] as const){const b=box('Sofa '+name,px,py,pz,w,h,d,m);b.parent=root;}
 }
 function table(x:number,y:number,z:number,w=2,d=1,m=wood){obstacles.push({name:'Table',x,z,w,d,bottom:y,top:y+.81});box('Table top',x,y+.75,z,w,.12,d,m);for(const a of [-1,1])for(const b of [-1,1])box('Table leg',x+a*(w/2-.14),y+.36,z+b*(d/2-.12),.07,.72,.07,dark);}
 function plant(x:number,y:number,z:number,scale=1){cylinder('Planter',x,y+.3*scale,z,.62*scale,.6*scale,stone,.8*scale);const crown=MeshBuilder.CreateSphere('Indoor foliage',{diameter:1.15*scale,segments:8},scene);crown.position.set(x,y+1.1*scale,z);crown.scaling.y=1.5;crown.material=leaf;crown.isPickable=false;}
 function tree(x:number,z:number,s=1){cylinder('Olive trunk',x,1.4*s,z,.27*s,2.8*s,wood,.18*s);for(const [dx,dz,dy] of [[0,0,3.6],[-.7,.2,3.2],[.6,-.4,3.3]]){const c=MeshBuilder.CreateSphere('Olive crown',{diameter:2.6*s,segments:8},scene);c.position.set(x+dx*s,dy*s,z+dz*s);c.scaling.y=.8;c.material=leaf;c.isPickable=false;shadows.addShadowCaster(c);}}
 function bed(r:Room){const y=r.floor*STOREY;const x=r.master?-4.8:r.x+(r.x<0?1.2:-.7),z=r.master?16.8:r.depth<=6?r.z+.2:r.z-.8;
  box('Bedroom rug',x,y+.02,z+1,4,.025,4.8,white);
  box('Bed plinth',x,y+.23,z,2.25,.4,2.6,wood);box('Linen mattress',x,y+.54,z,2.18,.3,2.55,white);box('Duvet',x,y+.74,z+.25,2.2,.13,1.9,cloth);box('Upholstered headboard',x,y+.83,z-1.37,2.8,1.55,.15,cloth);
  for(const a of [-1,1]){box('Pillow',x+a*.55,y+.78,z-.9,.85,.18,.48,white);box('Bedside cabinet',x+a*1.75,y+.36,z-1,.65,.7,.6,wood);cylinder('Bedside lamp',x+a*1.75,y+.95,z-1,.33,.4,white);}
  if(['suite-1','suite-4','suite-5'].includes(r.id))box('Wardrobe',r.x,y+1.35,r.z-r.depth/2+.55,2.7,2.7,.6,wood,true);
  else if(!r.master)box('Wardrobe',r.x+Math.sign(r.x)*(r.width/2-.55),y+1.35,r.z-r.depth/2+1.65,.6,2.7,2.7,wood,true);
 }
 function bathroom(r:Room){const y=r.floor*STOREY,{x,z,w,d}=ensuiteRect(r);
  box('Ensuite applied finish',x,y+LEVEL.finish,z,w,.002,d,stone);
  for(const side of [-1,1])panel('Ensuite side',x+side*w/2,z,.12,d,y,3.2);
  panel('Ensuite back',x,z+d/2,w,.12,y,3.2);
  wallOpening('Ensuite partition',x,z-d/2,w,'x',y,{offset:-.25,width:1.2,sill:0,head:2.7},plaster,false,.12);
  door(r.name+' bathroom',x-.85,y,z-d/2,1.2,'x');
  box('Vanity',x+1,y+.45,z-.6,.65,.9,1.1,wood,true);box('Stone basin',x+1,y+.95,z-.6,.68,.12,1.1,white);box('Mirror',x+1.46,y+1.7,z-.6,.02,1.1,.9,glass);
  cylinder('Toilet pedestal',x-.9,y+.23,z+.7,.42,.45,white);const bowl=MeshBuilder.CreateSphere('Toilet bowl',{diameter:.56,segments:12},scene);bowl.position.set(x-.9,y+.43,z+.6);bowl.scaling.set(1,.4,1.3);bowl.material=white;box('Toilet cistern',x-.9,y+.65,z+1.15,.55,.65,.18,white);
  box('Shower tray',x+.55,y+.06,z+.75,1.3,.1,1.3,white);box('Shower glazing',x-.15,y+1.1,z+1,.02,2.2,.8,glass,true);box('Rain shower',x+.55,y+2.4,z+1.2,.32,.04,.32,dark);
 }
 function furnish(r:Room){const y=r.floor*STOREY;
  if(r.kind==='bedroom'){bed(r);bathroom(r);}
  if(r.kind==='office'){table(r.x,y,r.z,2.6,1.2);sofa(r.x,y,r.z+1.8);box('Bookshelf',r.x,y+1.4,r.z+2.65,4,2.8,.5,wood);for(let i=0;i<3;i++)box('Bookshelf shelf',r.x,y+.4+i*.8,r.z+2.35,3.8,.05,.6,dark);box('Desk monitor',r.x,y+1.2,r.z+.25,1,.65,.05,dark);}
  if(r.kind==='gym'){for(let i=0;i<1;i++){box('Treadmill deck',r.x-.35+i*2.6,y+.15,r.z,1.1,.3,2.1,dark);box('Treadmill upright',r.x-.35+i*2.6,y+.8,r.z+.8,.1,1.3,.1,dark);box('Treadmill console',r.x-.35+i*2.6,y+1.4,r.z+.8,.75,.12,.35,black);}box('Exercise mat',r.x,y+.03,r.z+2.2,2,.04,1,cloth);box('Gym mirror',r.x,y+1.7,r.z-r.depth/2+.15,3,2.3,.03,glass);}
  if(r.kind==='cinema'){box('Cinema carpet',r.x,y+.02,r.z,r.width-.3,.03,r.depth-.3,black);box('Cinema screen frame',r.x+3.8,y+1.9,r.z,.12,2.7,5.2,dark);const screen=mat('Projection surface','#9aaeb3');screen.emissiveColor=new Color3(.13,.18,.2);box('Projection screen',r.x+3.72,y+1.9,r.z,.02,2.35,4.8,screen);sofa(r.x+.8,y,r.z+1,-Math.PI/2,black);sofa(r.x-1.8,y,r.z+1,-Math.PI/2,black);}
  if(r.kind==='lounge'){sofa(r.x,y,r.z+1);table(r.x,y-.3,r.z-1,1.8,1);}
  plant(r.x+Math.sign(r.x)*(r.width/2-1),y,r.z-r.depth/2+1,.85);
 }
 // One acre at the approved exterior datum. The open arrival court replaces every roundabout element.
 const grade=LEVEL.site,edge=SITE_SIDE/2;
 const paving=disjoint([SITE.forecourt,SITE.garageApron,SITE.gateApproach]);
 const gardenHardscape=[{x:-5,z:28,w:18,d:6},{x:13,z:26,w:7,d:7},{x:-19,z:9,w:2,d:35},{x:18,z:17,w:2,d:23}];
 // Paving and lawn have mutually exclusive top surfaces; no coplanar grass under the arrival court.
 for(const r of disjoint([{x:0,z:0,w:SITE_SIDE,d:SITE_SIDE}],[...paving,...gardenHardscape,SITE.garage]))slab('Garden lawn',r.x,r.z,r.w,r.d,grade,grass);
 for(const r of disjoint([{x:0,z:0,w:250,d:250}],[{x:0,z:0,w:SITE_SIDE,d:SITE_SIDE}]))slab('Surrounding ground',r.x,r.z,r.w,r.d,grade-.06,grass);
 panel('West perimeter',-edge,0,.3,SITE_SIDE,grade,3,stone);panel('East perimeter',edge,0,.3,SITE_SIDE,grade,3,stone);panel('Rear perimeter',0,edge,SITE_SIDE,.3,grade,3,stone);
 panel('Front west wall',(-edge-3.5)/2,-edge,edge-3.5,.3,grade,3,stone);panel('Front east wall',(edge+8)/2,-edge,edge-8,.3,grade,3,stone);panel('Gate divider',5.2,-edge,2.6,.45,grade,3.5,dark);
 door('Vehicle gate',-3.5,grade,-edge,7,'x',dark,true);door('Pedestrian gate',6.5,grade,-edge,1.5,'x',wood);
 for(const x of [-3.7,3.7,6.3,8.2])panel('Gate pillar',x,-edge,.4,.6,grade,3.5,dark);
 for(const r of paving)slab('Open stone-paved arrival court',r.x,r.z,r.w,r.d,grade,asphalt);
 // One finished datum; disjoint plates eliminate overlapping floor tops and false steps.
 const exterior=mat('Concealed warm light','#ffe0a3');exterior.disableLighting=true;exterior.emissiveColor=Color3.FromHexString('#ffe0a3');
 const plate=(name:string,r:Rect,y:number,m=floor)=>slab(name,r.x,r.z,r.w,r.d,y,m);
 for(const r of disjoint(groundPlates,SOCIAL.floorAreas))plate('Continuous floor 0',r,LEVEL.ground);
 for(const r of SOCIAL.floorAreas)plate('Continuous social porcelain floor',r,LEVEL.ground,interior.porcelain);
 for(const [level,plates] of [[1,upperPlates],[2,roofPlates]] as const)for(const r of plates)plate('Continuous floor '+level,r,level*STOREY,level===2?stone:floor);
 for(const e of outline(groundPlates)){const atSteps=Math.abs(e.z+8)<.001&&e.x>.5&&e.x<9;box('Raised house plinth',e.x,grade/2,e.z,e.w,-grade,e.d,stone,!atSteps,true);}
 for(const landing of stairLandings)plate('Return stair landing',landing,landing.y,stone);
 // Wall faces use one opening component for walls, windows and working doors.
 function passage(name:string,x:number,z:number,length:number,along:'x'|'z',base:number,offset:number,width=1.4,m=wood,sliding=false){
  wallOpening(name+' surround',x,z,length,along,base,{offset,width,sill:0,head:2.8},plaster,false);
  return door(name,x+(along==='x'?offset-width/2:0),base,z+(along==='z'?offset-width/2:0),width,along,m,sliding);
 }
 // Full-height protected-side glazing, with fixed sidelights and an animated door.
 function glazedPassage(name:string,x:number,z:number,length:number,along:'x'|'z',base:number,offset:number,width:number){
  const segment=(label:string,a:number,b:number,bottom:number,height:number,m:StandardMaterial)=>{
   if(b-a<.001)return;const c=(a+b)/2;
   panel(name+' '+label,x+(along==='x'?c:0),z+(along==='z'?c:0),along==='x'?b-a:.06,along==='z'?b-a:.06,base+bottom,height,m);
  };
  segment('head',-length/2,length/2,3.7,.5,plaster);
  for(const [a,b] of [[-length/2,offset-width/2],[offset+width/2,length/2]]){
   segment('fixed glass',a,b,0,3.7,glass);
   for(const t of [a,b])segment('mullion',t-.025,t+.025,0,3.7,dark);
  }
  segment('transom',offset-width/2,offset+width/2,2.7,1,glass);
  segment('door head',offset-width/2,offset+width/2,2.7,.055,dark);
  return door(name,x+(along==='x'?offset-width/2:0),base,z+(along==='z'?offset-width/2:0),width,along,glass,true);
 }
 for(const r of rooms){
  const y=r.floor*STOREY,rect=roomRect(r),e=roomEntry(r);
  // Kitchen has no dividing wall or door to the dining room.
  if(r.kind==='kitchen')continue;
  const faces=[{x:r.x-r.width/2,z:r.z,n:r.depth,axis:'z' as const},{x:r.x+r.width/2,z:r.z,n:r.depth,axis:'z' as const},{x:r.x,z:r.z-r.depth/2,n:r.width,axis:'x' as const},{x:r.x,z:r.z+r.depth/2,n:r.width,axis:'x' as const}];
  for(const [i,f] of faces.entries()){
   if(i===2&&(r.id==='cinema'||r.id==='lounge'||r.id==='gym'))continue;
   const entry=f.axis===e.along&&(f.axis==='x'?Math.abs(f.z-e.z):Math.abs(f.x-e.x))<.01;
   if(entry&&r.id==='suite-3'){glazedPassage(r.name,f.x,f.z,f.n,f.axis,y,e.x+e.width/2-f.x,e.width);continue;}
   if(entry){const leaf=passage(r.name,f.x,f.z,f.n,f.axis,y,(e.along==='x'?e.x+e.width/2-f.x:e.z+e.width/2-f.z),e.width);if(i===2)leaf.swing=-1;continue;}
   // Shared transverse walls are drawn once, by the room in front.
   const neighbor=rooms.find(q=>q!==r&&q.floor===r.floor&&i===2&&Math.abs(q.z+q.depth/2-f.z)<.01&&q.x-q.width/2<r.x+r.width/2&&q.x+q.width/2>r.x-r.width/2);
   if(neighbor){
    const left=r.x-r.width/2,right=r.x+r.width/2,nl=neighbor.x-neighbor.width/2,nr=neighbor.x+neighbor.width/2;
    if(nl>left)panel(r.name+' stepped return',(left+nl)/2,f.z,nl-left,.24,y,STOREY);
    if(nr<right)panel(r.name+' stepped return',(nr+right)/2,f.z,right-nr,.24,y,STOREY);
    continue;
   }
   if(r.id==='lounge'&&i===3){passage('Courtyard viewing alcove',f.x,f.z,f.n,f.axis,y,-1.75,1.2);continue;}
   const outer=(i===0&&r.x<0)||(i===1&&r.x>0),rear=i===3&&(r.id==='suite-2'||r.master||r.id==='suite-5');
   if(rear&&r.floor){glazedPassage(r.name+' balcony',f.x,f.z,f.n,f.axis,y,r.x<0?2:-2,2.2);continue;}
   if(outer)continue; // Authored as continuous elevations below, independently of rooms.
   if(rear){
    wallOpening(r.name+' garden aperture',f.x,f.z,f.n,f.axis,y,{offset:outer?-.6:1.8,width:Math.min(f.n-2,r.kind==='cinema'?2:4.8),sill:r.kind==='cinema'?2.5:.85,head:3.5},plaster,true,.36);
   }else panel(r.name+' partition',f.x,f.z,f.axis==='x'?f.n:.24,f.axis==='z'?f.n:.24,y,STOREY);
  }
  zone(r.name,r.x,y,r.z,r.width,r.depth);furnish(r);
 }
 // Deliberate elevation layer: no per-room automatic side windows.
 for(const face of sideWalls){
  const material=face.material==='stone'?stone:plaster;let cursor=face.from;
  for(const opening of face.openings){
   const lo=opening.at-opening.width/2,hi=opening.at+opening.width/2;
   if(lo>cursor)panel(face.name+' solid',face.x,(cursor+lo)/2,ENVELOPE.wallDepth,lo-cursor,face.level,STOREY,material);
   wallOpening(face.name+' recess',face.x,opening.at,opening.width,'z',face.level,{offset:0,width:opening.width,sill:opening.sill,head:opening.head},material,!opening.door,ENVELOPE.wallDepth,face.inset);
   if(opening.door){
    const gx=face.x+face.inset;
    door(opening.door,gx,face.level,lo,opening.width,'z',glass,true);
    panel(face.name+' door transom',gx,opening.at,.06,opening.width,face.level+2.7,opening.head-2.7,glass);
    for(const z of [lo,hi])box(face.name+' door jamb',gx,face.level+opening.head/2,z,.055,opening.head,.055,dark);
    for(const h of [2.7,opening.head])box(face.name+' door rail',gx,face.level+h,opening.at,.055,.055,opening.width,dark);
   }
   cursor=hi;
  }
  if(cursor<face.to)panel(face.name+' solid',face.x,(cursor+face.to)/2,ENVELOPE.wallDepth,face.to-cursor,face.level,STOREY,material);
 }
 // Occupied recesses retain the existing slab; room envelopes move inward to form useful terraces.
 const west=ENVELOPE.westLoggia,east=ENVELOPE.eastLoggia;
 function loggia(name:string,r:Rect,outside:number,inside:number,material:StandardMaterial){
  const roofEdge=LEVEL.roof-.22,soffit=roofEdge-ENVELOPE.edgeDepth/2-.01;
  panel(name+' privacy parapet',outside,r.z,.35,r.d,LEVEL.upper,ENVELOPE.guard,material);
  for(const z of [r.z-r.d/2,r.z+r.d/2])panel(name+' supporting pier',outside,z,.5,.5,0,LEVEL.roof,material);
  box(name+' deep roof edge',outside+Math.sign(inside-outside)*.35,roofEdge,r.z,.9,ENVELOPE.edgeDepth,r.d,plaster,true,true);
  box(name+' protected oak soffit',r.x,soffit,r.z,r.w-.4,.025,r.d-.5,wood);
  zone(name,r.x,LEVEL.upper,r.z,r.w,r.d,false);
  box(name+' warm wall wash',inside+Math.sign(outside-inside)*.3,soffit-.025,r.z,.025,.025,r.d-1,exterior);
 }
 loggia('West loggia',west,west.x-west.w/2,west.x+west.w/2,stone);
 loggia('East loggia',east,east.x+east.w/2,east.x-east.w/2,plaster);
 panel('East loggia front return',east.x,east.z-east.d/2,east.w,.35,LEVEL.upper,ENVELOPE.guard,plaster);
 panel('East loggia north cheek',east.x,east.z+east.d/2,east.w,.35,LEVEL.upper,STOREY,stone);
 // Base planes and upper soffits turn the major front corners.
 box('West loggia corner soffit',-12.7,8.13,-3.9,.6,.025,2,wood);
 // Private bedroom corridor is screened from living; access is off the foyer and dining circulation.
 const portal=ENVELOPE.foyerPortal;
 wallOpening('Open stair portal',portal.x,portal.z,portal.length,'z',LEVEL.ground,{offset:0,width:portal.width,sill:0,head:portal.head},stone,false,.36);
 // Privacy begins beyond the stair: the foyer can see the flights without a corridor door.
 passage('Bedroom hall privacy',-1,2.7,2,'x',0,0,1.4,wood,true);
 for(const f of [0,1]){
  panel('Living media spine',0,ARCH.livingVoid.z,.3,ARCH.livingVoid.d,f*STOREY,STOREY,stone);
  passage(f?'Upper private gallery':'Garden private hall',0,18,4,'z',f*STOREY,f?-.9:-.7,1.5);
  panel('West hall garden end',-1,20,2,.24,f*STOREY,STOREY);
 }
 // Enclosed kitchen and pantry, with the whole west edge open to dining.
 wallOpening('Kitchen garden glazing',13,20,8,'x',0,{offset:-1.4,width:4,sill:.1,head:3.5},plaster,true,.32);

 const pantry=ARCH.pantry;
 panel('Pantry side',pantry.x-pantry.w/2,pantry.z,.16,pantry.d,0,3.8);
 panel('Pantry back',pantry.x,pantry.z+pantry.d/2,pantry.w,.16,0,3.8);
 passage('Enclosed pantry',pantry.x,pantry.z-pantry.d/2,pantry.w,'x',0,-.25,1.2);
 for(const z of [17.2,18.2,19.2])box('Pantry shelving',16.3,1.3,z,.6,2.6,.8,wood,true);
 // A discrete powder room reached from the front private vestibule, away from dining.
 const powder=ARCH.powder;
 panel('Powder west',powder.x-powder.w/2,powder.z,.16,powder.d,0,3.5);
 passage('Guest half bathroom',powder.x+powder.w/2,powder.z,powder.d,'z',0,0,1.1);
 cylinder('Powder toilet',-11.8,.25,-4.3,.55,.5,white);box('Powder basin',-10.5,.85,-4.65,.8,.18,.45,white);
 // Primary dressing room is separate and generous; the bedroom door enters a clear vestibule.
 const dressing=ARCH.wardrobe;
 passage('Primary walk-in closet',dressing.x+dressing.w/2,dressing.z,dressing.d,'z',STOREY,0,1.3);
 panel('Dressing rear partition',dressing.x,dressing.z+dressing.d/2,dressing.w,.16,STOREY,3.8);
 for(const z of [dressing.z-dressing.d/2+.4,dressing.z+dressing.d/2-.4])box('Walk-in storage',dressing.x,STOREY+1.4,z,dressing.w-.5,2.8,.6,wood,true);
 // Compact courtyard: fully enclosed glazing, flush thresholds and a perimeter slot drain.
 plate('Courtyard terrace',ARCH.courtyard,LEVEL.ground,stone);
 glazedPassage('Courtyard from living',9,7.5,5,'z',0,-1,1.6);
 glazedPassage('Courtyard from kitchen',11.25,10,4.5,'x',0,-.45,1.6);
 wallOpening('Courtyard south glazing',11.25,5,4.5,'x',0,{offset:0,width:3.8,sill:.08,head:3.7},plaster,true);
 // Gym's west wall forms the east enclosure; a clerestory maintains privacy.
 for(const f of [1]){
  wallOpening('Courtyard upper west',9,7.5,5,'z',f*STOREY,{offset:0,width:4.2,sill:.1,head:3.7},plaster,true);
  wallOpening('Courtyard upper south',11.25,5,4.5,'x',f*STOREY,{offset:0,width:3.8,sill:.1,head:3.7},plaster,true);
  wallOpening('Courtyard upper east',13.5,7.5,5,'z',f*STOREY,{offset:0,width:3.8,sill:1.2,head:3.5},plaster,true);
  // Upper suite's front party wall encloses the north edge.
 }
 for(const x of [9.18,13.32])box('Courtyard slot drain',x,.001,7.5,.035,.006,4.64,dark);
 for(const z of [5.18,9.82])box('Courtyard slot drain',11.25,.001,z,4.14,.006,.035,dark);
 sofa(11.5,0,5.9,Math.PI);sofa(12.85,0,8.3,Math.PI/2);table(11.5,-.35,7.7,1.15,.8);plant(9.6,0,9.4,.8);
 // Courtyard furniture stays outside the two threshold paths.
 // Living, dining and kitchen share one continuous finished floor and a clear rear social axis.
 zone('Foyer',4.5,0,-2,8.6,5.6);
 furnishSocial({scene,obstacles,box,cylinder,zone,castShadow:mesh=>shadows.addShadowCaster(mesh)},interior);
 // A side gallery connects the front landing to a guarded rear overlook.
 const voidRect=ARCH.livingVoid;
 for(const z of [voidRect.z-voidRect.d/2,voidRect.z+voidRect.d/2]){
  panel('Living overlook guard',voidRect.x,z,voidRect.w,.055,STOREY,1.1,glass);
  box('Overlook rail cap',voidRect.x,STOREY+1.1,z,voidRect.w,.045,.065,dark);
 }
 const galleryEdge=voidRect.x+voidRect.w/2;
 panel('East living void guard',galleryEdge,voidRect.z,.055,voidRect.d,STOREY,1.1,glass);
 box('East overlook rail cap',galleryEdge,STOREY+1.1,voidRect.z,.065,.045,voidRect.d,dark);
 sofa(2,STOREY,-.8,0);
 zone('Living overlook gallery',ARCH.overlook.x,STOREY,ARCH.overlook.z,8.6,1.6);
 glazedPassage('Upper garden terrace',4.5,ARCH.rearTerrace.z-ARCH.rearTerrace.d/2,9,'x',STOREY,1.3,2.4);

 // Approved front: carved travertine left wing, dark light slot, walnut-lined ivory entrance.
 const left=FRONT.left,frame=FRONT.frame,entry=SITE.entrance;
 const centre=(left.minX+left.maxX)/2;
 // Two tall ground-floor slits; a continuous stone base spans behind the upper recess.
 let cursor=left.minX;
 for(const x of [-10.7,-8.3]){
  const width=.55,lo=x-width/2;
  panel('Travertine front solid',(cursor+lo)/2,left.faceZ,lo-cursor,.55,0,STOREY,stone);
  wallOpening('Tall front slit',x,left.faceZ,width,'x',0,{offset:0,width,sill:.35,head:3.55},stone,true,.55,.23);
  cursor=x+width/2;
 }
 panel('Travertine front solid',(cursor+left.maxX)/2,left.faceZ,left.maxX-cursor,.55,0,STOREY,stone);
 box('Travertine floor-edge facing',centre,STOREY-.12,left.faceZ-.02,left.maxX-left.minX,.24,.035,stone);
 // Upper balcony frame, with the rail well inside the front plane.
 panel('Left balcony stone west jamb',(left.minX+left.openingMin)/2,-4.9,left.openingMin-left.minX,3.8,STOREY,4.75,stone);
 panel('Left balcony stone east jamb',(left.openingMax+left.maxX)/2,-6,(left.maxX-left.openingMax),1.6,STOREY,4.75,stone);
 for(const r of disjoint([{x:centre,z:-5,w:left.maxX-left.minX,d:3.6}],[ENVELOPE.stairTower]))box('Left balcony stone head',r.x,8.48,r.z,r.w,.94,r.d,stone,true,true);
 panel('Left inset glass railing',(left.openingMin+left.openingMax)/2,-6.25,left.openingMax-left.openingMin,.055,STOREY,1.05,glass);
 box('Left balcony walnut soffit',-9.1,7.99,-4.9,5.8,.035,3.5,wood);
 box('Left balcony concealed glow',-9.1,7.95,-3.25,5.4,.025,.035,exterior);
 zone('Travertine balcony',-9.2,STOREY,-4.8,5.6,2.8,false);
 function balconyChair(x:number,z:number){
  const y=LEVEL.upper;
  box('Balcony chair walnut frame',x,y+.3,z,1,.4,.9,wood,true);
  box('Balcony chair seat',x,y+.54,z,.88,.16,.76,white);
  box('Balcony chair back',x,y+.9,z+.34,.94,.7,.14,white);
  for(const side of [-1,1])box('Balcony chair arm',x+side*.48,y+.65,z,.08,.18,.9,wood);
 }
 balconyChair(-10.8,-4.7);balconyChair(-7.2,-4.7);balconyChair(7.5,-4.6);
 // One dark vertical recess lights the hall without repeating punched street windows.
 for(const f of [0,1])wallOpening('Dark stair daylight slot',-1.1,-5.15,2.2,'x',f*STOREY,{offset:0,width:1.3,sill:.12,head:4.05},stone,true,.5,.15);
 for(let x=-1.72;x<=-.48;x+=.16)box('Bronze slot screen',x,4.3,-5.48,.055,8.4,.16,dark);
 box('Recessed vertical light',-1.1,4.3,-5.38,.07,7.9,.035,exterior);
 // Keep the stair street enclosure behind the travertine plane; its narrow window borrows light from the slot.
 panel('Stair front closure',-4.1,-5,3.8,.3,0,LEVEL.roof,stone);
 // Quiet east front stays predominantly solid; side loggia and courtyard provide light.
 for(const f of [0,1])panel('Quiet ivory street plane',13.2,-3,7.6,.48,f*STOREY,STOREY,plaster);
 // Animated paired timber doors, with a shared interaction group.
 wallOpening('Double entrance surround',4.5,entry.z,9,'x',0,{offset:entry.x-4.5,width:entry.width,sill:0,head:3.15},plaster,false,.48);
 for(const i of [0,1]){
  const leaf=door('Front entrance '+(i?'right':'left'),entry.x-entry.width/2+i*entry.width/2,0,entry.z,entry.width/2,'x',entryWood,false,!!i,3.15);leaf.group='Front entrance';
 }
 // Glazed upper gallery doors open onto the actual balcony above the veranda.
 glazedPassage('Entrance balcony',4.5,-3,9,'x',STOREY,1,2.6);
 panel('Entrance balcony inset glass',4.8,-6.2,7.5,.055,STOREY,1.05,glass);
 for(const x of [.85,8.75])panel('Entrance balcony side rail',x,-4.6,.055,3.2,STOREY,1.05,glass);
 // Veranda and balcony are supported by deep side walls, with walnut lining on all sheltered interior faces.
 for(const x of [frame.minX+frame.thickness/2,frame.maxX-frame.thickness/2])panel('Ivory entrance frame pier',x,(frame.frontZ+frame.backZ)/2,frame.thickness,frame.backZ-frame.frontZ,grade,frame.top-grade,plaster);
 box('Ivory entrance frame head',4.8,8.83,-5.5,9.6,1.34,5,plaster,true,true);
 for(const x of [.87,8.73])box('Walnut entrance lining',x,4.05,-5.5,.035,8.1,4.8,wood);
 box('Walnut entrance soffit',4.8,8.13,-5.5,7.9,.035,4.8,wood);
 box('Veranda balcony fascia',4.8,STOREY-.25,-6.4,7.9,.5,.3,plaster,true,true);
 box('Veranda walnut canopy',4.8,3.91,-5.7,7.9,.035,1.35,wood);
 for(const x of [1.2,8.35])box('Entrance recessed warm seam',x,4,-5.45,.035,7.7,.035,exterior);
 for(const x of [4.05,7])box('Door downlight',x,3.65,-5.35,.12,.04,.16,exterior);
 zone('Arrival veranda',5.5,.1,-6.2,7.8,2.8,false);
 // Seating occupies the left of the veranda; the paired-door approach stays clear.
 sofa(2.25,0,-6.15,0,white);table(2.25,-.25,-7.3,1,.55);
 for(const x of [.25,9.35]){
  box('Veranda planter edge',x,grade+.55,-8.9,.55,1.1,2.5,plaster,true,true);
  plant(x,grade+1.1,-8.2,.65);
 }
 for(const x of [1.2,8.5])plant(x,0,-7.1,.8);
 glazedPassage('Rear garden doors',4.5,20,9,'x',0,2,2.4);
 slab('Rear social terrace',4.5,22,9,4,LEVEL.ground,stone);
 // Exterior risers are shallow and regular; continuous movement ramps use these same dimensions.
 for(const [index,s] of approachStairs.entries())for(let i=0;i<s.steps;i++){
  const p=stairPoint(s,(i+.5)/s.steps),top=s.base+(i+1)*s.rise/s.steps,front=p.z-s.direction*s.d/s.steps/2;
  box(index?'Garden access tread':'Veranda approach tread',p.x,(top+grade)/2,p.z,s.w,top-grade,s.d/s.steps,stone,false,true);
  if(!index)box('Concealed step-edge light',p.x,top-.035,front-s.direction*.012,s.w-.18,.025,.025,exterior);
 }
 // Sculptural return stair: four real flights, two intermediate landings, no unrelated ramps.
 for(const s of stairs){
  for(let i=0;i<s.steps;i++){
   const t=(i+.5)/s.steps,p=stairPoint(s,t),h=s.base+(i+1)/s.steps*s.rise;
   box('Return stair tread',p.x,h-.075,p.z,s.w,.15,s.d/s.steps,stone,false,true);
   box('Return stair riser',p.x,h-s.rise/s.steps/2,p.z-s.direction*s.d/s.steps/2,s.w,s.rise/s.steps,.035,stone);
  }
  for(const side of [-1,1]){
   const stringer=box('Stair structural stringer',s.x+side*(s.w/2-.14),s.base+s.rise/2-.25,s.z,.12,.22,Math.hypot(s.d,s.rise),dark,false,true);stringer.rotation.x=-s.direction*Math.atan2(s.rise,s.d);
   const x=s.x+side*(s.w/2+.025),rail=box('Continuous stair handrail',x,s.base+s.rise/2+1,s.z,.065,.065,Math.hypot(s.d,s.rise),dark);
   rail.rotation.x=-s.direction*Math.atan2(s.rise,s.d);
   for(let i=0;i<24;i++){const t=(i+.5)/24,p=stairPoint(s,t);box('Stair vertical baluster',x,p.y+.5,p.z,.025,1,.025,dark);obstacles.push({name:'Stair sloping guard',x,z:p.z,w:.04,d:s.d/24,bottom:p.y,top:p.y+1.05});}
  }
 }
 for(const l of stairLandings){panel('Stair landing north guard',-4,2.4,3.9,.06,l.y,1.1,glass);for(const x of [-5.95,-2.05])panel('Stair landing side guard',x,1.5,.06,1.8,l.y,1.1,glass);}
 for(const y of [STOREY,STOREY*2]){
  for(const x of [-5.95,-2.05])panel('Stair floor edge guard',x,-.6,.05,6,y,1.1,glass);
  panel('Stair floor north guard',-4,2.4,3.9,.05,y,1.1,glass);
  // Front landing opens only to the arriving (east) flight; west flight opening is guarded.
  if(y===LEVEL.roof)panel('Stair arrival front guard',-5.1,-3.6,1.8,.05,y,1.1,glass);
 }
 // Sheltered balconies and carved rear terrace, each with actual supporting posts.
 for(const b of balconies){
  for(const x of [b.x-b.w/2,b.x+b.w/2]){panel('Balcony support',x,b.z+b.d/2,.45,.45,0,8.4,plaster);panel('Balcony side guard',x,b.z,.06,b.d,STOREY,1.1,glass);}
  panel('Balcony front guard',b.x,b.z+b.d/2,b.w,.06,STOREY,1.1,glass);
  box('Balcony deep roof edge',b.x,8.22,b.z,b.w,.55,b.d,plaster,true,true);
  box('Balcony oak soffit',b.x,7.935,b.z,b.w-.65,.025,b.d-.35,wood);
  box('Balcony concealed rear light',b.x,7.9,b.z-b.d/2+.24,b.w-.9,.025,.025,exterior);sofa(b.x,STOREY,b.z,Math.PI);
 }
 panel('Upper garden terrace guard',4.5,20,9,.06,STOREY,1.1,glass);
 for(const x of [0,9])panel('Garden terrace side',x,ARCH.rearTerrace.z,.06,ARCH.rearTerrace.d,STOREY,1.1,glass);
 for(const x of [.2,8.8])panel('Garden portico support',x,19.8,.3,.3,0,8.4,stone);
 box('Garden portico deep lintel',4.5,8.35,19.6,9.6,.55,1.4,plaster,true,true);
 sofa(3,STOREY,19.3,Math.PI);plant(7.8,STOREY,19.3,.8);
 for(const e of outline(roofPlates)){
  const stairEdge=e.x>=-6.01&&e.x<=-2&&e.z>=-3.61&&e.z<=2.41;
  const frontFrame=e.z<-3&&(e.x<-2.2||e.x>=0&&e.x<9.6);
  if(stairEdge||frontFrame)continue;
  const court=e.x>=8.99&&e.x<=13.51&&e.z>=4.99&&e.z<=10.01;
  const guardHeight=e.z<0?(e.x<0?.55:e.x>9.6?.65:1.1):1.1;
  panel('Roof perimeter guard',e.x,e.z,e.w,e.d,LEVEL.roof,guardHeight,court||e.z>=13.99?glass:plaster);
 }
 // Stone stair enclosure grows from the arrival blade; glazed east exit opens onto the roof.
 const tower=ENVELOPE.stairTower,towerHeight=ENVELOPE.towerTop-LEVEL.roof;
 box('Stair tower roof',tower.x,ENVELOPE.towerTop+.13,tower.z,tower.w,.26,tower.d,plaster,true,true);
 panel('Stair tower west',tower.x-tower.w/2,tower.z,.32,tower.d,LEVEL.roof,towerHeight,plaster);
 panel('Stair tower front',tower.x,tower.z-tower.d/2,tower.w,.32,LEVEL.roof,towerHeight,plaster);
 panel('Stair tower rear',tower.x,tower.z+tower.d/2,tower.w,.18,LEVEL.roof,towerHeight,glass);
 door('Rooftop stair enclosure',-1.8,LEVEL.roof,-4.6,1.4,'z',glass,true,false,2.2);
 panel('Tower exit header',-1.8,-3.9,.18,1.4,LEVEL.roof+2.2,towerHeight-2.2,plaster);
 panel('Tower east front jamb',-1.8,-4.95,.18,.7,LEVEL.roof,towerHeight,plaster);
 panel('Tower east glazing',-1.8,0,.06,6.4,LEVEL.roof,towerHeight,glass);
 for(const x of [10,16])for(const z of [12,18])panel('Rooftop pergola post',x,z,.12,.12,LEVEL.roof,2.6,dark);
 for(let z=12;z<=18;z+=.45)box('Pergola slat',13,11,z,6.2,.15,.09,wood,true,true);
 sofa(13,LEVEL.roof,16);table(13,LEVEL.roof-.35,14.5,2,1);
 // Protected rear garden remains at exterior grade, reached by its own shallow stair.
 const pool={x:-5,z:28,w:11.5,d:4};
 for(const r of disjoint([{x:-5,z:28,w:18,d:6}],[pool]))slab('Pool terrace',r.x,r.z,r.w,r.d,grade,stone);
 for(const r of disjoint([{x:-5,z:28,w:12,d:4.5}],[pool]))box('Pool coping',r.x,grade+.06,r.z,r.w,.12,r.d,white);
 const tile=mat('Pool tile','#387a7a');box('Pool floor',pool.x,grade-1.3,pool.z,pool.w,.15,pool.d,tile);
 for(const e of outline([pool]))box('Pool inner wall',e.x,grade-.65,e.z,e.w,1.3,e.d,tile);
 box('Pool water surface',pool.x,grade-.15,pool.z,pool.w,.025,pool.d,water);
 obstacles.push({name:'Pool edge',x:-5,z:28,w:11.5,d:4,bottom:grade,top:grade+.6});
 for(const x of [-11,-8,-5,-2]){box('Pool lounger',x,grade+.4,25,.9,.3,1.8,white);const back=box('Lounger back',x,grade+.65,25.65,.9,.08,.7,cloth);back.rotation.x=-.5;}
 slab('Gazebo deck',13,26,7,7,grade,wood);for(const x of [10,16])for(const z of [23,29])panel('Gazebo pillar',x,z,.18,.18,grade,3,dark);
 box('Gazebo canopy',13,grade+3.18,26,7.5,.22,7.5,plaster);sofa(13,grade,28);sofa(15,grade,26,-Math.PI/2);table(13,grade-.3,26,2,1.2);zone('Gazebo',13,grade-.6,26,6,6);
 // Detached garage: three west-facing bay mouths arranged north-south. Vehicles enter toward +X.
 const garage=SITE.garage,gx=SITE.garageDoorX,gh=SITE.garageHeight;
 slab('Garage slab',garage.x,garage.z,garage.w,garage.d,grade,stone);
 panel('Garage east back wall',garage.x+garage.w/2,garage.z,.3,garage.d,grade,gh,plaster);
 for(const z of [garage.z-garage.d/2,garage.z+garage.d/2])panel('Garage solid end wall',garage.x,z,garage.w,.3,grade,gh,plaster);
 box('Garage flat roof',garage.x,grade+gh+.14,garage.z,garage.w+.4,.28,garage.d+.4,plaster,true,true);
 for(const z of [garage.z-garage.d/2,garage.z+garage.d/2])panel('Garage parapet',garage.x,z,garage.w,.22,grade+gh+.28,.25,plaster);
 for(const x of [gx,garage.x+garage.w/2])panel('Garage parapet',x,garage.z,.22,garage.d,grade+gh+.28,.25,plaster);
 for(const [i,z] of SITE.garageBayCentres.entries()){
  const width=SITE.garageDoorWidth;
  wallOpening('Garage bay surround',gx,z,4,'z',grade,{offset:0,width,sill:0,head:2.7},plaster,false,.35,0,gh);
  door('Garage bay '+(i+1),gx+.08,grade,z-width/2,width,'z',dark,true);
  // A single reusable glow material supplies every fixture; no per-fixture real-time light.
  box('Garage wall sconce',gx-.2,grade+2.25,z-1.85,.1,.42,.1,dark);
  box('Garage warm sconce aperture',gx-.26,grade+2.25,z-1.85,.025,.28,.065,exterior);
  for(const zz of [z-1.7,z+1.7])box('Parking bay line',garage.x,grade+.008,zz,garage.w-.8,.012,.035,white);
 }
 zone('Garage arrival lighting',gx-1,grade-.7,garage.z,3,10,false);
 // Edge planting keeps the arrival court and all three garage approaches open.
 slab('West garden path',-19,9,2,35,grade,stone);slab('East garden path',18,17,2,23,grade,stone);
 for(const x of [-20,19])for(const z of [4,11,18]){cylinder('Path bollard',x,grade+.35,z,.12,.7,dark);cylinder('Bollard glow',x,grade+.68,z,.13,.1,exterior);}
 createLandscape(scene,grade);
 for(const [x,z] of [[-13,-9.2],[-9,-9.2],[-5,-9.2],[-1.8,-8.7],[11,-5.2],[16,-4.7],[-21,-17],[-21,-24],[30.6,-16],[30.6,-9]]){
  cylinder('Garden uplight housing',x,grade+.08,z,.19,.16,dark);
  cylinder('Garden warm aperture',x,grade+.165,z,.14,.015,exterior);
 }
 zone('Front planting and stone wash',-8.5,grade-1.8,-9,10,2,false);

 const setNight=(value:boolean)=>{night=value;sun.intensity=night?.18:1.15;sun.diffuse=Color3.FromHexString(night?'#a9c8ef':'#fff0d9');ambient.intensity=night?.36:.58;scene.clearColor=Color4.FromHexString(night?'#111e30ff':'#cbdde5ff');scene.fogColor=Color3.FromHexString(night?'#111e30':'#cbdde5');exterior.emissiveColor=Color3.FromHexString(night?'#ffcf83':'#8b8069');};
 const update=(dt:number,player:Vector3)=>{
  for(const d of doors){d.target=d.open?Math.PI/2:0;d.angle+=(d.target-d.angle)*Math.min(1,dt*7);if(d.slide){d.pivot.scaling.z=1-d.angle/(Math.PI/2)*.97;const base=d.pivot.metadata?.baseRotation??(d.pivot.metadata={baseRotation:d.pivot.rotation.y}).baseRotation;d.pivot.position.x=d.x+Math.sin(base)*d.angle/(Math.PI/2)*d.width;d.pivot.position.z=d.z+Math.cos(base)*d.angle/(Math.PI/2)*d.width;}else d.pivot.rotation.y=(d.pivot.metadata?.baseRotation??(d.pivot.metadata={baseRotation:d.pivot.rotation.y}).baseRotation)+d.angle*d.swing;}
  // At most four local lights are enabled; cove strips remain visible in other rooms.
  const nearest=zones.filter(q=>q.on).sort((a,b)=>Vector3.DistanceSquared(a.position,player)-Vector3.DistanceSquared(b.position,player)).slice(0,4);
  for(const q of zones){q.light.setEnabled(q.on&&nearest.includes(q));q.light.intensity=night?1.35:.35;q.material.emissiveColor=q.on?Color3.FromHexString('#ffdc99'):Color3.FromHexString('#39382f');}
 };
 // Batch static geometry by material and spatial cell; preserve moving doors and avatar.
 const batches=new Map<string,Mesh[]>();
 for(const m of [...scene.meshes]){if(!(m instanceof Mesh)||m.hasThinInstances||m.parent||!m.material)continue;const casts=shadows.getShadowMap()!.renderList!.includes(m);const key=[m.material.uniqueId,Math.floor(m.position.x/10),Math.floor(m.position.z/10),Math.floor(m.position.y/4.2),!!m.metadata?.solid,casts].join(':');const group=batches.get(key)||[];group.push(m);batches.set(key,group);}
 for(const group of batches.values()){if(group.length<2)continue;const solid=!!group[0].metadata?.solid,casts=shadows.getShadowMap()!.renderList!.includes(group[0]);for(const m of group)shadows.removeShadowCaster(m);const merged=Mesh.MergeMeshes(group,true,true);if(merged){merged.name='Static architectural batch';merged.isPickable=solid;merged.metadata={solid};merged.receiveShadows=merged.material!==glass;if(casts)shadows.addShadowCaster(merged);merged.freezeWorldMatrix();}}
 setNight(false);return {obstacles,surfaces,doors,zones,sun,ambient,shadows,setNight,update,meshCount:scene.meshes.length};
}
