import test from 'node:test';
import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine';
import {Scene} from '@babylonjs/core/scene';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {createWorld} from '../src/world';
import {rooms,SITE_SIDE,ACRE_M2,STOREY,groundHeight,blocked} from '../src/plan';

test('site and room schedule match the six-suite brief',()=>{
 assert.ok(Math.abs(SITE_SIDE*SITE_SIDE-ACRE_M2)<.00001);
 const bedrooms=rooms.filter(r=>r.kind==='bedroom');
 assert.equal(bedrooms.length,6);assert.equal(bedrooms.filter(r=>r.floor===0).length,2);assert.equal(bedrooms.filter(r=>r.floor===1).length,4);
 assert.ok(bedrooms.every(r=>r.ensuite&&r.width*r.depth>=60));assert.equal(bedrooms.filter(r=>r.master).length,1);
 for(const kind of ['office','gym','cinema','kitchen'])assert.ok(rooms.some(r=>r.kind===kind));
});

test('complete estate builds, doors clear passages, stairs connect levels, and living void remains open',()=>{
 const engine=new NullEngine();const scene=new Scene(engine);const world=createWorld(scene,true);
 assert.ok(scene.meshes.length>100);assert.ok(scene.meshes.length<1500,'static geometry should be batched');
 assert.equal(world.doors.filter(d=>d.name.includes('bathroom')).length,7);
 assert.equal(world.doors.filter(d=>d.name.startsWith('Garage bay')).length,3);
 assert.ok(world.doors.some(d=>d.name==='Vehicle gate'));assert.ok(world.doors.some(d=>d.name==='Pedestrian gate'));
 for(const r of rooms){const d=world.doors.find(d=>d.name===r.name)!;assert.ok(d);assert.equal(blocked(d.x,d.z+.7,d.y,world.obstacles),true);d.open=true;}
 for(const d of world.doors)d.open=true;
 for(let i=0;i<40;i++)world.update(.05,new Vector3(0,0,0));
 for(const r of rooms){const d=world.doors.find(d=>d.name===r.name)!;assert.equal(blocked(d.x,d.z+.7,d.y,world.obstacles),false,'door passage '+r.name);}
 for(const f of [0,1]){let y=f*STOREY;for(let x=-3.99;x<4;x+=.05)y=groundHeight(x,f===0?1:4,y,world.surfaces);assert.ok(Math.abs(y-(f+1)*STOREY)<.05);}
 assert.equal(groundHeight(0,17.5,STOREY,world.surfaces),0,'living room must be double height');
 assert.equal(groundHeight(0,10,STOREY*2,world.surfaces),.012,'courtyard must remain open through the roof');
 assert.equal(groundHeight(0,14.8,STOREY,world.surfaces),STOREY,'upper overlook must be walkable');
 assert.equal(blocked(0,15.6,STOREY,world.obstacles),true,'overlook needs a guard rail');
 assert.equal(blocked(-17,9,0,world.obstacles),true,'exterior glazing stops walking');
 assert.equal(blocked(0,-31.7,0,world.obstacles),false,'open vehicle gate allows passage');
 world.setNight(true);assert.equal(world.sun.intensity,.18);world.setNight(false);assert.equal(world.sun.intensity,1.15);
 world.zones[0].on=false;world.update(.05,new Vector3(-11,0,1));assert.equal(world.zones[0].light.isEnabled(),false);assert.ok(world.zones.filter(z=>z.light.isEnabled()).length<=4);
 scene.dispose();engine.dispose();
});

