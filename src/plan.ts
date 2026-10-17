export const ACRE_M2 = 4046.8564224;
export const SITE_SIDE = Math.sqrt(ACRE_M2);
export const STOREY = 4.2;
export const ARCH = {
  courtyard: {x:0,z:10,w:10,d:8},
  gallery: {inner:5,outer:7},
  foyer: {x:0,z:1.5,w:14,d:9},
  living: {x:0,z:18,w:14,d:8},
  livingVoid: {x:0,z:18,w:10,d:4.4},
  overlook: {x:0,z:14.9,w:10,d:1.8},
  rearGallery: {x:0,z:21.1,w:10,d:1.8},
  entryZ:-3, rearZ:22, wall:.22,
  canopy: {x:1.5,z:-4.3,w:6.8,d:3.2},
  wardrobe: {x:-11.5,z:9.5,w:8.6,d:4.5},
} as const;
export interface Rect {x:number;z:number;w:number;d:number}
export interface Stair extends Rect {base:number;rise:number}
export const stairs:Stair[]=[{x:0,z:1,w:8,d:1.8,base:0,rise:STOREY},{x:0,z:4,w:8,d:1.8,base:STOREY,rise:STOREY}];
export type RoomKind = 'bedroom' | 'office' | 'gym' | 'cinema' | 'kitchen' | 'lounge';
export interface Room {id:string; name:string; floor:number; x:number; z:number; width:number; depth:number; kind:RoomKind; ensuite?:boolean; master?:boolean; doorZ?:number}
export const rooms: Room[] = [
  {id:'office',name:'Arrival study',floor:0,x:-11.5,z:-1,width:9,depth:12,kind:'office'},
  {id:'suite-1',name:'Garden suite 01',floor:0,x:-12,z:9.5,width:10,depth:9,kind:'bedroom',ensuite:true},
  {id:'suite-2',name:'Garden suite 02',floor:0,x:-11.5,z:18.5,width:9,depth:9,kind:'bedroom',ensuite:true},
  {id:'gym',name:'Wellness studio',floor:0,x:10.5,z:2,width:7,depth:8,kind:'gym'},
  {id:'cinema',name:'Private cinema',floor:0,x:11,z:10,width:8,depth:8,kind:'cinema'},
  {id:'kitchen',name:'Kitchen & breakfast',floor:0,x:11.5,z:18,width:9,depth:8,kind:'kitchen'},
  {id:'suite-3',name:'Bedroom suite 03',floor:1,x:-11,z:2,width:8,depth:10,kind:'bedroom',ensuite:true},
  {id:'master',name:'Primary suite',floor:1,x:-11.5,z:15,width:9,depth:16,kind:'bedroom',ensuite:true,master:true,doorZ:13},
  {id:'gallery',name:'Recessed upper lounge',floor:1,x:10.5,z:3,width:7,depth:6,kind:'lounge'},
  {id:'suite-4',name:'Bedroom suite 04',floor:1,x:11,z:10,width:8,depth:8,kind:'bedroom',ensuite:true},
  {id:'suite-5',name:'Bedroom suite 05',floor:1,x:11,z:18,width:8,depth:8,kind:'bedroom',ensuite:true}
];
export const roomRect=(r:Room):Rect=>({x:r.x,z:r.z,w:r.width,d:r.depth});
export const roomEntry=(r:Room)=>({x:Math.sign(r.x)*ARCH.gallery.outer,z:r.doorZ??r.z-2,width:1.4});
export const ensuiteRect=(r:Room):Rect=>({x:r.x+Math.sign(r.x)*(r.width/2-1.65),z:r.z+r.depth/2-1.65,w:3.1,d:3.1});
export const balconies:Rect[]=[{x:-11.5,z:24.4,w:9,d:2.8},{x:10.5,z:23.4,w:7,d:2.8}];
export const galleries:Rect[]=[{x:-6,z:10,w:2,d:26},{x:6,z:9.5,w:2,d:25}];
export const roofPlates:Rect[]=[...rooms.filter(r=>r.floor===1).map(roomRect),...galleries,
 {x:0,z:0,w:10,d:6},{x:0,z:5.5,w:10,d:1},{x:-4.5,z:4,w:1,d:2},{x:4.5,z:4,w:1,d:2},
 {x:0,z:18,w:10,d:8}];
