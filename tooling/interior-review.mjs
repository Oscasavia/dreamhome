// Current approved-image review: saved front camera, walking approach, orthographic sides and site.
import {writeFile,mkdir} from 'node:fs/promises';
const phase='interior';
const directory='docs/views/interior';await mkdir(directory,{recursive:true});
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
const views=[
 ['foyer-entry','foyer'],['full-height-media','media'],['social-sequence','social'],['island-front','island'],
 ['upper-overlook','overlook'],['courtyard','court'],['courtyard-upper','courtSky'],['front-preserved','approved'],['rear-adjusted','rear']
];
const capture=async name=>{await pause(600);const shot=await call('Page.captureScreenshot',{format:'png'});await writeFile(`${directory}/${name}.png`,Buffer.from(shot.data,'base64'));};
const aim=async id=>ev(`__dreamhome.showDesignView('${id}');__dreamhome.player.copyFrom(__dreamhome.overview.position);__dreamhome.player.y-=1.65;`);
await ev("__dreamhome.world.doors.filter(d=>d.name.startsWith('Front entrance')||d.name.startsWith('Courtyard')||d.name==='Garden doors').forEach(d=>d.open=true)");
for(const [name,id] of views){await aim(id);if(name==='rear-adjusted')await ev('__dreamhome.overview.setTarget(__dreamhome.overview.target.set(4.5,4,18));__dreamhome.overview.setPosition(__dreamhome.overview.position.clone().set(5,2,30))');await capture(name);}
await aim('island');await ev('__dreamhome.overview.setTarget(__dreamhome.overview.target.set(13.4,1.0,13.6));__dreamhome.overview.setPosition(__dreamhome.overview.position.clone().set(11,1.65,18.2));__dreamhome.player.set(11,0,18.2)');await capture('island-rear');
await ev('__dreamhome.setTime(true)');await aim('social');await capture('social-evening');await aim('media');await capture('media-evening');
const performance=[];
for(const [preset,dpr,night] of [['balanced',1,false],['balanced',1,true],['high',2,true]]){
 await call('Emulation.setDeviceMetricsOverride',{width:1536,height:1024,deviceScaleFactor:dpr,mobile:false});
 await ev(`__dreamhome.setQuality('${preset}');__dreamhome.setTime(${night})`);await aim('social');await pause(600);
 const sample=await ev(`(async()=>{const times=[];let last=performance.now();for(let i=0;i<130;i++){await new Promise(requestAnimationFrame);const now=performance.now();if(i>=30)times.push(now-last);last=now;}times.sort((a,b)=>a-b);const e=__dreamhome.scene.getEngine();return {medianFrameMs:times[50],p95FrameMs:times[95],renderWidth:e.getRenderWidth(),renderHeight:e.getRenderHeight(),meshes:__dreamhome.scene.meshes.length,activeLocalLights:__dreamhome.world.zones.filter(z=>z.light.isEnabled()).length};})()`);
 performance.push({preset,dpr,night,...sample});
}
await call('Emulation.setDeviceMetricsOverride',{width:1536,height:1024,deviceScaleFactor:1,mobile:false});
await ev("__dreamhome.setQuality('balanced');__dreamhome.setTime(false)");await aim('social');
await writeFile(`${directory}/review.json`,JSON.stringify({phase,views,overrides:{'rear-adjusted':{eye:[5,2,30],target:[4.5,4,18]},'island-rear':{eye:[11,1.65,18.2],target:[13.4,1,13.6]}},source:'actual Babylon.js WebGL application; procedural geometry',performance,errors},null,2));
if(errors.length)throw Error(JSON.stringify(errors));console.log('Saved',directory,JSON.stringify(performance));ws.close();
