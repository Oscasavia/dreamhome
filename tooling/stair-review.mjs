// Current stair review: actual application views, rigid furniture proxy and frame samples.
import {writeFile,mkdir} from 'node:fs/promises';
const phase='stairs';
const directory='docs/views/stairs';await mkdir(directory,{recursive:true});
const pages=await(await fetch('http://127.0.0.1:9222/json/list')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let next=0;const pending=new Map(),errors=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);};
const call=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++next,{resolve,reject});ws.send(JSON.stringify({id:next,method,params}));});
const ev=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
await call('Runtime.enable');await call('Emulation.setDeviceMetricsOverride',{width:1536,height:1024,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:process.env.DREAMHOME_URL||'http://127.0.0.1:5174/'});
for(let i=0;i<60;i++){await pause(300);if(await ev("!!window.__dreamhome&&document.getElementById('loading').classList.contains('hidden')"))break;}
await ev("__dreamhome.setQuality('balanced');__dreamhome.setTime(false);document.querySelectorAll('.top,.bottom,.intro,.crosshair,.prompt,.toast').forEach(e=>e.style.visibility='hidden')");
const views=[['foyer-stair','foyerStair'],['approach','foyerStair'],['flights-landing','foyerStair'],['upper-arrival','stair'],['turning-landing','stairLower'],['roof-access','stairRoof'],['living-preserved','social']];
const capture=async name=>{await pause(600);const shot=await call('Page.captureScreenshot',{format:'png'});await writeFile(`${directory}/${name}.png`,Buffer.from(shot.data,'base64'));};
const aim=async id=>ev(`__dreamhome.showDesignView('${id}');__dreamhome.player.copyFrom(__dreamhome.overview.position);__dreamhome.player.y-=1.65;`);
await ev("__dreamhome.world.doors.filter(d=>d.name.startsWith('Front entrance')||d.name.startsWith('Courtyard')||d.name==='Garden doors').forEach(d=>d.open=true)");
for(const [name,id] of views){
 await aim(id);
 if(name==='approach')await ev('__dreamhome.overview.setTarget(__dreamhome.overview.target.set(2.4,.5,.1));__dreamhome.overview.setPosition(__dreamhome.overview.position.clone().set(6.1,3.8,-3))');
 if(name==='flights-landing')await ev('__dreamhome.overview.setTarget(__dreamhome.overview.target.set(2.4,2.4,4));__dreamhome.overview.setPosition(__dreamhome.overview.position.clone().set(6,3.1,9.2))');
 await capture(name);
}
await ev('__dreamhome.setTime(true)');await aim('foyerStair');await capture('stair-evening');await ev('__dreamhome.setTime(false)');
await ev(`(async()=>{const {MeshBuilder}=await import('/node_modules/@babylonjs/core/Meshes/meshBuilder.js');const {StandardMaterial}=await import('/node_modules/@babylonjs/core/Materials/standardMaterial.js');const {furnitureRoute,FURNITURE}=await import('/src/stairClearance.ts');const p=furnitureRoute().find(p=>p.stage==='Rigid 180 degree turn'&&p.yaw>=Math.PI/4);const m=MeshBuilder.CreateBox('Review rigid furniture proxy',{width:FURNITURE.width,height:FURNITURE.height,depth:FURNITURE.length},__dreamhome.scene);m.position.set(p.x,p.y,p.z);m.rotation.set(-p.pitch,p.yaw,0);const mat=new StandardMaterial('Review proxy orange',__dreamhome.scene);mat.diffuseColor.set(1,.48,.08);mat.alpha=.7;m.material=mat;window.__stairProxy=m;})()`);
await aim('stair');await ev('__dreamhome.overview.setTarget(__dreamhome.overview.target.set(2.7,2.8,6.6));__dreamhome.overview.setPosition(__dreamhome.overview.position.clone().set(6,5.5,9))');await capture('furniture-turn-proxy');await ev('__stairProxy.dispose();delete window.__stairProxy');
const performance=[];
for(const [preset,dpr,night] of [['balanced',1,false],['balanced',1,true],['high',2,true]]){
 await call('Emulation.setDeviceMetricsOverride',{width:1536,height:1024,deviceScaleFactor:dpr,mobile:false});
 await ev(`__dreamhome.setQuality('${preset}');__dreamhome.setTime(${night})`);await aim('foyerStair');await pause(600);
 const sample=await ev(`(async()=>{const times=[];let last=performance.now();for(let i=0;i<130;i++){await new Promise(requestAnimationFrame);const now=performance.now();if(i>=30)times.push(now-last);last=now;}times.sort((a,b)=>a-b);const e=__dreamhome.scene.getEngine();return {medianFrameMs:times[50],p95FrameMs:times[95],renderWidth:e.getRenderWidth(),renderHeight:e.getRenderHeight(),meshes:__dreamhome.scene.meshes.length,activeLocalLights:__dreamhome.world.zones.filter(z=>z.light.isEnabled()).length};})()`);
 performance.push({preset,dpr,night,...sample});
}
await call('Emulation.setDeviceMetricsOverride',{width:1536,height:1024,deviceScaleFactor:1,mobile:false});
await ev("__dreamhome.setQuality('balanced');__dreamhome.setTime(false)");await aim('foyerStair');
await writeFile(`${directory}/review.json`,JSON.stringify({phase,views,source:'actual Babylon.js WebGL application; procedural geometry',performance,errors},null,2));
if(errors.length)throw Error(JSON.stringify(errors));console.log('Saved',directory,JSON.stringify(performance));ws.close();
