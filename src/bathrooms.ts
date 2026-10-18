import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {Color3} from '@babylonjs/core/Maths/math.color';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture';
import type {Scene} from '@babylonjs/core/scene';
import {LEVEL,STOREY,type Obstacle} from './plan';
import {BATH,bathrooms,bathPoint,fixtureRect,bathroomDoor,type BathFixture} from './bathroomPlan';
import type {Door,LightZone} from './world';
import type {socialMaterials} from './interior';
type Social=ReturnType<typeof socialMaterials>;
export function bathroomMaterials(scene:Scene,m:Social,headless:boolean){
 const mat=(name:string,color:string,spec=.08)=>{const a=new StandardMaterial(name,scene);a.diffuseColor=Color3.FromHexString(color);a.specularColor.set(spec,spec,spec);return a;};
 const porcelain=mat('Bathroom satin greige porcelain','#ded9ce',.08),wall=mat('Bathroom ivory wall tile','#e8e3d8',.09),ceramic=mat('Sanitary ceramic','#f6f3eb',.3),glass=mat('Clear shower screen','#d7e7e6',.3),mirror=mat('Bathroom mirror approximation','#b0c3c4',.7),water=mat('Basin interior shadow','#b7c7c5',.3);
 glass.alpha=.15;glass.backFaceCulling=false;
 if(!headless)for(const [material,rows] of [[porcelain,10],[wall,5]] as const){
  const t=new DynamicTexture(material.name+' 600 mm joints',{width:512,height:512},scene,true),ctx=t.getContext() as CanvasRenderingContext2D;ctx.fillStyle=material.diffuseColor.toHexString();ctx.fillRect(0,0,512,512);ctx.strokeStyle='rgba(115,108,96,.18)';ctx.lineWidth=.7;
  for(let i=0;i<=10;i++){ctx.beginPath();ctx.moveTo(i*51.2,0);ctx.lineTo(i*51.2,512);ctx.stroke();}for(let j=0;j<=rows;j++){ctx.beginPath();ctx.moveTo(0,j*512/rows);ctx.lineTo(512,j*512/rows);ctx.stroke();}
  t.wrapU=t.wrapV=1;t.uScale=t.vScale=.5;t.update();material.diffuseTexture=t;material.diffuseColor=Color3.White();
 }
 return {porcelain,wall,ceramic,glass,mirror,water,marble:m.marble,wood:m.walnut,bronze:m.dark,ceiling:m.ceiling};
}
interface Context{
 scene:Scene;obstacles:Obstacle[];
 box:(name:string,x:number,y:number,z:number,w:number,h:number,d:number,m:StandardMaterial,solid?:boolean,shadow?:boolean)=>Mesh;
 cylinder:(name:string,x:number,y:number,z:number,d:number,h:number,m:StandardMaterial,top?:number)=>Mesh;
 door:(name:string,x:number,y:number,z:number,width:number,along:'x'|'z',material:StandardMaterial,slide?:boolean,reversed?:boolean,height?:number)=>Door;
 zone:(name:string,x:number,y:number,z:number,w:number,d:number,ceiling?:boolean)=>LightZone;
}
export function buildBathrooms(c:Context,m:ReturnType<typeof bathroomMaterials>){
 const {scene,box,cylinder,obstacles}=c;
 for(const b of bathrooms){
  const base=b.floor*STOREY,w=b.rect.w,d=b.rect.d,top=STOREY-LEVEL.slabThickness;
  const localBox=(name:string,u:number,y:number,v:number,width:number,height:number,depth:number,material:StandardMaterial,solid=false)=>{const p=bathPoint(b,u,v);return box(b.id+' '+name,p.x,base+y,p.z,width,height,depth,material,solid);};
  const wall=(name:string,u:number,v:number,width:number,depth:number,lo=0,hi=top)=>localBox(name,u,(lo+hi)/2,v,width,hi-lo,depth,m.wall,true);
  const door=bathroomDoor(b),opening=b.door.start;
  if(!b.half){
   wall('inner partition',w+BATH.partition/2,d/2,BATH.partition,d);
   wall('entry left partition',opening/2,-BATH.partition/2,opening,BATH.partition);
   wall('entry right partition',(opening+BATH.opening+w+BATH.partition)/2,-BATH.partition/2,w+BATH.partition-opening-BATH.opening,BATH.partition);
   wall('entry lintel',opening+BATH.opening/2,-BATH.partition/2,BATH.opening,BATH.partition,BATH.doorHeight);
  }else{
   wall('complete west enclosure',-.1,d/2,.2,d+.2);wall('complete south enclosure',w/2,-.1,w+.4,.2);
   wall('entry south pier',w+.1,opening/2,.2,opening);
   wall('entry north pier',w+.1,(opening+BATH.opening+d)/2,.2,d-opening-BATH.opening);
   wall('entry lintel',w+.1,opening+BATH.opening/2,.2,BATH.opening,BATH.doorHeight);
  }
  // The outer/rear room walls already exist. Only thin finishes are added, cut around the real window.
  const featureWidth=b.shower?.w??0;
  if(featureWidth)localBox('marble shower feature wall',featureWidth/2,BATH.ceiling/2,d+.01,featureWidth,BATH.ceiling,.02,m.marble);
  localBox('rear wall finish',(w+featureWidth)/2,BATH.ceiling/2,d+.01,w-featureWidth,BATH.ceiling,.02,m.wall);
  if(!b.half){
   const win=b.window!,lo=win.at-win.width/2-(b.rect.z-d/2),hi=lo+win.width;
   const finish=(start:number,end:number,low=0,high=BATH.ceiling)=>{if(end>start)localBox('window wall tile',-.01,(low+high)/2,(start+end)/2,.02,high-low,end-start,m.wall);};
   finish(0,lo);finish(hi,d);finish(lo,hi,0,win.sill);finish(lo,hi,win.head);
  }
  const along=door.along,startX=door.x-(along==='x'?BATH.opening/2:0),startZ=door.z-(along==='z'?BATH.opening/2:0);
  const leaf=c.door(b.name,startX+(along==='x'?BATH.jamb:0),base,startZ+(along==='z'?BATH.jamb:0),BATH.leaf,along,m.wood,false,!b.half&&b.mirror===1,BATH.doorHeight-.04);
  leaf.swing=b.half?-1:b.mirror;
  for(const end of [-1,1])box(b.id+' bronze door jamb',door.x+(along==='x'?end*(BATH.opening-BATH.jamb)/2:0),base+BATH.doorHeight/2,door.z+(along==='z'?end*(BATH.opening-BATH.jamb)/2:0),along==='x'?BATH.jamb:.24,BATH.doorHeight,along==='z'?BATH.jamb:.24,m.bronze,true);
  box(b.id+' door frame head',door.x,base+BATH.doorHeight-.0175,door.z,along==='x'?BATH.opening:.24,.035,along==='z'?BATH.opening:.24,m.bronze,true);
  // A complete finished ceiling, not a tray floating below an unfinished partition gap.
  localBox('finished ceiling',w/2,BATH.ceiling+.025,d/2,w,.05,d,m.ceiling);
  const light=c.zone(b.name,b.rect.x,base,b.rect.z,w,d,false);light.light.position.set(b.rect.x,base+2.65,b.rect.z);light.light.range=6;light.light.intensity=.8;
  for(const u of [w*.3,w*.72])for(const v of b.half?[d/2]:[d*.25,d*.72]){const p=bathPoint(b,u,v);cylinder(b.id+' recessed light',p.x,base+BATH.ceiling-.008,p.z,.095,.02,light.material);}
  localBox('extract grille',w-.4,BATH.ceiling-.008,d-.35,.28,.016,.28,m.bronze);
  for(let i=-2;i<=2;i++)localBox('extract grille slot',w-.4+i*.045,BATH.ceiling-.018,d-.35,.018,.004,.23,m.ceiling);
  function component(f:BathFixture,name:string,x:number,y:number,z:number,width:number,height:number,depth:number,material:StandardMaterial){
   const p=bathPoint(b,f.u+x*Math.cos(f.yaw)+z*Math.sin(f.yaw),f.v-x*Math.sin(f.yaw)+z*Math.cos(f.yaw));
   const mesh=box(b.id+' '+name,p.x,base+y,p.z,width,height,depth,material);mesh.rotation.y=b.mirror*f.yaw;return mesh;
  }
  function round(f:BathFixture,name:string,x:number,y:number,z:number,profile:number[][],sx:number,sz:number,material:StandardMaterial){
   const p=bathPoint(b,f.u+x*Math.cos(f.yaw)+z*Math.sin(f.yaw),f.v-x*Math.sin(f.yaw)+z*Math.cos(f.yaw));
   const mesh=MeshBuilder.CreateLathe(b.id+' '+name,{shape:profile.map(([r,h])=>new Vector3(r,h,0)),tessellation:24,sideOrientation:Mesh.DOUBLESIDE},scene);mesh.position.set(p.x,base+y,p.z);mesh.scaling.set(sx,1,sz);mesh.rotation.y=b.mirror*f.yaw;mesh.material=material;mesh.isPickable=true;mesh.metadata={solid:true};return mesh;
  }
  for(const f of b.fixtures){
   const footprint=fixtureRect(b,f);obstacles.push({...footprint,name:b.id+' '+f.kind+' footprint',bottom:base,top:base+(f.kind==='linen'?2.3:f.kind==='tub'?.60:f.kind==='toilet'?.82:.98)});
   if(f.kind==='vanity'){
    component(f,'walnut vanity cabinet',0,.46,0,f.w,.60,f.d-.03,m.wood);
    component(f,'vanity shadow recess',0,.17,0,f.w-.08,.05,f.d-.08,m.bronze);
    component(f,'marble countertop',0,.8,0,f.w+.015,.04,f.d,m.marble);
    for(let i=0;i<(f.basins??1)*2;i++){const x=-f.w/2+(i+.5)*f.w/((f.basins??1)*2);component(f,'drawer front',x,.49,f.d/2+.005,f.w/((f.basins??1)*2)-.012,.48,.018,m.wood);component(f,'drawer pull',x,.7,f.d/2+.022,.28,.018,.018,m.bronze);}
    for(const x of f.basins===2?[-.65,.65]:[0]){
     round(f,'hollow ceramic basin',x,.82,.045,[[0,0],[.16,0],[.235,.13],[.235,.15],[.205,.15],[.15,.035],[0,.035]],1,.8,m.ceramic);
     component(f,'basin drain',x,.858,.045,.035,.007,.035,m.bronze);
     component(f,'faucet stem',x,1.0,-.21,.028,.36,.028,m.bronze);component(f,'faucet spout',x,1.17,-.125,.028,.025,.19,m.bronze);component(f,'mixer lever',x+.055,1.04,-.21,.08,.018,.018,m.bronze);
    }
    component(f,'mirror backlight',0,1.79,-f.d/2+.015,f.w+.08,1.22,.025,light.material);
    component(f,'large mirror',0,1.79,-f.d/2+.04,f.w,1.14,.025,m.mirror);
    for(const x of [-f.w/2+.02,f.w/2-.02])component(f,'soft mirror vertical light',x,1.79,-f.d/2+.06,.022,1.08,.015,light.material);
    component(f,'toiletry tray',f.w/2-.19,.835,.02,.26,.025,.23,m.bronze);
    component(f,'soap dispenser',f.w/2-.18,.92,.02,.08,.15,.08,m.ceramic);
   }
   if(f.kind==='toilet'){
    round(f,'toilet pedestal',0,0,-.035,[[0,0],[.15,0],[.145,.28],[.10,.33],[0,.33]],1,1.35,m.ceramic);
    round(f,'open toilet bowl',0,0,-.06,[[0,.24],[.14,.24],[.22,.38],[.22,.43],[.17,.43],[.12,.29],[0,.29]],1,1.32,m.ceramic);
    round(f,'toilet seat ring',0,0,-.06,[[.175,.435],[.222,.435],[.222,.47],[.175,.47],[.175,.435]],1,1.32,m.ceramic);
    round(f,'toilet water',0,.295,-.06,[[0,0],[.10,0]],1,1.2,m.water);
    component(f,'toilet cistern',0,.51,.265,.38,.62,.14,m.ceramic);component(f,'dual flush button',.07,.828,.265,.095,.012,.045,m.bronze);
    component(f,'seat hinge',0,.455,.19,.22,.035,.04,m.bronze);
    component(f,'toilet roll holder',-.32,.65,.15,.07,.025,.13,m.bronze);
   }
   if(f.kind==='linen'){
    component(f,'linen cabinet',0,1.15,0,f.w,2.3,f.d,m.wood);
    for(const y of [.5,.95,1.4,1.85]){component(f,'linen open cubby',0,y+.15,f.d/2+.005,f.w-.09,.27,.012,m.bronze);component(f,'folded ivory towels',0,y+.06,f.d/2+.035,f.w-.15,.10,.08,m.ceramic);}
   }
   if(f.kind==='tub'){
    round(f,'freestanding hollow bathtub',0,0,0,[[0,0],[.31,0],[.425,.49],[.425,.60],[.36,.60],[.28,.18],[0,.18]],f.w/.85,f.d/.85,m.ceramic);
    component(f,'tub waste',.35,.185,0,.045,.008,.045,m.bronze);
    component(f,'floor bath mixer',-.65,.4,-.56,.045,.8,.045,m.bronze);component(f,'bath filler spout',-.65,.81,-.45,.045,.035,.25,m.bronze);
   }
  }
  if(b.shower){
   const s=b.shower,front=d-s.d;
   localBox('shower front glass',s.w/2,1.125,front,s.w,2.25,.018,m.glass,true);
   localBox('shower return glass',s.w,1.125,(front+s.entry+d)/2,.018,2.25,d-front-s.entry,m.glass,true);
   for(const u of [.08,s.w-.08])for(const h of [.22,1.95])localBox('screen restraint',u,h,front,.05,.045,.035,m.bronze);
   localBox('shower glass top brace',s.w/2,2.25,front,s.w,.018,.018,m.bronze);
   localBox('linear shower drain',s.w/2,.001,d-.10,s.w-.18,.004,.045,m.bronze);
   // Flush wet zone on the existing floor datum; actual falls/waterproofing are a later detail.
   localBox('shower controls',.025,1.12,d-.65,.035,.28,.16,m.bronze);
   localBox('rain shower riser',.05,1.86,d-.65,.025,1.1,.025,m.bronze);
   localBox('rain shower arm',.32,2.4,d-.65,.58,.025,.025,m.bronze);
   localBox('rain shower head',.58,2.38,d-.65,.28,.035,.28,m.bronze);
   localBox('shower toiletry shelf',.14,1.35,d-.2,.26,.04,.34,m.marble);
   for(const v of [d-.28,d-.15])localBox('shower bottle',.14,1.45,v,.055,.16,.055,m.ceramic);
  }
  for(const p of b.partitions??[])localBox('WC privacy partition',p.u,p.h/2,p.v,p.w,p.h,p.d,m.marble,true);
  for(const v of b.half?[.4]:[1.4,1.7])localBox('towel hook',w-.04,1.6,v,.08,.04,.04,m.bronze);
  if(!b.half)localBox('hanging hand towel',w-.075,1.3,1.4,.035,.52,.30,m.ceramic);
 }
}