// Split a union of rectangles into its exposed edges. Shared walls never receive parapets.
export function outline(rects:Rect[]):{x:number;z:number;w:number;d:number}[]{
 const xs=[...new Set(rects.flatMap(r=>[r.x-r.w/2,r.x+r.w/2]))].sort((a,b)=>a-b);
 const zs=[...new Set(rects.flatMap(r=>[r.z-r.d/2,r.z+r.d/2]))].sort((a,b)=>a-b);
 const occupied=(x:number,z:number)=>rects.some(r=>inside(x,z,r));
 const edges:Rect[]=[];
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){
  const x=(xs[i]+xs[i+1])/2,z=(zs[j]+zs[j+1])/2,w=xs[i+1]-xs[i],d=zs[j+1]-zs[j];
  if(!occupied(x,z))continue;
  for(const s of [-1,1]){
   if(!occupied(x+s*(w/2+.001),z))edges.push({x:x+s*w/2,z,w:ARCH.wall,d});
   if(!occupied(x,z+s*(d/2+.001)))edges.push({x,z:z+s*d/2,w,d:ARCH.wall});
  }
 }
 return edges;
}
// Exposed lower roofs only: avoids coplanar slabs beneath the recessed upper rooms.
export function subtractRects(base:Rect,cuts:Rect[]):Rect[]{
 let pieces=[base];
 for(const cut of cuts){
  const next:Rect[]=[];
  for(const r of pieces){
   const l=r.x-r.w/2,rr=r.x+r.w/2,b=r.z-r.d/2,t=r.z+r.d/2;
   const il=Math.max(l,cut.x-cut.w/2),ir=Math.min(rr,cut.x+cut.w/2),ib=Math.max(b,cut.z-cut.d/2),it=Math.min(t,cut.z+cut.d/2);
   if(il>=ir||ib>=it){next.push(r);continue;}
   const add=(x0:number,x1:number,z0:number,z1:number)=>{if(x1-x0>.001&&z1-z0>.001)next.push({x:(x0+x1)/2,z:(z0+z1)/2,w:x1-x0,d:z1-z0});};
   add(l,il,b,t);add(ir,rr,b,t);add(il,ir,b,ib);add(il,ir,it,t);
  }
  pieces=next;
 }
 return pieces;
}
export const destinations = [
  {id:'arrival',name:'Arrival court',x:7.2,y:0,z:-23,yaw:-.2},
  {id:'foyer',name:'Entrance hall',x:0,y:0,z:-1.5,yaw:0},
  {id:'courtyard',name:'Internal courtyard',x:2.8,y:0,z:9,yaw:-.8},
  {id:'living',name:'Living & dining',x:0,y:0,z:16,yaw:0},
  {id:'upper',name:'Living overlook',x:0,y:STOREY,z:14.8,yaw:0},
  {id:'primary',name:'Primary suite gallery',x:-6,y:STOREY,z:13.7,yaw:-Math.PI/2},
  {id:'roof',name:'Rooftop terrace',x:6,y:STOREY*2,z:12,yaw:0},
  {id:'pool',name:'Pool & gazebo',x:3,y:0,z:26,yaw:-Math.PI/2},
  {id:'garage',name:'Detached three-car garage',x:23,y:0,z:-6,yaw:0}
];
export interface Obstacle extends Rect {bottom:number;top:number;active?:()=>boolean;name:string}
export interface Surface extends Rect {y:number}
export const inside = (x:number,z:number,r:Rect, margin=0) => Math.abs(x-r.x)<r.w/2+margin && Math.abs(z-r.z)<r.d/2+margin;
export function blocked(x:number,z:number,feet:number,obstacles:Obstacle[],radius=.23){
 return obstacles.some(o=>(!o.active || o.active()) && feet+1.72>o.bottom+.04 && feet<o.top-.08 && inside(x,z,o,radius));
}
export function groundHeight(x:number,z:number,current:number,surfaces:Surface[]){
 let best=0;
 for(const s of surfaces)if(inside(x,z,s,.001)&&s.y<=current+.36)best=Math.max(best,s.y);
 for(const ramp of stairs){const h=ramp.base+(x-ramp.x+ramp.w/2)/ramp.w*ramp.rise;
  if(inside(x,z,ramp)&&h<=current+.36&&h>=ramp.base-.05)best=Math.max(best,h);
 }
 return best;
}
