import {MAIN_STAIR,LEVEL,mainStairs,upperPlates,roofPlates,stairLandings,stairPoint,type Obstacle} from './plan';
export const FURNITURE={length:2.2,width:1,height:.9,carryCentre:1.2};
export interface CarryPose{x:number;y:number;z:number;yaw:number;pitch:number;stage:string}
// Rigid object, carried horizontally on landings and pitched along the flights. No deformation.
export function furnitureRoute():CarryPose[]{
 const out:CarryPose[]=[];let current:CarryPose={x:5.5,y:FURNITURE.carryCentre,z:-6,yaw:0,pitch:0,stage:'Entrance'};
 const to=(stage:string,next:Partial<CarryPose>)=>{
  const target={...current,...next,stage},n=Math.max(1,Math.ceil(Math.hypot(target.x-current.x,target.y-current.y,target.z-current.z)/.025),Math.ceil(Math.abs(target.yaw-current.yaw)*180/Math.PI),Math.ceil(Math.abs(target.pitch-current.pitch)*180/Math.PI));
  for(let i=0;i<=n;i++){const t=i/n;out.push({stage,x:current.x+(target.x-current.x)*t,y:current.y+(target.y-current.y)*t,z:current.z+(target.z-current.z)*t,yaw:current.yaw+(target.yaw-current.yaw)*t,pitch:current.pitch+(target.pitch-current.pitch)*t});}current=target;
 };
 const lower=mainStairs[0],upper=mainStairs[1],angle=Math.atan2(lower.rise,lower.d),landing=MAIN_STAIR.landing;
 to('Entrance',{z:-1.8});to('Foyer turn',{yaw:Math.PI/2});to('Stair approach',{x:lower.x});to('Align with first flight',{yaw:0,z:-.3});
 to('Pitch before first flight',{pitch:angle});to('First foot',{z:MAIN_STAIR.startZ});
 to('First flight',{z:MAIN_STAIR.startZ+lower.d,y:lower.rise+FURNITURE.carryCentre});
 to('Level on turning landing',{pitch:0});to('Landing depth',{z:landing.z});to('Landing centre',{x:landing.x});
 to('Rigid 180 degree turn',{yaw:Math.PI});to('Align with return flight',{x:upper.x});to('Pitch before return flight',{pitch:angle});
 to('Return foot',{z:MAIN_STAIR.startZ+upper.d});to('Return flight',{z:MAIN_STAIR.startZ,y:LEVEL.upper+FURNITURE.carryCentre});
 to('Level at upper arrival',{pitch:0});to('Upper arrival',{z:-.4});to('Upper turning space',{yaw:Math.PI/2});
 to('Front gallery to private hall',{x:-1});to('Private hall turn',{yaw:0});to('Bedroom circulation',{z:12.9});
 return out;
}
const dot=(a:number[],b:number[])=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a:number[],b:number[])=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export function carryAxes(p:CarryPose){const s=Math.sin(p.yaw),c=Math.cos(p.yaw),sp=Math.sin(p.pitch),cp=Math.cos(p.pitch);return [[c,0,-s],[-s*sp,cp,-c*sp],[s*cp,sp,c*cp]];}
// Full 3D separating-axis test: object orientation, vertical tilt and all 9 cross-product axes.
export function furnitureHits(p:CarryPose,o:Obstacle){
 const axes=carryAxes(p),half=[FURNITURE.width/2,FURNITURE.height/2,FURNITURE.length/2],world=[[1,0,0],[0,1,0],[0,0,1]],extent=[o.w/2,(o.top-o.bottom)/2,o.d/2],delta=[p.x-o.x,p.y-(o.bottom+o.top)/2,p.z-o.z];
 const separated=(a:number[])=>Math.abs(dot(delta,a))>=half.reduce((sum,h,i)=>sum+h*Math.abs(dot(axes[i],a)),0)+extent.reduce((sum,h,i)=>sum+h*Math.abs(a[i]),0)-.0001;
 if(world.some(separated))return false;
 return ![...axes,...axes.flatMap(a=>world.map(b=>cross(a,b)))].some(a=>dot(a,a)>1e-10&&separated(a));
}
export function clearanceSolids(obstacles:Obstacle[]):Obstacle[]{
 const plates=[...upperPlates.map(r=>({...r,y:LEVEL.upper})),...roofPlates.map(r=>({...r,y:LEVEL.roof})),...stairLandings];
 const treads=mainStairs.flatMap(s=>Array.from({length:s.steps},(_,i)=>{const p=stairPoint(s,(i+.5)/s.steps),top=s.base+(i+1)*s.rise/s.steps;return {name:'Finished stone tread',x:p.x,z:p.z,w:s.w,d:s.d/s.steps,bottom:top-MAIN_STAIR.treadThickness,top};}));
 // Reserve 140 mm beneath structural slabs for the lowest existing floating ceiling finish.
 // Apply this conservatively across each floor plate, including where there is no suspended finish.
 const ceilings=[...upperPlates.map(r=>({...r,y:LEVEL.upper})),...roofPlates.map(r=>({...r,y:LEVEL.roof}))].map(r=>({...r,name:'Ceiling finish allowance',bottom:r.y-LEVEL.slabThickness-.14,top:r.y-LEVEL.slabThickness}));
 return [...obstacles,...treads,...ceilings,...plates.map(r=>({...r,name:'Structural floor underside',bottom:r.y-LEVEL.slabThickness,top:r.y}))];
}
