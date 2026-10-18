import {rooms,ARCH,bounds,disjoint,type Room,type Rect} from './plan';
import {bathForSuite,bedroomFurniture} from './bathroomPlan';
const area=(rects:Rect[])=>rects.reduce((sum,r)=>sum+r.w*r.d,0);
export function bedroomArea(r:Room){
 const interior=bounds(r.x-r.width/2+(r.x<0?.24:.12),r.x+r.width/2-(r.x>0?.24:.12),r.z-r.depth/2+.12,r.z+r.depth/2-(r.id==='suite-2'?.18:.12));
 const bath=bathForSuite(r.id),current=bath.rect,old={x:r.x+Math.sign(r.x)*(r.width/2-1.7),z:r.z+r.depth/2-1.7,w:3.1,d:3.1};
 const occupied=(b:Rect,wall:number)=>bounds(r.x<0?interior.x-interior.w/2:b.x-b.w/2-wall,r.x>0?interior.x+interior.w/2:b.x+b.w/2+wall,b.z-b.d/2-wall,interior.z+interior.d/2);
 const dressing=r.master?[bounds(ARCH.wardrobe.x-ARCH.wardrobe.w/2,ARCH.wardrobe.x+ARCH.wardrobe.w/2+.12,ARCH.wardrobe.z-ARCH.wardrobe.d/2,ARCH.wardrobe.z+ARCH.wardrobe.d/2+.08)]:[];
 const oldWardrobe=r.master?[]:['suite-1','suite-4','suite-5'].includes(r.id)?[{x:r.x,z:r.z-r.depth/2+.55,w:2.7,d:.6}]:[{x:r.x+Math.sign(r.x)*(r.width/2-.55),z:r.z-r.depth/2+1.65,w:.6,d:2.7}];
 const wardrobe=bedroomFurniture(r).wardrobe;
 return {id:r.id,room:r.name,module:r.width*r.depth,beforeBathroom:{width:2.95,depth:2.98,area:2.95*2.98},afterBathroom:{width:current.w,depth:current.d,area:current.w*current.d},bedroomBefore:area(disjoint([interior],[occupied(old,.06),...dressing,...oldWardrobe])),bedroomAfter:area(disjoint([interior],[occupied(current,.20),...dressing,...(wardrobe?[wardrobe]:[])])),bed:bedroomFurniture(r).bed};
}
export const bathroomSchedule=()=>rooms.filter(r=>r.ensuite).map(bedroomArea);
