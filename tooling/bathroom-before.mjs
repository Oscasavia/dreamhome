// Historical audit: run only against baseline a2032d4; preserve the committed before captures.
import {writeFile,mkdir} from 'node:fs/promises';
const keep=setInterval(()=>{},1000),directory='docs/views/bathrooms-before';await mkdir(directory,{recursive:true});
const pages=await(await fetch('http://127.0.0.1:9222/json/list')).json(),ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}};
const call=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const ev=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
await call('Page.navigate',{url:'http://127.0.0.1:5174/'});await new Promise(r=>setTimeout(r,1500));await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await ev("__dreamhome.setQuality('balanced');__dreamhome.setTime(false);__dreamhome.showDesignView('foyerStair');document.querySelectorAll('.top,.bottom,.intro,.crosshair,.prompt,.toast').forEach(e=>e.style.visibility='hidden')");
const baths=await ev(`(async()=>{const {rooms,ensuiteRect,ARCH}=await import('/src/plan.ts');return [...rooms.filter(r=>r.ensuite).map(r=>({id:r.id,floor:r.floor,...ensuiteRect(r)})),{id:'guest',floor:0,...ARCH.powder}];})()`);
for(const b of baths){await ev(`__dreamhome.overview.fov=.95;__dreamhome.overview.setPosition(__dreamhome.overview.position.clone().set(${b.x-.35},${b.floor*4.2+1.65},${b.z-b.d/2+.65}));__dreamhome.overview.setTarget(__dreamhome.overview.target.clone().set(${b.x+.25},${b.floor*4.2+1.1},${b.z+b.d/2-.25}));`);await new Promise(r=>setTimeout(r,400));const s=await call('Page.captureScreenshot',{format:'png'});await writeFile(`${directory}/${b.id}.png`,Buffer.from(s.data,'base64'));}
await writeFile(`${directory}/audit.json`,JSON.stringify(baths,null,2));ws.close();clearInterval(keep);console.log('Captured seven existing bathrooms');
