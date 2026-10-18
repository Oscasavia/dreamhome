import {bathForSuite,bathrooms,bathRoute} from './bathroomPlan';
export const ACRE_M2=4046.8564224;
export const SITE_SIDE=Math.sqrt(ACRE_M2);
export const STOREY=4.2;
export const LEVEL={ground:0,upper:STOREY,roof:STOREY*2,site:-.75,eye:1.65,finish:.003,slabThickness:.24} as const;
export interface Rect {x:number;z:number;w:number;d:number}
export const bounds=(x0:number,x1:number,z0:number,z1:number):Rect=>({x:(x0+x1)/2,z:(z0+z1)/2,w:x1-x0,d:z1-z0});
// Approved image: south/front is -Z, east is +X. Exterior grade is 750 mm below the house.
export const SITE={
 forecourt:bounds(-20,19.5,-29,-10.4),gateApproach:bounds(-3.5,8,-31.81,-29),
 garage:bounds(21,30,-18,-6),garageApron:bounds(13,21,-19,-5),
 garageDoorX:21,garageBayCentres:[-16,-12,-8],garageDoorWidth:3.4,garageHeight:3.6,
 veranda:bounds(.6,9,-8,-5),leftVestibule:bounds(-13.4,-2.2,-6.8,-3),
 entrance:{x:5.5,z:-5,width:2.6},frontBalcony:bounds(.6,9,-6.4,-3),leftBalcony:bounds(-13,-6,-6.8,-3),
} as const;
export const ARCH={
 courtyard:bounds(9,13.5,5,10),foyer:bounds(0,9,-5,1),living:bounds(0,9,1,16),
 livingVoid:bounds(0,6.5,1,16),dining:bounds(0,9,11,20),kitchen:bounds(9,17,10,20),
 privateHall:bounds(-2,0,-5,20),stairBay:bounds(-6,-2,-5,3),stairOpening:bounds(-5.95,-2.05,-3.6,2.4),
 overlook:bounds(0,9,16,18),eastGallery:bounds(6.5,9,1,16),frontGallery:bounds(0,9,-3,1),
 wardrobe:bounds(-12.7,-7,11.2,14.4),pantry:bounds(13.6,16.8,16.5,19.8),
 powder:bounds(-12.5,-9.5,-5,-3),rearTerrace:bounds(0,9,18,20),
 entryZ:-5,rearZ:20,wall:.24,
} as const;
export type RoomKind='bedroom'|'office'|'gym'|'cinema'|'kitchen'|'lounge';
export interface Room {id:string;name:string;floor:number;x:number;z:number;width:number;depth:number;kind:RoomKind;ensuite?:boolean;master?:boolean;entry:{x:number;z:number;along:'x'|'z';width:number};open?:boolean}
const room=(id:string,name:string,floor:number,r:Rect,kind:RoomKind,entry:Room['entry'],extras:Partial<Room>={}):Room=>({id,name,floor,x:r.x,z:r.z,width:r.w,depth:r.d,kind,entry,...extras});
export const rooms:Room[]=[
 room('office','Study',0,bounds(-13,-6,-3,3),'office',{x:-8,z:-3,along:'x',width:1.4}),
 room('suite-1','Garden suite 01',0,bounds(-13,-2,3,11),'bedroom',{x:-2,z:4.2,along:'z',width:1.4},{ensuite:true}),
 room('suite-2','Garden suite 02',0,bounds(-15,-2,11,20),'bedroom',{x:-2,z:12.2,along:'z',width:1.4},{ensuite:true}),
 room('cinema','Cinema',0,bounds(9,17,-3,4),'cinema',{x:9,z:-1.4,along:'z',width:1.4}),
 room('gym','Wellness studio',0,bounds(13.5,17,4,10),'gym',{x:14.6,z:10,along:'x',width:1.4}),
 room('kitchen','Open kitchen',0,ARCH.kitchen,'kitchen',{x:9,z:10.2,along:'z',width:1.2},{open:true}),
 room('suite-3','Bedroom suite 03',1,bounds(-13,-6,-3,3),'bedroom',{x:-8,z:-3,along:'x',width:1.4},{ensuite:true}),
 room('suite-4','Bedroom suite 04',1,bounds(-10,-2,3,11),'bedroom',{x:-2,z:4.2,along:'z',width:1.4},{ensuite:true}),
 room('master','Primary suite',1,bounds(-15,-2,11,20),'bedroom',{x:-2,z:12.2,along:'z',width:1.4},{ensuite:true,master:true}),
 room('suite-5','Bedroom suite 05',1,bounds(9,17,10,20),'bedroom',{x:9,z:11.7,along:'z',width:1.4},{ensuite:true}),
 room('lounge','Family lounge',1,bounds(9,14.4,-3,3.6),'lounge',{x:9,z:-1.4,along:'z',width:1.4})
];
export const roomRect=(r:Room):Rect=>({x:r.x,z:r.z,w:r.width,d:r.depth});
export const roomEntry=(r:Room)=>r.entry;
export const ensuiteRect=(r:Room):Rect=>bathForSuite(r.id).rect;
export const balconies=[bounds(-15,-2,20,23),bounds(9,17,20,22.8)];
export const galleries=[ARCH.privateHall,ARCH.frontGallery,ARCH.eastGallery,ARCH.overlook];
export interface Stair extends Rect {base:number;rise:number;direction:1|-1;steps:number;level:number}
export const MAIN_STAIR={
 lowerX:1.55,upperX:3.85,startZ:1,run:4.2,treadWidth:2,clearWidth:1.8,
 railThickness:.05,railOffset:.925,guardHeight:1.1,treadThickness:.12,
 approach:bounds(.3,2.8,-1.5,1),arrival:bounds(2.6,5.1,-1.5,1),
 landing:bounds(.55,4.85,5.2,8),
} as const;
export const mainStairs:Stair[]=[
 {x:MAIN_STAIR.lowerX,z:MAIN_STAIR.startZ+MAIN_STAIR.run/2,w:MAIN_STAIR.treadWidth,d:MAIN_STAIR.run,base:LEVEL.ground,rise:STOREY/2,direction:1,steps:12,level:0},
 {x:MAIN_STAIR.upperX,z:MAIN_STAIR.startZ+MAIN_STAIR.run/2,w:MAIN_STAIR.treadWidth,d:MAIN_STAIR.run,base:STOREY/2,rise:STOREY/2,direction:-1,steps:12,level:0},
];
export const roofStairs:Stair[]=[
 {x:-5.1,z:-1.5,w:1.6,d:4.2,base:LEVEL.upper,rise:STOREY/2,direction:1,steps:12,level:1},
 {x:-2.9,z:-1.5,w:1.6,d:4.2,base:LEVEL.upper+STOREY/2,rise:STOREY/2,direction:-1,steps:12,level:1},
];
export const stairs:Stair[]=[...mainStairs,...roofStairs];
export const approachStairs:Stair[]=[
 {x:4.8,z:-9.2,w:8.2,d:2.4,base:LEVEL.site,rise:-LEVEL.site,direction:1,steps:5,level:-1},
 {x:6.5,z:24.9,w:3.8,d:1.8,base:LEVEL.site,rise:-LEVEL.site,direction:-1,steps:5,level:-1},
];
export const stairLandings=[{...MAIN_STAIR.landing,y:STOREY/2,level:0},{...bounds(-5.95,-2.05,.6,2.4),y:LEVEL.upper+STOREY/2,level:1}];
export const stairPoint=(s:Stair,t:number)=>({x:s.x,z:s.z+s.direction*(t-.5)*s.d,y:s.base+t*s.rise});
export const inside=(x:number,z:number,r:Rect,margin=0)=>Math.abs(x-r.x)<r.w/2+margin&&Math.abs(z-r.z)<r.d/2+margin;
export function subtractRects(base:Rect,cuts:Rect[]):Rect[]{
 let pieces=[base];for(const c of cuts){const next:Rect[]=[];for(const r of pieces){
 const l=r.x-r.w/2,rr=r.x+r.w/2,b=r.z-r.d/2,t=r.z+r.d/2,il=Math.max(l,c.x-c.w/2),ir=Math.min(rr,c.x+c.w/2),ib=Math.max(b,c.z-c.d/2),it=Math.min(t,c.z+c.d/2);
 if(il>=ir||ib>=it){next.push(r);continue;}
 const add=(x0:number,x1:number,z0:number,z1:number)=>{if(x1-x0>.0001&&z1-z0>.0001)next.push(bounds(x0,x1,z0,z1));};
 add(l,il,b,t);add(ir,rr,b,t);add(il,ir,b,ib);add(il,ir,it,t);
 }pieces=next;}return pieces;
}
export function disjoint(rects:Rect[],cuts:Rect[]=[]):Rect[]{const out:Rect[]=[];for(const r of rects)out.push(...subtractRects(r,[...out,...cuts]));return out;}
const footprint=[...rooms.filter(r=>!r.floor).map(roomRect),bounds(-13,0,-5,-3),ARCH.privateHall,ARCH.stairBay,ARCH.foyer,ARCH.living,ARCH.dining,bounds(9,13.5,4,5)];
export const groundPlates=disjoint([...footprint,SITE.leftVestibule,SITE.veranda]);
export const upperPlates=disjoint([...footprint,...balconies,SITE.leftVestibule,SITE.frontBalcony],[ARCH.livingVoid]);
export const roofPlates=disjoint([...footprint,SITE.leftVestibule,SITE.veranda],[ARCH.stairOpening,ARCH.rearTerrace]);
export function outline(rects:Rect[]):Rect[]{
 const xs=[...new Set(rects.flatMap(r=>[r.x-r.w/2,r.x+r.w/2]))].sort((a,b)=>a-b),zs=[...new Set(rects.flatMap(r=>[r.z-r.d/2,r.z+r.d/2]))].sort((a,b)=>a-b),out:Rect[]=[];
 const occupied=(x:number,z:number)=>rects.some(r=>inside(x,z,r));
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){
  const x=(xs[i]+xs[i+1])/2,z=(zs[j]+zs[j+1])/2,w=xs[i+1]-xs[i],d=zs[j+1]-zs[j];if(!occupied(x,z))continue;
  for(const sign of [-1,1]){if(!occupied(x+sign*(w/2+.001),z))out.push({x:x+sign*w/2,z,w:ARCH.wall,d});if(!occupied(x,z+sign*(d/2+.001)))out.push({x,z:z+sign*d/2,w,d:ARCH.wall});}
 }return out;
}
export const destinations=[
 ...bathrooms.map(b=>({id:'bath-'+b.id,...bathRoute(b)[2],name:b.name,y:b.floor*STOREY,yaw:0})),
 {id:'arrival',name:'Open arrival court',x:5.5,y:LEVEL.site,z:-16,yaw:0},
 {id:'foyer',name:'Entrance foyer',x:5.5,y:LEVEL.ground,z:-3.5,yaw:0},
 {id:'living',name:'Living / dining / kitchen',x:5.9,y:LEVEL.ground,z:3,yaw:0},
 {id:'courtyard',name:'Family courtyard',x:9.75,y:LEVEL.ground,z:7,yaw:0},
 {id:'stair',name:'Main stair approach',x:MAIN_STAIR.lowerX,y:LEVEL.ground,z:-.5,yaw:0},
 {id:'upper',name:'Living overlook',x:4.5,y:LEVEL.upper,z:17,yaw:Math.PI},
 {id:'primary',name:'Primary private hall',x:-1,y:LEVEL.upper,z:13,yaw:-Math.PI/2},
 {id:'entrance-balcony',name:'Entrance balcony',x:5.5,y:LEVEL.upper,z:-5.7,yaw:Math.PI},
 {id:'west-loggia',name:'Suite 04 west loggia',x:-11.5,y:LEVEL.upper,z:5.6,yaw:-Math.PI/2},
 {id:'east-loggia',name:'Family lounge east loggia',x:15.6,y:LEVEL.upper,z:.5,yaw:Math.PI/2},
 {id:'roof',name:'Rooftop terrace',x:4,y:LEVEL.roof,z:8,yaw:0},
 {id:'pool',name:'Pool & gazebo',x:6.5,y:LEVEL.site,z:25,yaw:-Math.PI/2},
 {id:'garage',name:'West-facing three-car garage',x:17,y:LEVEL.site,z:-16,yaw:Math.PI/2}
];
export interface Obstacle extends Rect {bottom:number;top:number;active?:()=>boolean;name:string;stairStructure?:boolean}
export interface Surface extends Rect {y:number;name?:string}
export function blocked(x:number,z:number,feet:number,obstacles:Obstacle[],radius=.23){return obstacles.some(o=>(!o.active||o.active())&&feet+(o.stairStructure?2.1:1.72)>o.bottom+.04&&feet<o.top-(o.stairStructure?.36:.08)&&inside(x,z,o,radius));}
export function groundHeight(x:number,z:number,current:number,surfaces:Surface[]){
 let best=LEVEL.site as number;
 for(const s of surfaces)if(inside(x,z,s,.001)&&s.y<=current+.22)best=Math.max(best,s.y);
 for(const s of [...stairs,...approachStairs]){const t=.5+s.direction*(z-s.z)/s.d,h=s.base+t*s.rise;if(inside(x,z,s,.001)&&t>=-.001&&t<=1.001&&h<=current+.22)best=Math.max(best,h);}
 return best;
}
