import test from 'node:test';
import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {createWorld} from '../src/world';
import {rooms,roomRect,ensuiteRect,SITE_SIDE,ACRE_M2,STOREY,LEVEL,ARCH,groundPlates,upperPlates,roofPlates,stairs,stairPoint,groundHeight,blocked,destinations} from '../src/plan';
function fixture(){const engine=new NullEngine(),scene=new Scene(engine),world=createWorld(scene,true);return {world,scene,done(){scene.dispose();engine.dispose();}};}
function openAll(w:ReturnType<typeof createWorld>){for(const d of w.doors)d.open=true;for(let i=0;i<80;i++)w.update(.05,new Vector3());}
test('six generous suites, compact internal court, separate pantry and dressing room',()=>{
 assert.ok(Math.abs(SITE_SIDE**2-ACRE_M2)<.00001);
 const beds=rooms.filter(r=>r.kind==='bedroom');assert.equal(beds.length,6);assert.equal(beds.filter(r=>r.floor===0).length,2);assert.equal(beds.filter(r=>r.floor===1).length,4);assert.ok(beds.every(r=>r.ensuite&&r.width*r.depth>=42));
 assert.equal(ARCH.courtyard.w*ARCH.courtyard.d,22.5);assert.ok(ARCH.wardrobe.w*ARCH.wardrobe.d>=18);assert.ok(ARCH.pantry.w*ARCH.pantry.d>=9);
 for(const kind of ['office','cinema','gym','kitchen'])assert.ok(rooms.some(r=>r.kind===kind));
});
test('floor plates never overlap; indoor finished elevations and true voids are maintained',()=>{
 for(const plates of [groundPlates,upperPlates,roofPlates])for(let i=0;i<plates.length;i++)for(let j=i+1;j<plates.length;j++){
  const a=plates[i],b=plates[j];const x=Math.min(a.x+a.w/2,b.x+b.w/2)-Math.max(a.x-a.w/2,b.x-b.w/2),z=Math.min(a.z+a.d/2,b.z+b.d/2)-Math.max(a.z-a.d/2,b.z-b.d/2);assert.ok(x<1e-6||z<1e-6,'no coplanar floor overlap');
 }
 const f=fixture(),w=f.world;assert.equal(groundHeight(4,6,STOREY,w.surfaces),0);assert.equal(groundHeight(11,7,LEVEL.roof,w.surfaces),0);assert.equal(groundHeight(4,12,STOREY,w.surfaces),STOREY);
 assert.equal(blocked(4,11,STOREY,w.obstacles),true);assert.equal(w.surfaces.some(s=>s.name?.includes('finish')),false);
 assert.ok(f.scene.meshes.length<1500);f.done();
});
test('every door opens a clear passage with continuous support',()=>{
 const f=fixture(),w=f.world;
 assert.equal(w.doors.filter(d=>d.name.includes('bathroom')).length,7);assert.equal(w.doors.filter(d=>d.name.startsWith('Garage bay')).length,3);
 for(const d of w.doors){const x=d.x+(d.along==='x'?d.width/2:0),z=d.z+(d.along==='z'?d.width/2:0);assert.ok(blocked(x,z,d.y,w.obstacles),'closed '+d.name);}
 openAll(w);
 for(const d of w.doors){const cx=d.x+(d.along==='x'?d.width/2:0),cz=d.z+(d.along==='z'?d.width/2:0);
  for(let t=-.65;t<=.651;t+=.05){const x=cx+(d.along==='z'?t:0),z=cz+(d.along==='x'?t:0);assert.equal(blocked(x,z,d.y,w.obstacles),false,`${d.name} at ${x.toFixed(2)},${z.toFixed(2)}`);assert.ok(Math.abs(groundHeight(x,z,d.y,w.surfaces)-d.y)<.06,'continuous threshold '+d.name);}
 }
 f.done();
});
test('direct social route stays level and clear of courtyard, island, dining and media furniture',()=>{
 const f=fixture(),w=f.world;openAll(w);
 const route=[[3,-7],[3,2],[6.5,2],[6.5,11.3],[12,11.3],[6.5,11.3],[6.5,21]];
 for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.05);for(let k=0;k<=n;k++){const x=a[0]+(b[0]-a[0])*k/n,z=a[1]+(b[1]-a[1])*k/n;assert.equal(blocked(x,z,LEVEL.ground,w.obstacles),false,`social route ${x},${z}`);assert.ok(Math.abs(groundHeight(x,z,0,w.surfaces))<.001,`flat finished floor ${x},${z}`);}}
 f.done();
});
test('return stair flights and intermediate landings connect all three levels in both directions',()=>{
 const f=fixture(),w=f.world;openAll(w);
 for(const s of stairs){let y=s.base;for(let i=0;i<=120;i++){const p=stairPoint(s,i/120);assert.equal(blocked(p.x,p.z,y,w.obstacles),false,'stair ascent '+JSON.stringify(p));y=groundHeight(p.x,p.z,y,w.surfaces);}assert.ok(Math.abs(y-(s.base+s.rise))<.02);
  for(let i=120;i>=0;i--){const p=stairPoint(s,i/120);assert.equal(blocked(p.x,p.z,y,w.obstacles),false,'stair descent');y=groundHeight(p.x,p.z,y,w.surfaces);}assert.ok(Math.abs(y-s.base)<.02);
 }
 for(const s of stairs.filter(s=>s.direction===1)){for(let x=-5.1;x<=-2.9;x+=.05){assert.equal(blocked(x,1.5,s.base+s.rise,w.obstacles),false);assert.equal(groundHeight(x,1.5,s.base+s.rise,w.surfaces),s.base+s.rise);}}
 f.done();
});
test('all destinations, private rooms, baths, closet, pantry, galleries and terraces are connected',()=>{
 const f=fixture(),w=f.world;openAll(w);for(const d of destinations)assert.equal(blocked(d.x,d.z,d.y,w.obstacles),false,'destination '+d.id);
 const step=.25,minX=-15,minZ=-7,nx=137,nz=129;
 for(const level of [0,1,2]){
  const y=level*STOREY,seen=new Set<number>(),queue:number[]=[],cell=(x:number,z:number)=>Math.round((z-minZ)/step)*nx+Math.round((x-minX)/step);
  const seed=level===0?cell(3,-3.5):cell(-2.9,-4.3);queue.push(seed);seen.add(seed);
  for(let i=0;i<queue.length;i++){const id=queue[i],ix=id%nx,iz=Math.floor(id/nx);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const ax=ix+dx,az=iz+dz,k=az*nx+ax;if(ax<0||az<0||ax>=nx||az>=nz||seen.has(k))continue;const x=minX+ax*step,z=minZ+az*step;if(Math.abs(groundHeight(x,z,y,w.surfaces)-y)>.01||blocked(x,z,y,w.obstacles))continue;seen.add(k);queue.push(k);}}
  const reach=(x:number,z:number,name:string)=>assert.ok(seen.has(cell(x,z)),`${name} disconnected at ${x},${z}, floor ${level}`);
  for(const r of rooms.filter(r=>r.floor===level)){const e=r.entry;reach(e.x+(e.along==='x'?e.width/2:Math.sign(r.x)*.6),e.z+(e.along==='z'?e.width/2:.6),r.name);if(r.ensuite){const b=ensuiteRect(r);reach(b.x-.25,b.z-.8,r.name+' bath');}}
  if(!level){reach(10,7,'courtyard');reach(15,17.5,'pantry');reach(-10.5,-4,'powder');}
  if(level===1){reach(11.25,4.25,'courtyard viewing alcove');reach(4.5,12,'overlook');reach(-8.5,12.8,'closet');reach(6.5,17,'garden terrace');reach(-4,21,'primary balcony');reach(11,21,'east balcony');}
  if(level===2){reach(4,8,'roof');reach(11,13,'pergola');}
 }
 w.setNight(true);assert.equal(w.sun.intensity,.18);w.setNight(false);assert.equal(w.sun.intensity,1.15);w.zones[0].on=false;w.update(.05,new Vector3());assert.ok(w.zones.filter(z=>z.light.isEnabled()).length<=4);assert.equal(w.zones[0].light.isEnabled(),false);f.done();
});
