import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent';
import {Scene} from '@babylonjs/core/scene';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {Color3,Color4} from '@babylonjs/core/Maths/math.color';
import {Vector3,Vector4} from '@babylonjs/core/Maths/math.vector';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {HemisphericLight} from '@babylonjs/core/Lights/hemisphericLight';
import {DirectionalLight} from '@babylonjs/core/Lights/directionalLight';
import {PointLight} from '@babylonjs/core/Lights/pointLight';
import {ShadowGenerator} from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture';
import {rooms, SITE_SIDE, STOREY, LEVEL, ARCH, stairs, stairLandings, stairPoint, groundPlates, upperPlates, roofPlates, balconies, outline, roomRect, roomEntry, ensuiteRect, type Rect, type Room, type Obstacle, type Surface} from './plan';

import {ENVELOPE,sideWalls} from './facades';

export interface Door {name:string; pivot:TransformNode; leaf:Mesh; open:boolean; angle:number; target:number; x:number; y:number; z:number; width:number; along:'x'|'z'; swing:number; slide?:boolean}
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
 const plaster=mat('Warm limestone plaster','#e4e5e1'),stone=mat('Travertine','#8c8981'),dark=mat('Charcoal aluminium','#252c30'),wood=mat('Smoked oak','#775b40'),floor=mat('Honed limestone floor','#bcb9b0',.06),oak=mat('Natural oak floor','#a5835e'),grass=mat('Garden lawn','#627359'),asphalt=mat('Driveway basalt','#535957'),water=mat('Pool water','#52a6a4',.8),white=mat('Ivory upholstery','#eee8db'),cloth=mat('Sage upholstery','#818d7c'),black=mat('Cinema charcoal','#242626'),leaf=mat('Olive canopy','#354b32',.02),brass=mat('Brushed brass','#b6a170',.5),soil=mat('Planting earth','#615343');
 water.alpha=.85;water.specularPower=128;
 const glass=mat('Smoked architectural glazing','#9eb9b5',.65);glass.alpha=.25;glass.backFaceCulling=false;
 if(!headless){
  const texture=(m:StandardMaterial,kind:'stone'|'wood'|'grass')=>{
   const t=new DynamicTexture(m.name+' surface',{width:256,height:256},scene,true);const ctx=t.getContext();
   ctx.fillStyle=m.diffuseColor.toHexString();ctx.fillRect(0,0,256,256);
   let seed=17;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
   for(let i=0;i<2000;i++){ctx.fillStyle=rand()>.5?'rgba(255,255,255,.055)':'rgba(0,0,0,.04)';ctx.fillRect(rand()*256,rand()*256,kind==='wood'?1:rand()*3,kind==='wood'?30+rand()*100:rand()*3);}
   t.update();t.uScale=kind==='grass'?10:2;t.vScale=kind==='grass'?10:2;m.diffuseTexture=t;m.diffuseColor=Color3.White();
  };texture(stone,'stone');texture(floor,'stone');texture(oak,'wood');texture(wood,'wood');texture(grass,'grass');
 }
 function box(name:string,x:number,y:number,z:number,w:number,h:number,d:number,m:StandardMaterial,solid=false,shadow=false){
  const uv=(a:number,b:number,wa:number,hb:number)=>new Vector4((a-wa/2)/3,(b-hb/2)/3,(a+wa/2)/3,(b+hb/2)/3);
  const b=MeshBuilder.CreateBox(name,{width:w,height:h,depth:d,faceUV:[uv(x,y,w,h),uv(x,y,w,h),uv(z,y,d,h),uv(z,y,d,h),uv(x,z,w,d),uv(x,z,w,d)]},scene);b.position.set(x,y,z);b.material=m;b.receiveShadows=m!==glass;b.isPickable=false;
  if(solid){obstacles.push({name,x,z,w,d,bottom:y-h/2,top:y+h/2});b.isPickable=true;b.metadata={solid:true};}if(shadow&&m!==glass)shadows.addShadowCaster(b);return b;
 }
 function cylinder(name:string,x:number,y:number,z:number,d:number,h:number,m:StandardMaterial,top=d){const b=MeshBuilder.CreateCylinder(name,{diameterBottom:d,diameterTop:top,height:h,tessellation:16},scene);b.position.set(x,y,z);b.material=m;b.isPickable=false;b.receiveShadows=true;return b;}
 function slab(name:string,x:number,z:number,w:number,d:number,y:number,m=floor){box(name,x,y-.12,z,w,.24,d,m,false,y>=STOREY);surfaces.push({name,x,z,w,d,y});}
 function panel(name:string,x:number,z:number,w:number,d:number,base:number,h=3.95,m=plaster){if(base+h<=LEVEL.roof+.001&&base+h>0&&Math.abs((base+h)/STOREY-Math.round((base+h)/STOREY))<.0001)h-=.24;return box(name,x,base+h/2,z,w,h,d,m,true,true);}
 function zone(name:string,x:number,y:number,z:number,w:number,d:number,ceiling=true){
  const lm=mat(name+' LEDs','#fff1c8');lm.emissiveColor=Color3.FromHexString('#ffdc99');lm.disableLighting=true;
  const strips=ceiling?[box(name+' cove west',x-w/2+.32,y+3.72,z,.025,.018,d-.64,lm),box(name+' cove east',x+w/2-.32,y+3.72,z,.025,.018,d-.64,lm),box(name+' cove north',x,y+3.72,z+d/2-.32,w-.64,.018,.025,lm),box(name+' cove south',x,y+3.72,z-d/2+.32,w-.64,.018,.025,lm)]:[];
  const light=new PointLight(name,new Vector3(x,y+3.25,z),scene);light.diffuse=Color3.FromHexString('#ffdfaa');light.range=10;light.intensity=.35;
  const q={name,position:new Vector3(x,y+1,z),on:true,light,material:lm,strips};zones.push(q);
  // The ceiling recess leaves a dark reveal around the warm strip.
  if(ceiling)box(name+' floating ceiling',x,y+3.88,z,w-.9,.12,d-.9,plaster);
  return q;
 }
 function door(name:string,x:number,y:number,z:number,width=1.3,along:'x'|'z'='z',material=wood,slide=false){
  const p=new TransformNode(name+' hinge',scene);p.position.set(x,y,z);p.rotation.y=along==='x'?Math.PI/2:0;
  const b=box(name,0,1.35,width/2,.11,2.7,width,material);b.parent=p;b.isPickable=true;
  const handle=box(name+' handle',-.09,1.2,width-.18,.05,.38,.06,brass);handle.parent=p;
  const q:Door={name,pivot:p,leaf:b,open:false,angle:0,target:0,x,y,z,width,along,swing:along==='z'&&x<0?-1:1,slide};doors.push(q);
  // The moving rectangle follows the rendered leaf, including the open swing.
  const progress=()=>q.angle/(Math.PI/2);
  const theta=()=> (along==='x'?Math.PI/2:0)+(slide?0:q.angle*q.swing);
  const length=()=>width*(slide?1-progress()*.97:1);
  obstacles.push({name,bottom:y,top:y+2.7,
   get x(){return q.pivot.position.x+Math.sin(theta())*length()/2;},
   get z(){return q.pivot.position.z+Math.cos(theta())*length()/2;},
   get w(){return Math.abs(Math.sin(theta()))*length()+Math.abs(Math.cos(theta()))*.11;},
   get d(){return Math.abs(Math.cos(theta()))*length()+Math.abs(Math.sin(theta()))*.11;}
  });
  return q;
 }
 // A wall and its aperture share the same dimensions for rendering and collision.
 function wallOpening(name:string,x:number,z:number,length:number,along:'x'|'z',base:number,
   opening:{offset:number;width:number;sill:number;head:number},material=plaster,glazed=true,thickness:number=ARCH.wall,recess=0){
  const {offset,width,sill,head}=opening;
  const segment=(label:string,start:number,end:number,bottom:number,height:number,m=material)=>{
   if(end-start<.001||height<.001)return;
   const c=(start+end)/2;
   panel(name+' '+label,x+(along==='x'?c:0),z+(along==='z'?c:0),along==='x'?end-start:thickness,along==='z'?end-start:thickness,base+bottom,height,m);
  };
  segment('left',-length/2,offset-width/2,0,STOREY);
  segment('right',offset+width/2,length/2,0,STOREY);
  segment('sill',offset-width/2,offset+width/2,0,sill);
  segment('head',offset-width/2,offset+width/2,head,STOREY-head);
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
  if(r.kind==='kitchen'){box('Kitchen island',r.x,y+.5,r.z,4,1,1.6,wood,true);box('Island waterfall top',r.x,y+1.06,r.z,4.2,.12,1.8,white);for(const x of [r.x-2.04,r.x+2.04])box('Waterfall stone end',x,y+.53,r.z,.12,1.06,1.8,white);for(const x of [r.x-1.25,r.x,r.x+1.25]){cylinder('Island stool',x,y+.7,r.z-1.35,.48,.13,cloth);cylinder('Stool stem',x,y+.35,r.z-1.35,.055,.65,dark);}box('Island sink',r.x+.8,y+1.125,r.z,.7,.025,.55,dark);box('Kitchen cabinets',r.x+r.width/2-.5,y+.5,r.z,.8,1,6,wood,true);box('Kitchen counter',r.x+r.width/2-.55,y+1.06,r.z,.95,.12,6,white);box('Tall fridge',r.x+r.width/2-.6,y+1.3,r.z-2.7,1.1,2.6,1.2,dark,true);table(r.x,y,r.z+2.7,2.5,1.2);}
  if(r.kind==='lounge'){sofa(r.x,y,r.z+1);table(r.x,y-.3,r.z-1,1.8,1);}
  plant(r.x+Math.sign(r.x)*(r.width/2-1),y,r.z-r.depth/2+1,.85);
 }
 // One acre, laid out at true metre scale.
 slab('Site',0,0,SITE_SIDE,SITE_SIDE,LEVEL.site,grass);slab('Surrounding ground',0,0,250,250,-.1,grass);
 const edge=SITE_SIDE/2;
 panel('West perimeter',-edge,0,.3,SITE_SIDE,0,3,stone);panel('East perimeter',edge,0,.3,SITE_SIDE,0,3,stone);panel('Rear perimeter',0,edge,SITE_SIDE,.3,0,3,stone);
 panel('Front west wall',(-edge-3.5)/2,-edge,edge-3.5,.3,0,3,stone);panel('Front east wall',(edge+8)/2,-edge,edge-8,.3,0,3,stone);panel('Gate divider',5.2,-edge,2.6,.45,0,3.5,dark);
 // Sliding gate across driveway, separate pedestrian gate.
 door('Vehicle gate',-3.5,0,-edge,7,'x',dark,true);door('Pedestrian gate',6.5,0,-edge,1.5,'x',wood);
 for(const x of [-3.7,3.7,6.3,8.2])panel('Gate pillar',x,-edge,.4,.6,0,3.5,dark);
 slab('Gate approach',0,-25,7,14,.012,asphalt);
 const drive=MeshBuilder.CreateDisc('Roundabout paving',{radius:9,tessellation:64},scene);drive.rotation.x=Math.PI/2;drive.position.set(0,.018,-15);drive.material=asphalt;drive.isPickable=false;
 cylinder('Roundabout island',0,.16,-15,7,.3,stone);cylinder('Island planting',0,.32,-15,6.6,.08,grass);obstacles.push({name:'Roundabout garden',x:0,z:-15,w:5.5,d:5.5,bottom:0,top:.5});tree(0,-15,1.2);
 slab('Arrival walk',4.5,-7,9,4,LEVEL.ground,stone);slab('Garage drive',15,-12,20,6,.015,asphalt);slab('Garage approach',23,-14,12,3,.015,asphalt);
 slab('Pedestrian gate path',7.25,-25.5,1.8,12.5,.018,stone);slab('Pedestrian link',8.8,-20,4.9,1.8,.018,stone);slab('Arrival garden path',10.5,-13,1.8,14,.018,stone);slab('Entry garden link',6,-6.5,9,1.8,LEVEL.ground,stone);
 // One finished datum; disjoint plates eliminate overlapping floor tops and false steps.
 const exterior=mat('Concealed warm light','#ffe0a3');exterior.disableLighting=true;exterior.emissiveColor=Color3.FromHexString('#ffe0a3');
 const plate=(name:string,r:Rect,y:number,m=floor)=>slab(name,r.x,r.z,r.w,r.d,y,m);
 for(const [level,plates] of [[0,groundPlates],[1,upperPlates],[2,roofPlates]] as const)for(const r of plates)plate('Continuous floor '+level,r,level*STOREY,level===2?stone:floor);
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
  panel('Living media spine',0,6,.3,10,f*STOREY,STOREY,stone);
  passage(f?'Upper private gallery':'Garden private hall',0,15.5,9,'z',f*STOREY,f?-3.3:-1.4,1.5);
  panel('West hall garden end',-1,20,2,.24,f*STOREY,STOREY);
 }
 // Enclosed kitchen and pantry, with the whole west edge open to dining.
 wallOpening('Kitchen garden glazing',13,20,8,'x',0,{offset:-1.4,width:4,sill:.1,head:3.5},plaster,true,.32);

 const pantry=ARCH.pantry;
 panel('Pantry side',pantry.x-pantry.w/2,pantry.z,.16,pantry.d,0,3.8);
 panel('Pantry back',pantry.x,pantry.z+pantry.d/2,pantry.w,.16,0,3.8);
 passage('Enclosed pantry',pantry.x,pantry.z-pantry.d/2,pantry.w,'x',0,-.25,1.2);
 for(const z of [17.2,18.2,19.2])box('Pantry shelving',16.3,1.3,z,.6,2.6,.8,wood,true);
 box('Kitchen island',13,.48,13.2,4,.96,1.6,wood,true);box('Island waterfall top',13,1.02,13.2,4.2,.12,1.8,white);
 for(const x of [10.96,15.04])box('Waterfall end',x,.51,13.2,.12,1.02,1.8,white,true);
 box('Inset sink',13.8,1.085,13.2,.7,.015,.55,dark);
 for(const x of [11.6,13,14.4]){cylinder('Island stool',x,.68,14.7,.5,.15,cloth);cylinder('Stool stem',x,.32,14.7,.06,.6,dark);}
 box('Kitchen worktop cabinets',16.45,.48,12.8,.8,.96,4.4,wood,true);box('Kitchen worktop',16.4,1.02,12.8,.9,.12,4.4,white);box('Refrigerator',16.2,1.35,15.5,1.2,2.7,1.1,dark,true);
 zone('Kitchen',13,0,13.2,7.4,5.8);
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
 // Main social sequence: foyer → living → dining, with kitchen visible immediately at the right.
 zone('Foyer',4.5,0,-2,8.6,5.6);
 const livingLight=zone('Double-height living',4.5,STOREY,6,8.6,9.6);livingLight.position.y=1;livingLight.light.position.y=6.5;livingLight.light.range=16;
 zone('Dining',4.5,0,15.5,8.6,8.6);
 box('Living rug',4.1,.009,6,5.8,.008,6,white);
 sofa(4.7,0,6,Math.PI/2);sofa(2.8,0,9.1,0);table(2.7,-.35,6.3,1.6,1.2);
 box('Media stone plane',.2,2.1,6,.2,3.8,5.8,stone);box('Floating media console',.55,.48,6,.65,.45,5,wood,true);box('Media screen',.34,1.95,6,.08,1.75,3.1,black);
 for(const z of [3.1,8.9])box('Media concealed reveal',.32,2.15,z,.025,3.7,.035,exterior);
 table(3.3,0,15.5,2.4,3.6);for(const z of [14.3,15.5,16.7])for(const x of [1.65,4.95])box('Dining chair',x,.48,z,.55,.9,.55,cloth);
 // Upper gallery is a furnished room-width destination, connected to both wings and the stair.
 for(const z of [1,11])panel('Living overlook guard',4.5,z,9,.055,STOREY,1.1,glass);
 for(const z of [1,11])box('Overlook rail cap',4.5,STOREY+1.1,z,9,.045,.065,dark);
 panel('East living void guard',9,3,.055,4,STOREY,1.1,glass);
 sofa(3,STOREY,13.05,0);table(5.4,STOREY-.35,12.7,1.2,.7);zone('Living overlook gallery',4.5,STOREY,12.5,8.6,2.6);
 glazedPassage('Upper garden terrace',4.5,14,9,'x',STOREY,1.3,2.4);

 panel('Front recess guard',4.5,-5,9,.18,STOREY,1.1,stone);
 panel('Front recess east guard',9,-4,.18,2,STOREY,1.1,stone);
 // Front and rear exterior closures deliberately differ: private street / generous garden.
 passage('Front entrance',4.5,-5,9,'x',0,-1.5,2.4,wood);
 box('Entrance oak reveal',3,3.32,-4.76,3.3,1,.08,wood);
 for(const x of [1.35,4.65])box('Entrance deep jamb',x,1.9,-4.96,.25,3.8,.5,stone,true,true);
 wallOpening('Upper recessed gallery',4.5,-3,9,'x',STOREY,{offset:1,width:4.8,sill:.35,head:3.7},plaster,true,.35);
 for(const f of [0,1]){
  if(!f)wallOpening('West vestibule street wall',-9.5,-5,7,'x',0,{offset:1.2,width:1.8,sill:1.6,head:3.4},stone,true,.4);
  else{panel('Sheltered upper loggia guard',-9.5,-5,7,.16,STOREY,1.1,stone);box('Loggia oak soffit',-9.5,8.13,-4,7,.025,1.75,wood);box('Loggia concealed strip',-9.5,8.1,-3.2,6.4,.025,.025,exterior);}
  // The stair bay uses a single narrow vertical daylight slot, not repeated punched windows.
  wallOpening('Stair street blade',-3,-5,6,'x',f*STOREY,{offset:-1.4,width:.75,sill:.2,head:4.05},stone,true,.45);
  if(f)panel('Vestibule west end',-13,-4,.3,2,STOREY,1.1,stone);
  // Quiet front of the east wing, recessed behind the main portico.
  wallOpening('East street wall',f?11.7:13,-3,f?5.4:8,'x',f*STOREY,{offset:f?0:1.5,width:2.4,sill:f?1.2:2.4,head:3.6},f?plaster:stone,true,ENVELOPE.wallDepth,ENVELOPE.reveal);
 }
 glazedPassage('Rear garden doors',4.5,20,9,'x',0,2,2.4);
 slab('Rear social terrace',4.5,22,9,4,LEVEL.ground,stone);
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
 // Three coherent massing gestures: deep arrival frame, vertical stone stair blade, recessed upper wings.
 panel('Arrival frame west pier',-.45,-5.05,.7,3.4,0,9.5,plaster);
 panel('Arrival frame east pier',9.45,-5.05,.7,3.4,0,9.5,plaster);
 box('Arrival frame deep head',4.5,8.83,-5.05,10.6,1.34,3.4,plaster,true,true);
 box('Portico oak soffit',4.5,8.14,-5.05,9.5,.035,3.15,wood);
 box('Portico concealed light',4.5,8.11,-3.55,9.1,.035,.04,exterior);
 // The lower entrance shelter is a recessed occupied volume, integrated with the upper gallery slab.
 box('Entrance shelter beam',4.5,3.925,-5.45,9.4,.55,1.3,plaster,true,true);
 box('Entrance warm soffit',4.5,3.63,-4.7,8.8,.025,1.9,wood);
 for(const x of [1,7.8])box('Entrance lighting seam',x,3.6,-4.65,.035,.025,1.8,exterior);
 // Recessed downlights share the room-light control and the four-light budget.
 zone('Arrival shelter',3,.3,-4.3,3,1,false);
 // A single tall solid blade, aligned to the stair wall, anchors the entrance composition.
 panel('Stone stair volume',-5.8,-5.8,.6,1,0,ENVELOPE.towerTop,stone);
 // Sheltered balconies and carved rear terrace, each with actual supporting posts.
 for(const b of balconies){
  for(const x of [b.x-b.w/2,b.x+b.w/2]){panel('Balcony support',x,b.z+b.d/2,.45,.45,0,8.4,plaster);panel('Balcony side guard',x,b.z,.06,b.d,STOREY,1.1,glass);}
  panel('Balcony front guard',b.x,b.z+b.d/2,b.w,.06,STOREY,1.1,glass);
  box('Balcony deep roof edge',b.x,8.22,b.z,b.w,.55,b.d,plaster,true,true);
  box('Balcony oak soffit',b.x,7.935,b.z,b.w-.65,.025,b.d-.35,wood);
  box('Balcony concealed rear light',b.x,7.9,b.z-b.d/2+.24,b.w-.9,.025,.025,exterior);sofa(b.x,STOREY,b.z,Math.PI);
 }
 panel('Upper garden terrace guard',4.5,20,9,.06,STOREY,1.1,glass);
 for(const x of [0,9])panel('Garden terrace side',x,17,.06,6,STOREY,1.1,glass);
 for(const x of [.2,8.8])panel('Garden portico support',x,19.8,.3,.3,0,8.4,stone);
 box('Garden portico deep lintel',4.5,8.35,19.6,9.6,.55,1.4,plaster,true,true);
 sofa(3,STOREY,18,Math.PI);plant(7.8,STOREY,18.8,.8);
 for(const e of outline(roofPlates)){
  const stairEdge=e.x>=-6.01&&e.x<=-2&&e.z>=-3.61&&e.z<=2.41;
  if(stairEdge)continue;
  const court=e.x>=8.99&&e.x<=13.51&&e.z>=4.99&&e.z<=10.01;
  panel('Roof perimeter guard',e.x,e.z,e.w,e.d,LEVEL.roof,1.1,court||e.z>=13.99?glass:plaster);
 }
 // Stone stair enclosure grows from the arrival blade; glazed east exit opens onto the roof.
 const tower=ENVELOPE.stairTower,towerHeight=ENVELOPE.towerTop-LEVEL.roof;
 box('Stair tower roof',tower.x,ENVELOPE.towerTop+.13,tower.z,tower.w,.26,tower.d,plaster,true,true);
 panel('Stair tower west',tower.x-tower.w/2,tower.z,.32,tower.d,LEVEL.roof,towerHeight,stone);
 panel('Stair tower front',tower.x,tower.z-tower.d/2,tower.w,.32,LEVEL.roof,towerHeight,stone);
 panel('Stair tower rear',tower.x,tower.z+tower.d/2,tower.w,.18,LEVEL.roof,towerHeight,glass);
 door('Rooftop stair enclosure',-1.8,LEVEL.roof,-4.6,1.4,'z',glass,true);
 panel('Tower exit header',-1.8,-3.9,.18,1.4,LEVEL.roof+2.7,towerHeight-2.7,stone);
 panel('Tower east front jamb',-1.8,-4.95,.18,.7,LEVEL.roof,towerHeight,stone);
 panel('Tower east glazing',-1.8,0,.06,6.4,LEVEL.roof,towerHeight,glass);
 for(const x of [10,16])for(const z of [12,18])panel('Rooftop pergola post',x,z,.12,.12,LEVEL.roof,2.6,dark);
 for(let z=12;z<=18;z+=.45)box('Pergola slat',13,11,z,6.2,.15,.09,wood,true,true);
 sofa(13,LEVEL.roof,16);table(13,LEVEL.roof-.35,14.5,2,1);
 // Pool behind the house, on an uncluttered terrace. Water is deliberately inexpensive.
 slab('Pool terrace',-5,28,18,6,.02,stone);box('Pool coping',-5,.13,28,12,.24,4.5,white);box('Pool basin',-5,.26,28,11.5,.04,4,water);
 obstacles.push({name:'Pool edge',x:-5,z:28,w:11.5,d:4,bottom:0,top:.6});
 for(const x of [-11,-8,-5,-2]){box('Pool lounger',x,.4,25, .9,.3,1.8,white);const back=box('Lounger back',x,.65,25.65,.9,.08,.7,cloth);back.rotation.x=-.5;}
 // Gazebo east of the pool.
 slab('Gazebo deck',13,26,7,7,.12,wood);for(const x of [10,16])for(const z of [23,29])panel('Gazebo pillar',x,z,.18,.18,.12,3,dark);box('Gazebo canopy',13,3.3,26,7.5,.22,7.5,plaster);sofa(13,.12,28);sofa(15,.12,26,-Math.PI/2);table(13,-.18,26,2,1.2);zone('Gazebo',13,-.6,26,6,6);
 // Detached three-car garage with three independent doors.
 slab('Garage slab',23,-9,12,9,0,stone);panel('Garage back',23,-4.5,12,.25,0,3.6);panel('Garage west',17,-9,.25,9,0,3.6);panel('Garage east',29,-9,.25,9,0,3.6);box('Garage roof',23,3.7,-9,12.5,.25,9.5,plaster,true,true);
 for(let i=0;i<3;i++){const x=17.3+i*4;door('Garage bay '+(i+1),x,0,-13.5,3.4,'x',dark,true);panel('Garage pier',x-.18,-13.5,.3,.25,0,3.6);box('Garage bay header',x+1.7,3.15,-13.5,3.4,.9,.25,plaster,true);}
 // Planted thresholds soften the private street wall without hiding the entry.
 for(const [x,z,w,d] of [[-10,-6.5,5,.8],[-15,9,1,6],[15,-4.3,2,.8]] as const){
  box('Threshold planting',x,.18,z,w,.36,d,soil,true);
  for(let px=x-w/2+.4;px<x+w/2;px+=.8)box('Low clipped planting',px,.48,z,.7,.55,d*.85,leaf);
 }
 // Garden rhythm: paths, boundary trees, planting and discreet bollard lights.
 slab('West garden path',-19,9,2,35,.012,stone);slab('East garden path',18,17,2,23,.012,stone);
 for(const x of [-27,27])for(const z of [-24,-14,9,18,27])tree(x,z,.8);
 for(const x of [-20,19])for(const z of [-3,4,11,18]){cylinder('Path bollard',x,.35,z,.12,.7,dark);cylinder('Bollard glow',x,.68,z,.13,.1,exterior);}
 for(let i=0;i<8;i++){box('Entry stepping stone',-7,.035,-5-i*1.3,1.2,.07,.65,stone);}
 const setNight=(value:boolean)=>{night=value;sun.intensity=night?.18:1.15;sun.diffuse=Color3.FromHexString(night?'#a9c8ef':'#fff0d9');ambient.intensity=night?.36:.58;scene.clearColor=Color4.FromHexString(night?'#111e30ff':'#cbdde5ff');scene.fogColor=Color3.FromHexString(night?'#111e30':'#cbdde5');exterior.emissiveColor=Color3.FromHexString(night?'#ffcf83':'#8b8069');};
 const update=(dt:number,player:Vector3)=>{
  for(const d of doors){d.target=d.open?Math.PI/2:0;d.angle+=(d.target-d.angle)*Math.min(1,dt*7);if(d.slide){d.pivot.scaling.z=1-d.angle/(Math.PI/2)*.97;const base=d.pivot.metadata?.baseRotation??(d.pivot.metadata={baseRotation:d.pivot.rotation.y}).baseRotation;d.pivot.position.x=d.x+Math.sin(base)*d.angle/(Math.PI/2)*d.width;d.pivot.position.z=d.z+Math.cos(base)*d.angle/(Math.PI/2)*d.width;}else d.pivot.rotation.y=(d.pivot.metadata?.baseRotation??(d.pivot.metadata={baseRotation:d.pivot.rotation.y}).baseRotation)+d.angle*d.swing;}
  // At most four local lights are enabled; cove strips remain visible in other rooms.
  const nearest=zones.filter(q=>q.on).sort((a,b)=>Vector3.DistanceSquared(a.position,player)-Vector3.DistanceSquared(b.position,player)).slice(0,4);
  for(const q of zones){q.light.setEnabled(q.on&&nearest.includes(q));q.light.intensity=night?1.35:.35;q.material.emissiveColor=q.on?Color3.FromHexString('#ffdc99'):Color3.FromHexString('#39382f');}
 };
 // Batch static geometry by material and spatial cell; preserve moving doors and avatar.
 const batches=new Map<string,Mesh[]>();
 for(const m of [...scene.meshes]){if(!(m instanceof Mesh)||m.parent||!m.material)continue;const casts=shadows.getShadowMap()!.renderList!.includes(m);const key=[m.material.uniqueId,Math.floor(m.position.x/10),Math.floor(m.position.z/10),Math.floor(m.position.y/4.2),!!m.metadata?.solid,casts].join(':');const group=batches.get(key)||[];group.push(m);batches.set(key,group);}
 for(const group of batches.values()){if(group.length<2)continue;const solid=!!group[0].metadata?.solid,casts=shadows.getShadowMap()!.renderList!.includes(group[0]);for(const m of group)shadows.removeShadowCaster(m);const merged=Mesh.MergeMeshes(group,true,true);if(merged){merged.name='Static architectural batch';merged.isPickable=solid;merged.metadata={solid};merged.receiveShadows=merged.material!==glass;if(casts)shadows.addShadowCaster(merged);merged.freezeWorldMatrix();}}
 setNight(false);return {obstacles,surfaces,doors,zones,sun,ambient,shadows,setNight,update,meshCount:scene.meshes.length};
}
