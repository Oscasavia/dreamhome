import {Scene} from '@babylonjs/core/scene';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {MAIN_STAIR,LEVEL,stairs,stairLandings,stairPoint,type Obstacle} from './plan';
import type {LightZone} from './world';
interface Context{
 scene:Scene;obstacles:Obstacle[];castShadow:(mesh:Mesh)=>void;
 box:(name:string,x:number,y:number,z:number,w:number,h:number,d:number,m:StandardMaterial,solid?:boolean,shadow?:boolean)=>Mesh;
 cylinder:(name:string,x:number,y:number,z:number,d:number,h:number,m:StandardMaterial,top?:number)=>Mesh;
 panel:(name:string,x:number,z:number,w:number,d:number,base:number,h?:number,m?:StandardMaterial)=>Mesh;
 zone:(name:string,x:number,y:number,z:number,w:number,d:number,ceiling?:boolean)=>LightZone;
}
export function buildStairs(c:Context,stone:StandardMaterial,bronze:StandardMaterial,roofGlass:StandardMaterial,glass:StandardMaterial){
 const {scene,box,panel,cylinder,obstacles}=c;
 const light=c.zone('Arrival stair',MAIN_STAIR.landing.x,0,3.5,4,7,false);light.light.position.set(2.7,4.7,4.5);light.light.range=10;
 function rail(name:string,a:Vector3,b:Vector3,width=.05){
  const mesh=MeshBuilder.CreateTube(name,{path:[a,b],radius:width/2,tessellation:8,cap:Mesh.CAP_ALL},scene);mesh.material=bronze;mesh.isPickable=true;mesh.metadata={solid:true};
  if(Math.abs(a.y-b.y)<.001)obstacles.push({name,x:(a.x+b.x)/2,z:(a.z+b.z)/2,w:Math.max(width,Math.abs(b.x-a.x)),d:Math.max(width,Math.abs(b.z-a.z)),bottom:a.y-width/2,top:a.y+width/2});
  return mesh;
 }
 for(const s of stairs){
  const main=s.level===0,offset=main?MAIN_STAIR.railOffset:s.w/2+.025,tread=main?MAIN_STAIR.treadThickness:.15,guard=main?MAIN_STAIR.guardHeight:1.05;
  for(let i=0;i<s.steps;i++){
   const p=stairPoint(s,(i+.5)/s.steps),top=s.base+(i+1)*s.rise/s.steps;
   const mesh=box(main?'Main floating stone tread':'Roof stair tread',p.x,top-tread/2,p.z,s.w,tread,s.d/s.steps,stone,false,true);mesh.isPickable=true;mesh.metadata={solid:true};
   if(main&&i%2===0)box('Main stair recessed tread glow',p.x,top-.07,p.z-s.direction*(s.d/s.steps/2+.004),s.w-.25,.018,.012,light.material);
   if(!main)box('Roof stair riser',p.x,top-s.rise/s.steps/2,p.z-s.direction*s.d/s.steps/2,s.w,s.rise/s.steps,.035,stone);
  }
  // The collision envelope follows the stringer underside. It prevents entering low-headroom space,
  // but permits the same 175 mm risers + avatar footprint that the continuous ramp traverses.
  for(let i=0;i<48;i++){
   const p=stairPoint(s,(i+.5)/48);obstacles.push({name:'Stair structure headroom',x:p.x,z:p.z,w:s.w,d:s.d/48,bottom:p.y-.38,top:p.y,stairStructure:true});
  }
  for(const side of [-1,1]){
   const stringer=box('Bronze stair stringer',s.x+side*(s.w/2-.28),s.base+s.rise/2-.25,s.z,.12,.22,Math.hypot(s.d,s.rise),bronze,false,true);stringer.rotation.x=-s.direction*Math.atan2(s.rise,s.d);stringer.isPickable=true;stringer.metadata={solid:true};
   const x=s.x+side*offset;
   const a=stairPoint(s,0),b=stairPoint(s,1);
   rail('Continuous stair handrail',new Vector3(x,a.y+guard,a.z),new Vector3(x,b.y+guard,b.z));
   if(main){
    for(let i=0;i<6;i++){
     const a=stairPoint(s,(i+.015)/6),b=stairPoint(s,(i+.985)/6);
     const pane=MeshBuilder.CreateRibbon('Main stair glass panel',{pathArray:[[new Vector3(x,a.y+.1,a.z),new Vector3(x,b.y+.1,b.z)],[new Vector3(x,a.y+guard-.035,a.z),new Vector3(x,b.y+guard-.035,b.z)]]},scene);
     pane.material=glass;pane.isPickable=true;pane.metadata={solid:true};
     for(const p of [a,b]){const fixing=cylinder('Glass restraint button',x,p.y+.22,p.z,.045,.025,bronze);fixing.rotation.z=Math.PI/2;}
    }
   }else for(let i=0;i<24;i++){const p=stairPoint(s,(i+.5)/24);box('Roof stair vertical baluster',x,p.y+.5,p.z,.025,1,.025,bronze);}
   // Small rectangles follow the same sloping glass/rail profile rather than blocking a whole storey.
   for(let i=0;i<48;i++){const p=stairPoint(s,(i+.5)/48);obstacles.push({name:'Stair sloping guard',x,z:p.z,w:.05,d:s.d/48,bottom:p.y,top:p.y+guard+.025});}
  }
 }
 for(const l of stairLandings){
  const main=l.level===0,g=main?glass:roofGlass,left=main?MAIN_STAIR.lowerX-MAIN_STAIR.railOffset:l.x-l.w/2,right=main?MAIN_STAIR.upperX+MAIN_STAIR.railOffset:l.x+l.w/2;
  const front=l.z-l.d/2,back=l.z+l.d/2-(main?.075:0),h=1.1;
  panel('Stair landing back glass',(left+right)/2,back,right-left,.02,l.y,h,g);
  rail('Landing back handrail',new Vector3(left,l.y+h,back),new Vector3(right,l.y+h,back));
  for(const x of [left,right]){
   panel('Stair landing side glass',x,(front+back)/2,.02,back-front,l.y,h,g);
   rail('Landing side handrail',new Vector3(x,l.y+h,front),new Vector3(x,l.y+h,back));
  }
  if(main){
   const a=MAIN_STAIR.lowerX+MAIN_STAIR.railOffset,b=MAIN_STAIR.upperX-MAIN_STAIR.railOffset;
   panel('Main interflight landing guard',(a+b)/2,front,b-a,.02,l.y,h,glass);
   rail('Inner rail turning connection',new Vector3(a,l.y+h,front),new Vector3(b,l.y+h,front));
   box('Main landing bronze edge beam',l.x,l.y-LEVEL.slabThickness-.09,back,l.w,.18,.14,bronze,false,true);
   for(const x of [left+.05,right-.05])box('Main landing supporting post',x,(l.y-LEVEL.slabThickness)/2,back-.1,.14,l.y-LEVEL.slabThickness,.14,bronze,true,true);
   obstacles.push({name:'Main landing headroom',x:l.x,z:l.z,w:l.w,d:l.d,bottom:l.y-LEVEL.slabThickness-.18,top:l.y,stairStructure:true});
  }
 }
}