// Exercise traversable widths, not merely door object counts.
test('every animated doorway clears a full walking passage; roof and stair landings connect',()=>{
 const engine=new NullEngine(),scene=new Scene(engine),world=createWorld(scene,true);
 for(const door of world.doors)door.open=true;
 for(let n=0;n<80;n++)world.update(.05,new Vector3());
 for(const door of world.doors){
  const cx=door.x+(door.along==='x'?door.width/2:0),cz=door.z+(door.along==='z'?door.width/2:0);
  for(let offset=-.7;offset<=.71;offset+=.05){
   const x=cx+(door.along==='z'?offset:0),z=cz+(door.along==='x'?offset:0);
   assert.equal(blocked(x,z,door.y,world.obstacles),false,`${door.name}: obstruction at ${x.toFixed(2)}, ${z.toFixed(2)}`);
   if(!door.name.includes('gate'))assert.ok(groundHeight(x,z,door.y,world.surfaces)>=door.y-.04,`${door.name}: missing landing`);
  }
 }
 for(const [floor,z] of [[0,1],[1,4]]){
  let y=floor*STOREY;
  for(let x=-4.6;x<4.61;x+=.04){assert.equal(blocked(x,z,y,world.obstacles),false,`stair ${floor+1} x=${x}`);y=groundHeight(x,z,y,world.surfaces);}
  assert.ok(Math.abs(y-(floor+1)*STOREY)<.04,'stair reaches landing');
  for(let x=4.6;x>-4.61;x-=.04){assert.equal(blocked(x,z,y,world.obstacles),false,`descending stair ${floor+1}`);y=groundHeight(x,z,y,world.surfaces);}
  assert.ok(Math.abs(y-floor*STOREY)<.04,'stair returns to lower landing');
 }
 scene.dispose();engine.dispose();
});

test('rooms, bathrooms, galleries, balconies and roof are connected to their arrival landing',async()=>{
 const {destinations,ensuiteRect}=await import('../src/plan');
 const engine=new NullEngine(),scene=new Scene(engine),world=createWorld(scene,true);
 for(const d of world.doors)d.open=true;
 for(let n=0;n<80;n++)world.update(.05,new Vector3());
 for(const d of destinations)assert.equal(blocked(d.x,d.z,d.y,world.obstacles),false,`shortcut ${d.name} must be clear`);
 const step=.25,minX=-21,minZ=-9,nx=169,nz=153;
 for(const level of [0,1,2]){
  const y=level*STOREY,seen=new Set<number>(),queue:number[]=[];
  const cell=(x:number,z:number)=>Math.round((z-minZ)/step)*nx+Math.round((x-minX)/step);
  const seed=level===0?cell(0,-1.5):level===1?cell(4.75,1):cell(4.75,4);
  queue.push(seed);seen.add(seed);
  for(let i=0;i<queue.length;i++){
   const id=queue[i],ix=id%nx,iz=Math.floor(id/nx);
   for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const ax=ix+dx,az=iz+dz,k=az*nx+ax;if(ax<0||az<0||ax>=nx||az>=nz||seen.has(k))continue;
    const x=minX+ax*step,z=minZ+az*step,h=groundHeight(x,z,y,world.surfaces);
    if(Math.abs(h-y)>.04||blocked(x,z,y,world.obstacles))continue;
    seen.add(k);queue.push(k);
   }
  }
  const reachable=(x:number,z:number,name:string)=>assert.ok(seen.has(cell(x,z)),`${name} disconnected on level ${level}`);
  for(const r of rooms.filter(r=>r.floor===level)){
   reachable(r.x-Math.sign(r.x)*(r.width/2-1),r.doorZ!==undefined?r.doorZ+.7:r.z-1.3,r.name);
   if(r.ensuite){const b=ensuiteRect(r);reachable(b.x-.25,b.z-.8,r.name+' bathroom');}
  }
  if(level===0){reachable(2.75,9,'courtyard');reachable(0,16,'living');reachable(-3.5,-1.25,'half bath');}
  if(level===1){reachable(0,14.75,'overlook');reachable(-10,9.5,'walk-in closet');reachable(-10.25,24,'primary balcony');reachable(9.5,23,'east balcony');reachable(10.5,-.75,'loggia');reachable(-4.75,4,'roof stair start');}
  if(level===2){reachable(10.5,16,'pergola');reachable(-10,16,'west roof');reachable(0,18,'living pavilion roof');}
 }
 scene.dispose();engine.dispose();
});
