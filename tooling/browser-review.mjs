// Uses a separately launched Chrome debugging session. No browser package is installed.
import {writeFile} from 'node:fs/promises';
// Keep Node alive while CDP awaits requestAnimationFrame promises in Chrome.
const keepAlive=setInterval(()=>{},1000);
const pages=await (await fetch('http://127.0.0.1:9222/json/list')).json();
const page=pages.find(p=>p.type==='page');
const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let next=0;const pending=new Map();const errors=[];
ws.onclose=event=>{for(const p of pending.values())p.reject(new Error('Browser connection closed: '+event.code+' '+event.reason));pending.clear();};
ws.onmessage=event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);};
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const delay=ms=>new Promise(r=>setTimeout(r,ms));
await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1600,height:1000,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:process.env.DREAMHOME_URL||'http://127.0.0.1:5174/'});
for(let i=0;i<60;i++){await delay(500);if(await evaluate("!!window.__dreamhome && document.getElementById('loading').classList.contains('hidden')"))break;}
console.log('Ready',await evaluate('window.__dreamhome?.status()'));
// Send actual keyboard events through the application's normal movement loop.
const key=async(code,type='keyDown')=>call('Input.dispatchKeyEvent',{type,code,key:code==='ShiftLeft'?'Shift':code.slice(3).toLowerCase()});
const move=async(x,y,z,heading,distance)=>{
 await evaluate(`__dreamhome.place(${x},${y},${z},${heading});`);await delay(60);
 const before=await evaluate('__dreamhome.player.asArray()');await key('ShiftLeft');await key('KeyW');
 const result=await evaluate(`(async()=>{const begin=performance.now();while(performance.now()-begin<6000){await new Promise(requestAnimationFrame);const p=__dreamhome.player;const advance=(p.x-(${x}))*Math.sin(${heading})+(p.z-(${z}))*Math.cos(${heading});if(advance>=${distance})return {ok:true,p:p.asArray()};}return {ok:false,p:__dreamhome.player.asArray()};})()`);
 await key('KeyW','keyUp');await key('ShiftLeft','keyUp');if(!result.ok)throw new Error('Blocked browser route '+JSON.stringify({before,result,heading,distance}));return result.p;
};
const report={doors:[],stairs:[],routes:[],controls:[],performance:[],errors};
const tourOnly=process.argv.includes('--tour-only');
await evaluate('__dreamhome.setTime(false)');
if(await evaluate('__dreamhome.status().third')){await key('KeyV');await key('KeyV','keyUp');}
await evaluate('__dreamhome.world.doors.forEach(d=>d.open=true)');await delay(800);
const doors=await evaluate('__dreamhome.world.doors.map(d=>({name:d.name,x:d.x,y:d.y,z:d.z,width:d.width,along:d.along}))');
if(!tourOnly){
for(const d of doors){
 const cx=d.x+(d.along==='x'?d.width/2:0),cz=d.z+(d.along==='z'?d.width/2:0);
 // Gates are operated from inside the boundary; walking outside the acre is intentionally clamped.
 if(d.name.includes('gate')){
  await evaluate(`__dreamhome.place(${cx},${d.y},${cz+.8},Math.PI);__dreamhome.world.doors.find(d=>d.name===${JSON.stringify(d.name)}).open=false`);await delay(500);await key('KeyE');await key('KeyE','keyUp');
  if(!await evaluate(`__dreamhome.world.doors.find(d=>d.name===${JSON.stringify(d.name)}).open`))throw new Error('Gate interaction failed '+d.name);
 }else{
  const heading=d.along==='z'?Math.PI/2:0;
  const x=cx-(d.along==='z'?.65:0),z=cz-(d.along==='x'?.65:0);
  await evaluate(`__dreamhome.place(${x},${d.y},${z},${heading});__dreamhome.world.doors.find(d=>d.name===${JSON.stringify(d.name)}).open=false`);await delay(400);
  await key('KeyE');await key('KeyE','keyUp');
  if(!await evaluate(`__dreamhome.world.doors.find(d=>d.name===${JSON.stringify(d.name)}).open`))throw new Error('Door interaction failed '+d.name);
  await delay(400);await move(x,d.y,z,heading,1.3);
 }
 report.doors.push(d.name);
}
for(const [name,x,y,z,heading,distance,endY] of [
 ['arrival steps and double entrance',5.5,-.75,-12,0,14,0],
 ['arrival descent',5.5,0,-7.4,Math.PI,4.6,-.75],
 ['garden steps descent',6.5,0,23.4,0,3,-.75],
 ['garden steps ascent',6.5,-.75,26.4,Math.PI,3,0]
]){const end=await move(x,y,z,heading,distance);if(Math.abs(end[1]-endY)>.04)throw Error('Exterior stair level '+name);report.routes.push({name,end});}
const stairSystems=await evaluate(`(async()=>{const {stairs,stairLandings}=await import('/src/plan.ts');return stairLandings.map(l=>({landing:l,flights:stairs.filter(s=>s.level===l.level)}));})()`);
for(const {landing:l,flights:[lower,upper]} of stairSystems){
 const base=lower.base,start=lower.z-lower.d/2-.3,run=l.z-start;
 const first=await move(lower.x,base,start,0,run);
 if(Math.abs(first[1]-l.y)>.06)throw new Error('First stair landing height');
 await move(lower.x,l.y,l.z,Math.PI/2,upper.x-lower.x);
 const up=await move(upper.x,l.y,l.z,Math.PI,run);
 if(Math.abs(up[1]-(base+4.2))>.06)throw new Error('Floor arrival height');
 const returnLanding=await move(upper.x,base+4.2,start,0,run);
 await move(upper.x,l.y,l.z,-Math.PI/2,upper.x-lower.x);
 const down=await move(lower.x,l.y,l.z,Math.PI,run);
 if(Math.abs(down[1]-base)>.06)throw new Error('Stair descent height');
 report.stairs.push({floor:lower.level,first,up,returnLanding,down});
}
for(const [name,x,z,heading,distance] of [
 ['foyer to main stair approach',5.5,-1.8,-Math.PI/2,3.95],['main stair approach',1.55,-1.8,0,2.5],['cloak lobby opening',3,-2.1,-Math.PI/2,4.5],
 ['entry to living',5.5,-7,0,9],['living circulation',5.9,2,0,8],
 ['dining to kitchen',5.9,10.8,Math.PI/2,8.8],['living to rear aisle',5.9,10,0,7.5],['dining to garden',6.5,17.5,0,3.5],
 ['working kitchen aisle',14.7,10.8,0,4.8],['stool to dining aisle',11,10.8,0,6.7],['living to courtyard',5.9,6.5,Math.PI/2,3.9],
 ['upper east gallery',7.7,1.5,0,15.5],['upper overlook',7.7,17,-Math.PI/2,3.2],
 ['private hall',-1,-2,0,20],['upper private hall',-1,-2,0,20]
]){const y=name.startsWith('upper')?4.2:0;const end=await move(x,y,z,heading,distance);if(Math.abs(end[1]-y)>.03)throw Error('Route level '+name);report.routes.push({name,end});}
for(const [name,x,z,distance] of [['west loggia',-11.5,3.6,6.8],['east loggia',15.6,-2.4,5.8]]){const end=await move(x,4.2,z,0,distance);if(Math.abs(end[1]-4.2)>.03)throw Error('Loggia support');report.routes.push({name,end});}
}
report.continuousTours=[];
const tour=[[5.5,0,-7],[5.5,0,-1.8],[1.55,0,-1.8],[1.55,0,.7],[1.55,2.1,6.6],[3.85,2.1,6.6],[3.85,4.2,-.4],[7.7,4.2,-.4],[7.7,4.2,17],[4.5,4.2,17],[7.7,4.2,17],[7.7,4.2,-.4],[-1,4.2,-.4],[-1,4.2,-4.3],[-5.1,4.2,-4.3],[-5.1,6.3,1.5],[-2.9,6.3,1.5],[-2.9,8.4,-4.3],[-1,8.4,-3.9],[4,8.4,8]];
const travel=async target=>{
 const p=await evaluate('__dreamhome.player.asArray()'),heading=Math.atan2(target[0]-p[0],target[2]-p[2]),distance=Math.hypot(target[0]-p[0],target[2]-p[2]);
 await evaluate(`__dreamhome.face(${heading})`);await key('ShiftLeft');await key('KeyW');
 const result=await evaluate(`(async()=>{const begin=performance.now();while(performance.now()-begin<10000){await new Promise(requestAnimationFrame);const p=__dreamhome.player;if((p.x-(${p[0]}))*Math.sin(${heading})+(p.z-(${p[2]}))*Math.cos(${heading})>=${distance-.035})return p.asArray();}return null;})()`);
 await key('KeyW','keyUp');await key('ShiftLeft','keyUp');await delay(80);
 if(!result||Math.abs(result[1]-target[1])>.12)throw Error('Continuous tour blocked '+JSON.stringify({target,result}));console.log('Walked',target);return result;
};
for(const third of [false,true]){
 await evaluate('__dreamhome.place(5.5,0,-7,0)');if(await evaluate('__dreamhome.status().third')!==third){await key('KeyV');await key('KeyV','keyUp');}
 const walked=[];for(const target of [...tour.slice(1),...tour.slice(0,-1).reverse()])walked.push(await travel(target));
 report.continuousTours.push({camera:third?'third-person':'first-person',waypoints:walked});console.log('Continuous tour passed',third?'third-person':'first-person');
}
// Restore first-person before the existing control toggles.
if(await evaluate('__dreamhome.status().third')){await key('KeyV');await key('KeyV','keyUp');}
await evaluate("__dreamhome.go('foyer')");
await key('KeyV');await key('KeyV','keyUp');if(!await evaluate('__dreamhome.status().third'))throw new Error('Third person failed');
report.controls.push('third-person camera');
await key('KeyV');await key('KeyV','keyUp');if(await evaluate('__dreamhome.status().third'))throw new Error('First person failed');
report.controls.push('first-person camera');
await key('KeyN');await key('KeyN','keyUp');if(!await evaluate('__dreamhome.status().night'))throw new Error('Night failed');
await key('KeyN');await key('KeyN','keyUp');report.controls.push('day/night keyboard presets');
const beforeLights=await evaluate('__dreamhome.world.zones.filter(z=>z.on).length');await key('KeyL');await key('KeyL','keyUp');
if(await evaluate('__dreamhome.world.zones.filter(z=>z.on).length')!==beforeLights-1)throw new Error('Light switch failed');report.controls.push('nearest-zone lighting');
await evaluate('__dreamhome.world.zones.forEach(z=>z.on=true)');
for(const preset of ['low','balanced','high']){
 await evaluate(`__dreamhome.setQuality('${preset}');__dreamhome.showDesignView('arrival')`);await delay(400);
 const timing=await evaluate(`(async()=>{const intervals=[];let last=performance.now();for(let i=0;i<90;i++){await new Promise(requestAnimationFrame);const now=performance.now();if(i>9)intervals.push(now-last);last=now;}intervals.sort((a,b)=>a-b);const engine=__dreamhome.scene.getEngine();return {medianFrameMs:intervals[Math.floor(intervals.length/2)],p95FrameMs:intervals[Math.floor(intervals.length*.95)],renderWidth:engine.getRenderWidth(),renderHeight:engine.getRenderHeight(),meshes:__dreamhome.scene.meshes.length};})()`);
 report.performance.push({preset,...timing});report.controls.push(preset+' quality');
}
await evaluate("__dreamhome.setQuality('balanced');document.getElementById('map').click();document.querySelector('[data-plan=\"1\"]').click()");
if(!await evaluate("document.querySelector('#planDiagram svg').getAttribute('aria-label').startsWith('Upper')"))throw new Error('Plan switch failed');
await evaluate("document.getElementById('map').click()");report.controls.push('floor plan tabs');
console.log('Browser interactions passed',report.doors.length,'doors',report.stairs.length,'stairs');
await writeFile(tourOnly?'docs/views/stairs/continuous-walk.json':'docs/views/browser-check.json',JSON.stringify(report,null,2));
await evaluate("document.querySelectorAll('.top,.bottom,.intro,.crosshair,.prompt,.toast').forEach(e=>e.style.visibility='hidden')");
const capture=async(name,expression)=>{await evaluate(expression);await delay(900);const shot=await call('Page.captureScreenshot',{format:'png'});await writeFile(`docs/views/${name}.png`,Buffer.from(shot.data,'base64'));console.log('Captured',name);};
await capture('floor-plans',`(async()=>{const {floorPlanSvg}=await import('/src/diagrams.ts');const sheet=document.createElement('div');sheet.id='review-sheet';sheet.style.cssText='position:fixed;inset:0;z-index:100;background:#f4f1e9;display:flex;align-items:center;padding:40px;gap:25px';sheet.innerHTML='<div style=\"width:50%\">'+floorPlanSvg(0)+'</div><div style=\"width:50%\">'+floorPlanSvg(1)+'</div>';document.body.append(sheet);})()`);
await evaluate("document.getElementById('review-sheet').remove()");
if(errors.length)throw Error(JSON.stringify(errors));console.log('Performance (headless browser, not target-device certification)',JSON.stringify(report.performance));console.log('Errors',JSON.stringify(errors));
ws.close();clearInterval(keepAlive);
