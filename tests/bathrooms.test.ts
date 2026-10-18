import test from 'node:test';
import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {createWorld} from '../src/world';
import {STOREY,blocked,groundHeight,type Rect} from '../src/plan';
import {bathrooms,BATH,bathRoute,bathPoint,fixtureRect,bathClearances,bathShower} from '../src/bathroomPlan';
const fixture=()=>{const e=new NullEngine(),s=new Scene(e),w=createWorld(s,true);return {w,done(){s.dispose();e.dispose();}};};
const overlaps=(a:Rect,b:Rect)=>Math.abs(a.x-b.x)<(a.w+b.w)/2-.001&&Math.abs(a.z-b.z)<(a.d+b.d)/2-.001;
function doorHits(x:number,z:number,theta:number,r:Rect){const a=[Math.sin(theta),Math.cos(theta)],b=[a[1],-a[0]],dx=x+a[0]*BATH.leaf/2-r.x,dz=z+a[1]*BATH.leaf/2-r.z;return [a,b,[1,0],[0,1]].every(([u,v])=>Math.abs(dx*u+dz*v)<BATH.leaf/2*Math.abs(a[0]*u+a[1]*v)+BATH.hardwareProjection*Math.abs(b[0]*u+b[1]*v)+r.w/2*Math.abs(u)+r.d/2*Math.abs(v)-.001);}
test('seven coordinated bathrooms have generous finished areas, dry working spaces and real fixture collisions',()=>{
 const f=fixture(),w=f.w;
 assert.equal(bathrooms.length,7);assert.equal(bathrooms.filter(b=>b.shower).length,6);
 for(const b of bathrooms){
  const area=b.rect.w*b.rect.d;assert.ok(b.half?area>4.8:b.primary?area>=18&&area<=24:area>=12&&area<=15,b.id+' internal area');
  assert.ok(BATH.leaf-BATH.hardwareProjection>=1,'finished door width');
  if(b.shower)assert.ok(b.shower.w>=1.2&&b.shower.d>=1.5&&b.shower.entry>=1);
  const footprints=b.fixtures.map(q=>fixtureRect(b,q));
  for(let i=0;i<footprints.length;i++)for(let j=i+1;j<footprints.length;j++)assert.equal(overlaps(footprints[i],footprints[j]),false,b.id+' separate fixtures');
  for(const q of footprints){assert.equal(blocked(q.x,q.z,b.floor*STOREY,w.obstacles),true,b.id+' fixture cannot be walked through');
   assert.ok(Math.abs(q.x-b.rect.x)+q.w/2<=b.rect.w/2+.001&&Math.abs(q.z-b.rect.z)+q.d/2<=b.rect.d/2+.001,b.id+' fixture within finished enclosure');
  }
  for(let u=.27;u<b.rect.w;u+=.37)for(let v=.29;v<b.rect.d;v+=.39){const p=bathPoint(b,u,v);
   const supports=w.surfaces.filter(s=>Math.abs(s.y-b.floor*STOREY)<.001&&Math.abs(p.x-s.x)<s.w/2-.00001&&Math.abs(p.z-s.z)<s.d/2-.00001);
   assert.equal(supports.length,1,b.id+' single floor support');
  }
  const wet=bathShower(b);for(const c of bathClearances(b)){
   for(const q of footprints)assert.equal(overlaps(c.rect,q),false,b.id+' '+c.name+' clear of fixtures');
   if(c.name.startsWith('vanity')&&wet)assert.equal(overlaps(c.rect,wet),false,b.id+' dry vanity approach');
  }
  for(const [u,v] of [[-.1,b.rect.d/2],[b.rect.w+.1,b.rect.d/2],[b.rect.w/2,-.1],[b.rect.w/2,b.rect.d+.1]]){
   const p=bathPoint(b,u,v);for(const h of [0,3.5])assert.ok(blocked(p.x,p.z,b.floor*STOREY+h,w.obstacles),b.id+' complete enclosure');
  }
  if(b.floor===1&&['master','suite-5'].includes(b.id)){
   assert.ok(w.obstacles.some(o=>o.name.includes('bathroom rear masonry')&&Math.abs(o.x-b.rect.x)<b.rect.w/2),'solid bathroom rear elevation');
   for(const o of w.obstacles.filter(o=>o.name.includes('balcony fixed glass')&&Math.abs(o.z-20)<.1&&o.bottom>=STOREY)){
    assert.ok(Math.min(o.x+o.w/2,b.rect.x+b.rect.w/2)-Math.max(o.x-o.w/2,b.rect.x-b.rect.w/2)<=0,b.id+' no rear window hidden behind tile');
   }
  }
 }
 f.done();
});
test('every bathroom can be entered, closed, used and exited on one finished floor',()=>{
 const f=fixture(),w=f.w;
 for(const d of w.doors)d.open=true;for(let i=0;i<80;i++)w.update(.05,new Vector3());
 const walk=(a:{x:number;z:number},b:{x:number;z:number},y:number,name:string)=>{const n=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.025);for(let i=0;i<=n;i++){const x=a.x+(b.x-a.x)*i/n,z=a.z+(b.z-a.z)*i/n;assert.equal(blocked(x,z,y,w.obstacles),false,`${name} at ${x},${z}: ${w.obstacles.filter(o=>blocked(x,z,y,[o])).map(o=>o.name)}`);assert.equal(groundHeight(x,z,y,w.surfaces),y,name+' flush floor');}};
 for(const b of bathrooms){
  const route=bathRoute(b),door=w.doors.find(d=>d.name===b.name)!;assert.ok(door);
  walk(route[0],route[1],b.floor*STOREY,b.id+' entry');walk(route[1],route[2],b.floor*STOREY,b.id+' close position');door.open=false;
  for(let i=0;i<80;i++){w.update(.025,new Vector3());assert.equal(blocked(route[2].x,route[2].z,b.floor*STOREY,w.obstacles),false,b.id+' safe door closing');}
  for(let i=3;i<route.length;i++)walk(route[i-1],route[i],b.floor*STOREY,b.id+' '+route[i].name);
  door.open=true;for(let i=0;i<80;i++)w.update(.025,new Vector3());walk(route.at(-1)!,route[1],b.floor*STOREY,b.id+' return');walk(route[1],route[0],b.floor*STOREY,b.id+' exit');
 }
 f.done();
});
test('privacy doors swing fully without striking bathroom fixtures or screens',()=>{
 const f=fixture(),w=f.w;
 for(const b of bathrooms){
  const door=w.doors.find(d=>d.name===b.name)!;
  const obstacles=w.obstacles.filter(o=>o.name.startsWith(b.id+' ')&&(/footprint|shower.*glass|privacy partition/.test(o.name)));
  for(let i=0;i<=90;i++){
   const theta=(door.along==='x'?Math.PI/2:0)+(b.door.side==='front'&&b.mirror===1?Math.PI:0)+door.swing*i*Math.PI/180;
   for(const o of obstacles)assert.equal(doorHits(door.pivot.position.x,door.pivot.position.z,theta,o),false,`${b.id} door ${i} degrees hits ${o.name}`);
  }
 }
 f.done();
});
