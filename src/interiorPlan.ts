import {ARCH,LEVEL,MAIN_STAIR,bounds,disjoint,type Rect} from './plan';

// Furniture and clearance dimensions in metres, coordinated with the living void and side gallery.
export const SOCIAL={
 ceiling:LEVEL.roof-LEVEL.slabThickness,
 lowCeiling:LEVEL.upper-LEVEL.slabThickness,
 floorAreas:disjoint([ARCH.foyer,ARCH.living,ARCH.dining,ARCH.kitchen]),
 media:{x:.2,z:11.5,width:7.8,marbleWidth:5.6,tvCentre:1.85,tvWidth:2.65,tvHeight:1.49},
 sofa:{x:4.7,z:12.3,w:1.08,d:3.9},chaise:{x:3.85,z:13.75,w:1.7,d:1.05},
 coffee:{x:2.6,z:12.2,w:1.35,d:2.25},rug:bounds(1.05,5.5,9.4,14.75),
 dining:{x:8.3,z:14.25,w:1.18,d:3.5,height:.75},
 island:{x:13.4,z:13.8,w:1.3,d:4.4,height:.94,edge:.055,overhang:.34},
 cabinet:{x:16.25,z:12.425,w:.7,d:3.95,height:.9},
 chandelier:{x:2.9,z:12.0,width:2.7,depth:2.1,lowest:3.25,count:13},
 routes:{stairApproach:[[5.5,-3.5],[5.5,-1.8],[MAIN_STAIR.lowerX,-1.8],[MAIN_STAIR.lowerX,.7]],
  arrival:[[5.5,-7],[5.5,2],[5.9,2],[5.9,10]],
  kitchen:[[5.9,10],[5.9,10.8],[14.7,10.8],[14.7,15.6],[14.95,15.6],[14.95,17.2]],
  garden:[[5.9,10],[5.9,17.5],[6.5,17.5],[6.5,21]],
  islandLoop:[[11,10.8],[14.7,10.8],[14.7,15.6],[14.95,15.6]],
  islandRear:[[11,10.8],[11,17.5],[12.5,17.5]],
  court:[[5.9,6.5],[9.8,6.5],[9.8,8.6]],
 } as Record<string,number[][]>,
} as const;
export interface Seat {x:number;z:number;yaw:number;pull:number;kind:'chair'|'stool'}
export const diningSeats:Seat[]=[
 ...[-1,1].flatMap(side=>[-1.2,-.4,.4,1.2].map((offset,i)=>({x:SOCIAL.dining.x+side*(SOCIAL.dining.w/2+.4),z:SOCIAL.dining.z+offset,yaw:side<0?Math.PI/2:-Math.PI/2,pull:i===1?.25:0,kind:'chair' as const}))),
 ...[-1,1].map(side=>({x:SOCIAL.dining.x,z:SOCIAL.dining.z+side*(SOCIAL.dining.d/2+.4),yaw:side<0?0:Math.PI,pull:.1,kind:'chair' as const})),
];
export const islandSeats:Seat[]=Array.from({length:5},(_,i)=>({x:SOCIAL.island.x-SOCIAL.island.w/2-.4,z:SOCIAL.island.z+(i-2)*.85,yaw:Math.PI/2,pull:i%2?.15:0,kind:'stool'}));
export function seatPosition(s:Seat,pull=s.pull){return {x:s.x-Math.sin(s.yaw)*pull,z:s.z-Math.cos(s.yaw)*pull};}
// Swept envelope includes a seated person and 450 mm chair pull-back; used by circulation checks.
export function occupiedSeat(s:Seat):Rect{
 const a=seatPosition(s,0),b=seatPosition(s,.45),w=s.kind==='chair'?.66:.6,d=.72;
 const wx=Math.abs(Math.cos(s.yaw))*w+Math.abs(Math.sin(s.yaw))*d,dz=Math.abs(Math.sin(s.yaw))*w+Math.abs(Math.cos(s.yaw))*d;
 return bounds(Math.min(a.x,b.x)-wx/2,Math.max(a.x,b.x)+wx/2,Math.min(a.z,b.z)-dz/2,Math.max(a.z,b.z)+dz/2);
}
