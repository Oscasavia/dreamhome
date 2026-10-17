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
import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture';
import {rooms, SITE_SIDE, STOREY, ARCH, stairs, galleries, roofPlates, balconies, outline, subtractRects, roomRect, roomEntry, ensuiteRect, type Rect, type Room, type Obstacle, type Surface} from './plan';

export interface Door {name:string; pivot:TransformNode; leaf:Mesh; open:boolean; angle:number; target:number; x:number; y:number; z:number; width:number; along:'x'|'z'; swing:number; slide?:boolean}
export interface LightZone {name:string;position:Vector3;on:boolean;light:PointLight;material:StandardMaterial;strips:Mesh[]}
export interface World {obstacles:Obstacle[];surfaces:Surface[];doors:Door[];zones:LightZone[];sun:DirectionalLight;ambient:HemisphericLight;shadows:ShadowGenerator;setNight:(night:boolean)=>void;update:(dt:number,player:Vector3)=>void;meshCount:number}

export function createWorld(scene:Scene, headless=false):World {
 const obstacles:Obstacle[]=[],surfaces:Surface[]=[],doors:Door[]=[],zones:LightZone[]=[];
 let night=false;
 const sun=new DirectionalLight('sun',new Vector3(-.45,-.85,.35),scene);sun.position.set(35,50,-35);sun.intensity=1.15;sun.diffuse=Color3.FromHexString('#fff0d9');
 const ambient=new HemisphericLight('sky',Vector3.Up(),scene);ambient.intensity=.58;ambient.groundColor=Color3.FromHexString('#5c6454');
 const shadows=new ShadowGenerator(1024,sun);shadows.usePercentageCloserFiltering=true;shadows.filteringQuality=ShadowGenerator.QUALITY_LOW;shadows.bias=.003;shadows.normalBias=.08;shadows.setDarkness(.22);
 scene.clearColor=Color4.FromHexString('#cbdde5ff');scene.fogMode=Scene.FOGMODE_EXP2;scene.fogDensity=.0028;scene.fogColor=Color3.FromHexString('#cbdde5');
 const mat=(name:string,hex:string,spec=.1)=>{const m=new StandardMaterial(name,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor=new Color3(spec,spec,spec);m.specularPower=48;return m;};
 const plaster=mat('Warm limestone plaster','#e8e3d6'),stone=mat('Travertine','#c6bca7'),dark=mat('Charcoal aluminium','#242f2f'),wood=mat('Smoked oak','#775b40'),floor=mat('Honed limestone floor','#d1c8b4',.24),oak=mat('Natural oak floor','#a5835e'),grass=mat('Garden lawn','#627359'),asphalt=mat('Driveway basalt','#535957'),water=mat('Pool water','#52a6a4',.8),white=mat('Ivory upholstery','#eee8db'),cloth=mat('Sage upholstery','#818d7c'),black=mat('Cinema charcoal','#242626'),leaf=mat('Olive canopy','#354b32',.02),brass=mat('Brushed brass','#b6a170',.5),soil=mat('Planting earth','#615343');
 water.alpha=.85;water.specularPower=128;
 const glass=mat('Smoked architectural glazing','#9eb9b5',.65);glass.alpha=.25;glass.backFaceCulling=false;
 if(!headless){
  const texture=(m:StandardMaterial,kind:'stone'|'wood'|'grass')=>{
   const t=new DynamicTexture(m.name+' surface',{width:256,height:256},scene,true);const ctx=t.getContext();
   ctx.fillStyle=m.diffuseColor.toHexString();ctx.fillRect(0,0,256,256);
   let seed=17;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
   for(let i=0;i<2000;i++){ctx.fillStyle=rand()>.5?'rgba(255,255,255,.055)':'rgba(0,0,0,.04)';ctx.fillRect(rand()*256,rand()*256,kind==='wood'?1:rand()*3,kind==='wood'?30+rand()*100:rand()*3);}
   if(kind==='stone'){ctx.strokeStyle='rgba(80,70,60,.18)';ctx.lineWidth=1;for(let row=0;row<8;row++){const offset=(row%2)*64;for(let col=-1;col<3;col++)ctx.strokeRect(col*128+offset,row*32,128,32);}}
   t.update();t.uScale=kind==='grass'?10:2;t.vScale=kind==='grass'?10:2;m.diffuseTexture=t;m.diffuseColor=Color3.White();
  };texture(stone,'stone');texture(floor,'stone');texture(oak,'wood');texture(wood,'wood');texture(grass,'grass');
 }
 function box(name:string,x:number,y:number,z:number,w:number,h:number,d:number,m:StandardMaterial,solid=false,shadow=false){
  const b=MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);b.position.set(x,y,z);b.material=m;b.receiveShadows=m!==glass;b.isPickable=false;
  if(solid){obstacles.push({name,x,z,w,d,bottom:y-h/2,top:y+h/2});b.isPickable=true;b.metadata={solid:true};}if(shadow&&m!==glass)shadows.addShadowCaster(b);return b;
 }
 function cylinder(name:string,x:number,y:number,z:number,d:number,h:number,m:StandardMaterial,top=d){const b=MeshBuilder.CreateCylinder(name,{diameterBottom:d,diameterTop:top,height:h,tessellation:16},scene);b.position.set(x,y,z);b.material=m;b.isPickable=false;b.receiveShadows=true;return b;}
 function slab(name:string,x:number,z:number,w:number,d:number,y:number,m=floor){box(name,x,y-.12,z,w,.24,d,m,false,y>=STOREY);surfaces.push({x,z,w,d,y});}
 function panel(name:string,x:number,z:number,w:number,d:number,base:number,h=3.95,m=plaster){return box(name,x,base+h/2,z,w,h,d,m,true,true);}
 function zone(name:string,x:number,y:number,z:number,w:number,d:number){
  const lm=mat(name+' LEDs','#fff1c8');lm.emissiveColor=Color3.FromHexString('#ffdc99');lm.disableLighting=true;
  const strips=[box(name+' cove west',x-w/2+.32,y+3.72,z,.055,.04,d-.64,lm),box(name+' cove east',x+w/2-.32,y+3.72,z,.055,.04,d-.64,lm),box(name+' cove north',x,y+3.72,z+d/2-.32,w-.64,.04,.055,lm),box(name+' cove south',x,y+3.72,z-d/2+.32,w-.64,.04,.055,lm)];
  const light=new PointLight(name,new Vector3(x,y+3.25,z),scene);light.diffuse=Color3.FromHexString('#ffdfaa');light.range=10;light.intensity=.35;
  const q={name,position:new Vector3(x,y+1,z),on:true,light,material:lm,strips};zones.push(q);
  // The ceiling recess leaves a dark reveal around the warm strip.
  box(name+' floating ceiling',x,y+3.88,z,w-.9,.12,d-.9,plaster);
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
   opening:{offset:number;width:number;sill:number;head:number},material=plaster,glazed=true,thickness:number=ARCH.wall){
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
   const gx=x+(along==='x'?offset:0),gz=z+(along==='z'?offset:0);
   box(name+' recessed glass',gx,base+(sill+head)/2,gz,along==='x'?width:.035,head-sill,along==='z'?width:.035,glass,true);
   for(const t of [-width/2,width/2,0])box(name+' vertical frame',gx+(along==='x'?t:0),base+(sill+head)/2,gz+(along==='z'?t:0),.055,head-sill,.055,dark);
   for(const h of [sill,head])box(name+' horizontal frame',gx,base+h,gz,along==='x'?width:.06,.06,along==='z'?width:.06,dark);
  }
 }
 function roomDoor(r:Room){
  const y=r.floor*STOREY,e=roomEntry(r);
  const start=r.z-r.depth/2,end=r.z+r.depth/2,after=e.z+e.width;
  panel(r.name+' gallery pier',e.x,(start+e.z)/2,.22,e.z-start,y,STOREY);
  box(r.name+' door lintel',e.x,y+3.45,e.z+e.width/2,.22,1.5,e.width,plaster,true,true);
  wallOpening(r.name+' courtyard window',e.x,(after+end)/2,end-after,'z',y,{offset:0,width:Math.min(4,end-after-1),sill:1.15,head:3.3},plaster,true);
  door(r.name,e.x,y,e.z,e.width);
 }
 function sofa(x:number,y:number,z:number,rot=0,m=cloth){
  const root=new TransformNode('Sofa',scene);root.position.set(x,y,z);root.rotation.y=rot;
  for(const [name,px,py,pz,w,h,d] of [['base',0,.3,0,2.7,.45,1],['back',0,.75,.43,2.7,.7,.18],['left',-1.3,.55,0,.16,.7,1],['right',1.3,.55,0,.16,.7,1],['cushion left',-.65,.57,-.02,1.18,.18,.8],['cushion right',.65,.57,-.02,1.18,.18,.8]] as const){const b=box('Sofa '+name,px,py,pz,w,h,d,m);b.parent=root;}
 }
 function table(x:number,y:number,z:number,w=2,d=1,m=wood){box('Table top',x,y+.75,z,w,.12,d,m);for(const a of [-1,1])for(const b of [-1,1])box('Table leg',x+a*(w/2-.14),y+.36,z+b*(d/2-.12),.07,.72,.07,dark);}
 function plant(x:number,y:number,z:number,scale=1){cylinder('Planter',x,y+.3*scale,z,.62*scale,.6*scale,stone,.8*scale);const crown=MeshBuilder.CreateSphere('Indoor foliage',{diameter:1.15*scale,segments:8},scene);crown.position.set(x,y+1.1*scale,z);crown.scaling.y=1.5;crown.material=leaf;crown.isPickable=false;}
 function tree(x:number,z:number,s=1){cylinder('Olive trunk',x,1.4*s,z,.27*s,2.8*s,wood,.18*s);for(const [dx,dz,dy] of [[0,0,3.6],[-.7,.2,3.2],[.6,-.4,3.3]]){const c=MeshBuilder.CreateSphere('Olive crown',{diameter:2.6*s,segments:8},scene);c.position.set(x+dx*s,dy*s,z+dz*s);c.scaling.y=.8;c.material=leaf;c.isPickable=false;shadows.addShadowCaster(c);}}
 function bed(r:Room){const y=r.floor*STOREY;const x=r.x+(r.x<0?.7:-.7),z=r.master?r.z+1:r.z-1;
  box('Bedroom rug',x,y+.02,z+1,4,.025,4.8,white);
  box('Bed plinth',x,y+.23,z,2.25,.4,2.6,wood);box('Linen mattress',x,y+.54,z,2.18,.3,2.55,white);box('Duvet',x,y+.74,z+.25,2.2,.13,1.9,cloth);box('Upholstered headboard',x,y+.83,z-1.37,2.8,1.55,.15,cloth);
  for(const a of [-1,1]){box('Pillow',x+a*.55,y+.78,z-.9,.85,.18,.48,white);box('Bedside cabinet',x+a*1.75,y+.36,z-1,.65,.7,.6,wood);cylinder('Bedside lamp',x+a*1.75,y+.95,z-1,.33,.4,white);}
  if(!r.master)box('Wardrobe',r.x+Math.sign(r.x)*(r.width/2-.55),y+1.35,r.z-2,.6,2.7,2.7,wood,true);plant(r.x+2,y,r.z+2.7,.8);
 }
 function bathroom(r:Room){const y=r.floor*STOREY,{x,z,w,d}=ensuiteRect(r);
  slab('Ensuite tile',x,z,w,d,y+.015,stone);
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
  if(r.kind==='office'){table(r.x,y,r.z,2.6,1.2);sofa(r.x,y,r.z+2.5);box('Bookshelf',r.x-3.4,y+1.4,r.z, .5,2.8,4,wood);for(let i=0;i<3;i++)box('Bookshelf shelf',r.x-3.1,y+.4+i*.8,r.z,.6,.05,3.8,dark);box('Desk monitor',r.x,y+1.2,r.z+.25,1,.65,.05,dark);}
  if(r.kind==='gym'){for(let i=0;i<2;i++){box('Treadmill deck',r.x-1.5+i*2.6,y+.15,r.z,1.1,.3,2.1,dark);box('Treadmill upright',r.x-1.5+i*2.6,y+.8,r.z+.8,.1,1.3,.1,dark);box('Treadmill console',r.x-1.5+i*2.6,y+1.4,r.z+.8,.75,.12,.35,black);}box('Exercise mat',r.x,y+.03,r.z+2.2,2,.04,1,cloth);box('Gym mirror',r.x+r.width/2-.15,y+1.7,r.z,.03,2.3,5,glass);}
  if(r.kind==='cinema'){box('Cinema carpet',r.x,y+.02,r.z,r.width-.3,.03,r.depth-.3,black);box('Cinema screen frame',r.x+3.8,y+1.9,r.z,.12,2.7,5.2,dark);const screen=mat('Projection surface','#9aaeb3');screen.emissiveColor=new Color3(.13,.18,.2);box('Projection screen',r.x+3.72,y+1.9,r.z,.02,2.35,4.8,screen);sofa(r.x-.3,y,r.z,-Math.PI/2,black);sofa(r.x-2.7,y,r.z,-Math.PI/2,black);}
  if(r.kind==='kitchen'){box('Kitchen island',r.x,y+.5,r.z,4,1,1.6,wood,true);box('Island waterfall top',r.x,y+1.06,r.z,4.2,.12,1.8,white);for(const x of [r.x-2.04,r.x+2.04])box('Waterfall stone end',x,y+.53,r.z,.12,1.06,1.8,white);for(const x of [r.x-1.25,r.x,r.x+1.25]){cylinder('Island stool',x,y+.7,r.z-1.35,.48,.13,cloth);cylinder('Stool stem',x,y+.35,r.z-1.35,.055,.65,dark);}box('Island sink',r.x+.8,y+1.125,r.z,.7,.025,.55,dark);box('Kitchen cabinets',r.x+r.width/2-.5,y+.5,r.z,.8,1,6,wood,true);box('Kitchen counter',r.x+r.width/2-.55,y+1.06,r.z,.95,.12,6,white);box('Tall fridge',r.x+r.width/2-.6,y+1.3,r.z-2.7,1.1,2.6,1.2,dark,true);table(r.x,y,r.z+2.7,2.5,1.2);}
  if(r.kind==='lounge'){sofa(r.x,y,r.z+1);sofa(r.x-2,y,r.z,-Math.PI/2);table(r.x,y-.3,r.z-1,1.8,1);}
  plant(r.x+Math.sign(r.x)*(r.width/2-1),y,r.z-r.depth/2+1,.85);
 }
 // One acre, laid out at true metre scale.
 slab('Site',0,0,SITE_SIDE,SITE_SIDE,-.035,grass);slab('Surrounding ground',0,0,250,250,-.1,grass);
 const edge=SITE_SIDE/2;
 panel('West perimeter',-edge,0,.3,SITE_SIDE,0,3,stone);panel('East perimeter',edge,0,.3,SITE_SIDE,0,3,stone);panel('Rear perimeter',0,edge,SITE_SIDE,.3,0,3,stone);
 panel('Front west wall',(-edge-3.5)/2,-edge,edge-3.5,.3,0,3,stone);panel('Front east wall',(edge+8)/2,-edge,edge-8,.3,0,3,stone);panel('Gate divider',5.2,-edge,2.6,.45,0,3.5,dark);
 // Sliding gate across driveway, separate pedestrian gate.
 door('Vehicle gate',-3.5,0,-edge,7,'x',dark,true);door('Pedestrian gate',6.5,0,-edge,1.5,'x',wood);
 for(const x of [-3.7,3.7,6.3,8.2])panel('Gate pillar',x,-edge,.4,.6,0,3.5,dark);
 slab('Gate approach',0,-25,7,14,.012,asphalt);
 const drive=MeshBuilder.CreateDisc('Roundabout paving',{radius:9,tessellation:64},scene);drive.rotation.x=Math.PI/2;drive.position.set(0,.018,-15);drive.material=asphalt;drive.isPickable=false;
 cylinder('Roundabout island',0,.16,-15,7,.3,stone);cylinder('Island planting',0,.32,-15,6.6,.08,grass);obstacles.push({name:'Roundabout garden',x:0,z:-15,w:5.5,d:5.5,bottom:0,top:.5});tree(0,-15,1.2);
 slab('Arrival walk',0,-5.3,6,5,.025,stone);slab('Garage drive',15,-12,20,6,.015,asphalt);slab('Garage approach',23,-7,12,5,.015,asphalt);
 slab('Pedestrian gate path',7.25,-25.5,1.8,12.5,.018,stone);slab('Pedestrian link',8.8,-20,4.9,1.8,.018,stone);slab('Arrival garden path',10.5,-13,1.8,14,.018,stone);slab('Entry garden link',6,-6.5,9,1.8,.018,stone);
 // Staggered wings: the schedule is the source of truth for slabs and enclosure.
 const exterior=mat('Concealed amber lighting','#ffe0a3');exterior.disableLighting=true;exterior.emissiveColor=Color3.FromHexString('#ffe0a3');
 const plate=(name:string,r:Rect,y:number,m=floor)=>slab(name,r.x,r.z,r.w,r.d,y,m);
 for(const r of rooms){
  const y=r.floor*STOREY,rect=roomRect(r),side=Math.sign(r.x),outer=r.x+side*r.width/2;
  plate(r.name+' floor',rect,y,r.floor?oak:floor);
  // Ground wing roofs also form the small setbacks beneath the upper volumes.
  if(!r.floor)for(const exposed of subtractRects(rect,rooms.filter(q=>q.floor===1).map(roomRect)))plate(r.name+' setback roof',exposed,STOREY,stone);
  const isStreet=r.id==='office'||r.id==='gym'||r.id==='suite-3'||r.id==='gallery';
  const isRear=r.id==='suite-2'||r.id==='master'||r.id==='kitchen'||r.id==='suite-5';
  const facadeMaterial=r.id==='office'||r.id==='suite-1'?stone:plaster;
  wallOpening(r.name+' outer wall',outer,r.z,r.depth,'z',y,
   {offset:r.master?1:-.7,width:r.kind==='cinema'?2.4:r.master?6:4,sill:r.kind==='cinema'?2.4:1.15,head:3.3},facadeMaterial,true,.34);
  for(const end of [-1,1]){
   const z=r.z+end*r.depth/2;
   if(end===-1&&isStreet){
    const balcony=r.id==='gallery';
    wallOpening(r.name+' street wall',r.x,z,r.width,'x',y,{offset:0,width:balcony?3:2.6,sill:balcony?0:1.8,head:3.15},facadeMaterial,!balcony,.4);
    if(balcony)door('Upper lounge loggia',r.x-1.5,y,z,3,'x',glass,true);
    // Deep plaster jambs shade selective street apertures; no projecting ladder-like screen.
    for(const dx of [-1.45,1.45])panel('Deep window reveal',r.x+dx,z-.16,.16,.45,y+1.8,1.5,facadeMaterial);
   }else if(end===1&&isRear){
    const hasBalcony=r.floor===1,rearOffset=hasBalcony?-Math.sign(r.x)*1.4:1.4;
    wallOpening(r.name+' garden wall',r.x,z,r.width,'x',y,{offset:rearOffset,width:hasBalcony?2.2:3.8,sill:hasBalcony?0:.65,head:3.35},plaster,!hasBalcony,.3);
    if(hasBalcony)door(r.name+' balcony',r.x+rearOffset-1.1,y,z,2.2,'x',glass,true);
   }else panel(r.name+' party wall',r.x,z,r.width,.18,y,STOREY);
  }
  roomDoor(r);zone(r.name,r.x,y,r.z,r.width,r.depth);furnish(r);
  // Continuous roof coping follows each wing, with a shadow joint rather than a single box fascia.
  box('Wing shadow joint',outer,y+STOREY-.18,r.z,.36,.12,r.depth,dark);
  box('Wing coping',outer,y+STOREY+.05,r.z,.42,.12,r.depth+.2,facadeMaterial);
 }
 // A real walk-in dressing room occupies the private front of the 144 m² primary suite.
 const dressing=ARCH.wardrobe;
 wallOpening('Dressing room partition',dressing.x,dressing.z+dressing.d/2,dressing.w,'x',STOREY,{offset:1,width:1.6,sill:0,head:2.7},plaster,false,.16);
 door('Primary walk-in closet',dressing.x+.2,STOREY,dressing.z+dressing.d/2,1.6,'x');
 for(const side of [-1,1]){
  box('Walk-in wardrobe bank',dressing.x+side*(dressing.w/2-.4),STOREY+1.45,dressing.z,.65,2.9,dressing.d-.5,wood,true);
  for(let z=dressing.z-1.6;z<dressing.z+1.7;z+=.8)box('Wardrobe recessed pull',dressing.x+side*(dressing.w/2-.75),STOREY+1.4,z,.03,.65,.025,brass);
 }
 box('Dressing island',dressing.x,STOREY+.45,dressing.z,1.3,.9,1.8,wood,true);
 // Wrapped circulation and the two cross wings completely enclose the courtyard.
 for(const f of [0,1])for(const g of galleries)plate('Courtyard side gallery',g,f*STOREY,f?oak:floor);
 plate('Entrance hall',ARCH.foyer,0);
 plate('Double height living floor',ARCH.living,0);
 plate('Living overlook gallery',ARCH.overlook,STOREY,oak);
 plate('Rear overlook gallery',ARCH.rearGallery,STOREY,oak);
 for(const r of [{x:0,z:-1.5,w:10,d:3},{x:0,z:4,w:10,d:4},{x:-4.5,z:1,w:1,d:2},{x:4.5,z:1,w:1,d:2}])plate('Upper stair landing',r,STOREY,oak);
 for(const r of roofPlates)plate('Roof terrace',r,STOREY*2,stone);
 // The street entry is a solid, offset threshold with an everyday level approach.
 for(const f of [0,1]){
  const y=f*STOREY;
  wallOpening('Entrance cross wing',0,ARCH.entryZ,14,'x',y,{offset:0,width:f?3:3.4,sill:f?1.9:0,head:3.25},stone,!!f,.38);
  if(!f){door('Front entrance',-1.7,0,ARCH.entryZ,1.7,'x');door('Front entrance right',0,0,ARCH.entryZ,1.7,'x');}
  // Close the stepped ends of the gallery, independent of the adjacent room setbacks.
  panel('West gallery garden end',-6,23,2,.22,y,STOREY);
  panel('East gallery front end',6,-3,2,.22,y,STOREY);
  zone(f?'Upper arrival gallery':'Entrance hall',0,y,-1.5,9,2.6);
 }
 const c=ARCH.canopy;
 box('Entrance canopy',c.x,3.3,c.z,c.w,.28,c.d,plaster,true,true);
 panel('Entrance stone blade',4.65,-4.3,.45,3.5,0,3.3,stone);
 for(const x of [-1.6,4.4])box('Canopy concealed light',x,3.14,-4.2,.045,.025,2.7,exterior);
 slab('Entrance apron',1,-5.4,7.5,3,.025,stone);
 zone('Sheltered entrance',1.3,-.8,-4.3,5.5,2.2);
 // A textured base and shaded vertical accents establish the entrance at pedestrian scale.
 for(const x of [-1.85,1.85])panel('Entry charcoal jamb',x,-3.25,.16,.4,0,3.25,dark);
 for(let x=2.1;x<4.4;x+=.14)box('Entry oak lining',x,1.6,-3.21,.065,3.1,.06,wood);
 box('Entry wall wash',3.2,3.04,-3.28,2.25,.025,.035,exterior);
 // Upper east recess: a sheltered loggia, screened vertically and reached from the lounge.
 plate('Upper lounge loggia',{x:10.5,z:-1,w:7,d:2},STOREY,stone);
 panel('Loggia solid parapet',10.5,-2,7,.18,STOREY,1.2,plaster);
 for(const x of [7,14])panel('Loggia side',x,-1,.18,2,STOREY,1.2,plaster);
 for(let x=7.3;x<14;x+=.38)box('Recessed vertical screen',x,STOREY+2.5,-1.75,.085,2.5,.18,wood,true,true);
 // Supported rear living pavilion: stone centre, tall garden apertures, and an actual upper void.
 panel('Media wall backing',-1.5,ARCH.rearZ,7,.3,0,STOREY,stone);
 wallOpening('Pool access',3.5,ARCH.rearZ,3,'x',0,{offset:0,width:2,sill:0,head:3.3},plaster,false,.3);
 door('Pool terrace door',2.5,0,ARCH.rearZ,2,'x',glass,true);
 for(const x of [-6,6])wallOpening('Tall garden bay',x,ARCH.rearZ,2,'x',0,{offset:0,width:1.6,sill:.15,head:4.05},plaster,true,.3);
 wallOpening('Living high garden glazing',0,ARCH.rearZ,14,'x',STOREY,{offset:0,width:12.8,sill:.15,head:3.9},plaster,true,.3);
 // Courtyard arcade: open ground passages and glass guards at the upper gallery.
 for(const x of [-5,5])for(const z of [6,10,14]){
  panel('Courtyard pier',x,z,.24,.38,0,STOREY*2,stone);
  box('Courtyard pier light',x,2.7,z-.2,.06,.6,.025,exterior);
 }
 for(const y of [STOREY,STOREY*2]){
  for(const x of [-5,5])box('Courtyard edge beam',x,y-.2,10,.3,.4,8,plaster);
  for(const z of [6,14])box('Courtyard cross beam',0,y-.2,z,10,.4,.3,plaster);
 }
 for(const x of [-5,5])panel('Courtyard glass rail',x,10,.055,8,STOREY,1.1,glass);
 for(const z of [6,14])panel('Courtyard glass rail',0,z,10,.055,STOREY,1.1,glass);
 const v=ARCH.livingVoid;
 for(const z of [v.z-v.d/2,v.z+v.d/2])panel('Living void guard',0,z,v.w,.055,STOREY,1.1,glass);
 for(const x of [-v.w/2,v.w/2])panel('Living void side guard',x,v.z,.055,v.d,STOREY,1.1,glass);
 const livingZone=zone('Double-height living room',0,STOREY,18,9.4,7.4);livingZone.position.y=1;livingZone.light.position.y=6.8;livingZone.light.range=14;
 // Two measured stair flights; visual risers and walking ramps use the same source dimensions.
 for(const flight of stairs){
  const count=24;
  for(let i=0;i<count;i++){
   const h=(i+1)*flight.rise/count;
   box('Stair tread',flight.x-flight.w/2+(i+.5)*flight.w/count,flight.base+h-.09,flight.z,flight.w/count,.18,flight.d,stone);
   box('Stair riser',flight.x-flight.w/2+i*flight.w/count,flight.base+h-.175/2,flight.z,.035,.175,flight.d,stone);
  }
  for(const side of [-1,1]){
   const z=flight.z+side*(flight.d/2+.02);
   const rail=box('Stair handrail',flight.x,flight.base+flight.rise/2+1,z,Math.hypot(flight.w,flight.rise),.055,.055,dark);rail.rotation.z=Math.atan2(flight.rise,flight.w);
   // Sloped guard collision uses short vertical segments, leaving the landings open.
   for(let i=0;i<24;i++){
    const x=flight.x-flight.w/2+(i+.5)*flight.w/24,h=flight.base+(i+.5)*flight.rise/24;
    box('Stair baluster',x,h+.5,z,.025,1,.025,dark);
    obstacles.push({name:'Stair sloped guard',x,z,w:flight.w/24,d:.05,bottom:h,top:h+1.05});
   }
   panel('Stair opening guard',flight.x,z,flight.w,.06,flight.base+flight.rise,1.1,glass);
  }
 }
 // Living furniture: the low arrangement retains a clear approach to both garden and courtyard.
 sofa(-2,0,17,Math.PI);sofa(-3.8,0,19,-Math.PI/2);table(-1.7,-.35,19,1.7,1.2);
 box('Media wall stone panel',-1.2,2,21.73,4.6,3.7,.16,stone);box('Floating media console',-1.2,.5,21.3,5.2,.45,.65,wood);box('Living television',-1.2,1.95,21.57,3.2,1.8,.075,black);
 for(let x=-4.8;x<-3.6;x+=.14)box('Media oak fluting',x,2,21.68,.065,3.7,.18,wood);
 for(const x of [-3.55,1.15])box('Media wall reveal',x,2,21.62,.035,3.7,.03,exterior);
 table(3.1,0,18,2,3);for(const z of [17,18.2,19.4])for(const x of [1.7,4.5])box('Dining chair',x,.48,z,.55,.85,.55,cloth);
 // Half bath at arrival, without obstructing the entry or stair approach.
 slab('Powder room tiles',-3.7,-1.45,2.4,2.7,.02,stone);wallOpening('Powder side',-2.5,-1.45,2.7,'z',0,{offset:0,width:1.2,sill:0,head:2.7},plaster,false,.12);
 panel('Powder west',-4.9,-1.45,.12,2.7,0,3.2);
 panel('Powder partition',-3.7,-.1,2.4,.12,0,3.2);
 door('Guest half bathroom',-2.5,0,-2.05,1.2,'z');box('Powder basin',-4.4,.9,-1.5,.55,.2,.8,white);cylinder('Guest toilet',-3.3,.25,-2.2,.55,.5,white);
 // Open-sky internal garden. The offset planting keeps an unobstructed route through it.
 plate('Courtyard stone',ARCH.courtyard,.012,stone);
 box('Courtyard planting bed',-1,.18,10,2.8,.36,3.8,soil,true);tree(-1,10,1.05);
 box('Courtyard bench',-3.4,.4,10,.65,.8,3,wood,true);plant(3.4,0,12.8);plant(-3.4,0,7.3);
 // Rear balconies are supported by slender piers, sheltered by aligned roof canopies.
 for(const b of balconies){
  plate('Private garden balcony',b,STOREY,stone);
  box('Balcony shelter',b.x,STOREY*2-.08,b.z,b.w,.24,b.d,plaster,true,true);
  for(const x of [b.x-b.w/2,b.x+b.w/2]){
   panel('Balcony support',x,b.z+b.d/2,.22,.22,0,STOREY*2,stone);
   panel('Balcony side guard',x,b.z,.06,b.d,STOREY,1.1,glass);
  }
  panel('Balcony rear guard',b.x,b.z+b.d/2,b.w,.06,STOREY,1.1,glass);
  sofa(b.x-1.5,STOREY,b.z,Math.PI);plant(b.x-b.w/2+.7,STOREY,b.z,.7);
 }
 // Guard every exposed rooftop edge, including the courtyard and stair cut-out.
 for(const e of outline(roofPlates)){
  if(Math.abs(Math.abs(e.x)-4)<.01&&Math.abs(e.z-4)<1)continue; // open stair ends
  const inward=(Math.abs(e.x)<=5.01&&e.z>=5.99&&e.z<=14.01),garden=e.z>=21.99;
  panel('Roof edge guard',e.x,e.z,e.w,e.d,STOREY*2,1.1,inward||garden?glass:plaster);
  if(inward||garden)box('Roof guard cap',e.x,STOREY*2+1.1,e.z,e.w,.05,e.d,dark);
 }
 // Lower setback roofs have low solid parapets. The deep street recess never becomes a ladder.
 const lower=rooms.filter(r=>r.floor===0).map(roomRect);
 for(const e of outline(lower)){
  const exteriorEdge=Math.abs(e.x)>7.1||e.z<0||e.z>21;
  const touchesUpper=rooms.some(r=>r.floor===1&&Math.abs(e.x-r.x)<=r.width/2+.02&&Math.abs(e.z-r.z)<=r.depth/2+.02);
  if(exteriorEdge&&!touchesUpper)panel('Setback roof coping',e.x,e.z,e.w,e.d,STOREY,.3,plaster);
 }
 for(const x of [8,13])for(const z of [15,20])panel('Roof pergola post',x,z,.14,.14,STOREY*2,2.65,dark);
 for(let z=15;z<=20;z+=.42)box('Roof pergola slat',10.5,STOREY*2+2.65,z,5.4,.18,.12,wood,true,true);
 sofa(10.5,STOREY*2,18);table(10.5,STOREY*2-.35,16.5,2,1);plant(13,STOREY*2,19.5);
 // Screened stair arrival: canopy supported on solid cheeks with an open side exit.
 box('Roof stair canopy',0,STOREY*2+2.8,4,8.4,.2,2.6,plaster,true,true);
 for(const x of [-4.1,4.1])for(const z of [2.8,5.2])panel('Roof stair canopy support',x,z,.18,.18,STOREY*2,2.8,dark);
 // Pool behind the house, on an uncluttered terrace. Water is deliberately inexpensive.
 slab('Pool terrace',-5,28,18,6,.02,stone);box('Pool coping',-5,.13,28,12,.24,4.5,white);box('Pool basin',-5,.26,28,11.5,.04,4,water);
 obstacles.push({name:'Pool edge',x:-5,z:28,w:11.5,d:4,bottom:0,top:.6});
 for(const x of [-11,-8,-5,-2]){box('Pool lounger',x,.4,25, .9,.3,1.8,white);const back=box('Lounger back',x,.65,25.65,.9,.08,.7,cloth);back.rotation.x=-.5;}
 // Gazebo east of the pool.
 slab('Gazebo deck',13,26,7,7,.12,wood);for(const x of [10,16])for(const z of [23,29])panel('Gazebo pillar',x,z,.18,.18,.12,3,dark);box('Gazebo canopy',13,3.3,26,7.5,.22,7.5,plaster);sofa(13,.12,28);sofa(15,.12,26,-Math.PI/2);table(13,-.18,26,2,1.2);zone('Gazebo',13,-.6,26,6,6);
 // Detached three-car garage with three independent doors.
 slab('Garage slab',23,0,12,9,0,stone);panel('Garage back',23,4.5,12,.25,0,3.6);panel('Garage west',17,0,.25,9,0,3.6);panel('Garage east',29,0,.25,9,0,3.6);box('Garage roof',23,3.7,0,12.5,.25,9.5,plaster,true,true);
 for(let i=0;i<3;i++){const x=17.3+i*4;door('Garage bay '+(i+1),x,0,-4.5,3.4,'x',dark,true);panel('Garage pier',x-.18,-4.5,.3,.25,0,3.6);box('Garage bay header',x+1.7,3.15,-4.5,3.4,.9,.25,plaster,true);}
 // Planted thresholds soften the private street wall without hiding the entry.
 for(const [x,z,w,d] of [[-11.5,-7.6,7.5,.8],[-18,9,1,6],[13.8,-4,1,2]] as const){
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
