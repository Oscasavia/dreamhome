import type {Rect,Room} from './plan';
// All bathroom rectangles are CLEAR finished dimensions. Local +u points inward from the outer wall,
// +v points rearward. Only the east suite mirrors u. No runtime dependency on plan.ts.
export const BATH={partition:.20,finish:.02,ceiling:3.76,opening:1.25,jamb:.035,leaf:1.18,hardwareProjection:.115,doorHeight:2.45,glassHeight:2.25};
export interface BathFixture {kind:'vanity'|'toilet'|'linen'|'tub';u:number;v:number;w:number;d:number;yaw:number;basins?:number}
export interface Bathroom {id:string;name:string;suite?:string;floor:number;rect:Rect;mirror:1|-1;primary?:boolean;half?:boolean;fixtures:BathFixture[];shower?:{w:number;d:number;entry:number};window?:{at:number;width:number;sill:number;head:number};partitions?:{u:number;v:number;w:number;d:number;h:number}[];door:{side:'front'|'inner';start:number};}
const clear=(left:number,rear:number,w:number,d:number):Rect=>({x:left+w/2,z:rear-d/2,w,d});
const standard=(id:string,name:string,floor:number,left:number,rear:number,w:number,d:number,vanity:number,showerD:number,windowAt:number,mirror:1|-1=1):Bathroom=>({id,name,suite:id,floor,mirror,rect:clear(left,rear,w,d),door:{side:'front',start:w-1.45},window:{at:windowAt,width:1.4,sill:2.4,head:3.35},shower:{w:1.5,d:showerD,entry:1.05},fixtures:[
 {kind:'vanity',u:.30,v:.3+vanity/2,w:vanity,d:.6,yaw:Math.PI/2,basins:1},
 {kind:'toilet',u:w-.65,v:d-.43,w:.46,d:.74,yaw:0},
 {kind:'linen',u:1.85,v:d-.21,w:.4,d:.42,yaw:Math.PI},
]});
export const bathrooms:Bathroom[]=[
 standard('suite-1','Garden suite 01 bathroom',0,-12.74,10.86,3.6,3.8,1.8,1.5,9.2),
 standard('suite-2','Garden suite 02 bathroom',0,-14.74,19.80,3.6,4,1.8,1.6,18.1),
 standard('suite-3','Bedroom suite 03 bathroom',1,-12.74,2.86,3.2,4,1.5,1.6,1.5),
 standard('suite-4','Bedroom suite 04 bathroom',1,-9.74,10.86,3.6,3.6,1.5,1.5,9.2),
 {id:'master',suite:'master',name:'Primary suite bathroom',floor:1,mirror:1,primary:true,partitions:[{u:3.8,v:2.15,w:.12,d:1.2,h:1.44},{u:4.5,v:2.75,w:1.4,d:.12,h:1.44}],rect:clear(-14.74,19.86,5.2,4.2),door:{side:'front',start:3.75},window:{at:18.2,width:2,sill:2.4,head:3.35},shower:{w:1.6,d:1.8,entry:1.1},fixtures:[
  {kind:'vanity',u:1.75,v:.3,w:2.8,d:.6,yaw:0,basins:2},
  {kind:'toilet',u:4.55,v:2.30,w:.46,d:.74,yaw:0},
  {kind:'linen',u:3.46,v:.24,w:.44,d:.48,yaw:0},
  {kind:'tub',u:3.25,v:3.225,w:1.9,d:.85,yaw:0},
 ]},
 standard('suite-5','Bedroom suite 05 bathroom',1,13.34,19.86,3.4,3.8,1.7,1.5,18.1,-1),
 {id:'guest',name:'Guest half bathroom',floor:0,mirror:1,half:true,rect:clear(-12.4,-3.14,2.8,1.76),door:{side:'inner',start:.115},fixtures:[
  {kind:'toilet',u:.43,v:.7,w:.46,d:.74,yaw:-Math.PI/2},
  {kind:'vanity',u:1.5,v:1.48,w:1,d:.56,yaw:Math.PI,basins:1},
 ]},
];
export const bathForSuite=(id:string)=>bathrooms.find(b=>b.suite===id)!;
export const bathPoint=(b:Bathroom,u:number,v:number)=>({x:b.rect.x+b.mirror*(u-b.rect.w/2),z:b.rect.z+v-b.rect.d/2});
export const bathRect=(b:Bathroom,u:number,v:number,w:number,d:number):Rect=>({...bathPoint(b,u,v),w,d});
export function fixtureRect(b:Bathroom,f:BathFixture):Rect{return bathRect(b,f.u,f.v,Math.abs(Math.cos(f.yaw))*f.w+Math.abs(Math.sin(f.yaw))*f.d,Math.abs(Math.sin(f.yaw))*f.w+Math.abs(Math.cos(f.yaw))*f.d);}
export function bathShower(b:Bathroom):Rect|undefined{return b.shower?bathRect(b,b.shower.w/2,b.rect.d-b.shower.d/2,b.shower.w,b.shower.d):undefined;}
export function bathroomDoor(b:Bathroom){
 const p=b.door.side==='front'?bathPoint(b,b.door.start+BATH.opening/2,-BATH.partition/2):bathPoint(b,b.rect.w+BATH.partition/2,b.door.start+BATH.opening/2);
 return {...p,along:b.door.side==='front'?'x' as const:'z' as const,width:BATH.opening,clear:BATH.leaf-BATH.hardwareProjection};
}
// Each path starts outside, passes the open door and reaches a place outside its swing to close it.
export function bathRoute(b:Bathroom){
 const w=b.rect.w,d=b.rect.d,entry=b.door.start+BATH.opening/2;
 const p=(name:string,u:number,v:number)=>({name,...bathPoint(b,u,v)});
 if(b.half)return [p('Outside',w+.8,entry),p('Inside',2.1,entry),p('Close door',1.35,.7),p('Vanity',1.5,.67),p('Toilet',1.36,.7),p('Return',1.35,.7)];
 if(b.primary)return [p('Outside',entry,-.75),p('Inside',entry,.65),p('Close door',2.8,1.2),p('Double vanity',1.75,1.25),p('Dry aisle',2.9,1.3),p('Toilet',4.55,1.25),p('Dry aisle',2.9,1.3),p('Tub',2.9,2.1),p('Tub corner',1.95,2.1),p('Shower approach',1.95,2.9),p('Shower',.75,2.9),p('Shower retreat',1.95,2.9),p('Tub side',1.95,3.925),p('Tub rear',3.25,3.925),p('Tub side',1.95,3.925),p('Dry aisle',1.95,1.3),p('Return',2.8,1.2)];
 return [p('Outside',entry,-.75),p('Inside',entry,.8),p('Close door',1.8,1.25),p('Vanity',1.2,1.05),p('Dry aisle',1.95,1.5),p('Toilet',w-.65,d-1.4),p('Shower approach',1.95,d-1.15),p('Shower',.75,d-1.15),p('Shower retreat',1.95,d-1.15),p('Return',1.8,1.25)];
}
// Bedroom furnishings are coordinated with the enlarged service corners, not moved by a generic offset.
export function bedroomFurniture(r:Room){
 const compact=r.id==='suite-3';
 const bed=compact?{x:-7.65,z:.4,w:1.9,d:2.3}:r.id==='suite-4'?{x:-5.7,z:4.95,w:2.1,d:2.5}:{x:r.master?-4.8:r.x+(r.x<0?1.2:-.7),z:r.master?16.8:r.depth<=6?r.z+.2:r.z-.8,w:2.25,d:2.6};
 let wardrobe:Rect|undefined;
 if(compact)wardrobe={x:-11.3,z:-2.48,w:2.2,d:.6};
 else if(r.id==='suite-4')wardrobe={x:-2.55,z:8.8,w:.6,d:2.7};
 else if(['suite-1','suite-5'].includes(r.id))wardrobe={x:r.x,z:r.z-r.depth/2+.55,w:2.7,d:.6};
 else if(!r.master)wardrobe={x:r.x+Math.sign(r.x)*(r.width/2-.55),z:r.z-r.depth/2+1.65,w:.6,d:2.7};
 return {bed,wardrobe,front:compact?-1:1,nightstandWidth:compact?.42:.65,nightstandOffset:compact?1.25:1.75};
}

export function bathClearances(b:Bathroom){return b.fixtures.filter(f=>f.kind==='vanity'||f.kind==='toilet').map(f=>{const forward=f.kind==='vanity'?1:-1,depth=f.kind==='vanity'?1.05:1,offset=forward*(f.d/2+depth/2),q={...f,u:f.u+Math.sin(f.yaw)*offset,v:f.v+Math.cos(f.yaw)*offset,w:f.kind==='vanity'?f.w:.9,d:depth};return {name:f.kind+' working space',rect:fixtureRect(b,q)};});}
export function bathView(b:Bathroom,vanity=false){
 const eye=b.half?bathPoint(b,2.35,.75):b.primary?bathPoint(b,vanity?2.15:2.25,vanity?2:1.1):bathPoint(b,b.rect.w-.85,.75);
 const target=b.half?bathPoint(b,.8,.95):b.primary?bathPoint(b,vanity?1.75:2.75,vanity?.3:3.15):bathPoint(b,vanity?.3:1.2,vanity?1.2:b.rect.d-.8);
 return {eye,target,targetHeight:vanity?1.25:.95};
}
