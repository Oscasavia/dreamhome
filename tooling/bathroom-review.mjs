import {writeFile,mkdir} from 'node:fs/promises';
const capturesOnly=process.argv.includes('--captures-only');
const keep=setInterval(()=>{},1000),directory='docs/views/bathrooms';await mkdir(directory,{recursive:true});
const pages=await(await fetch('http://127.0.0.1:9222/json/list')).json(),ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pending=new Map(),errors=[];ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);};
ws.onclose=e=>{for(const p of pending.values())p.reject(Error('CDP closed '+e.code));};
const call=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const ev=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const delay=ms=>new Promise(r=>setTimeout(r,ms)),key=(code,type='keyDown')=>call('Input.dispatchKeyEvent',{type,code,key:code.slice(3).toLowerCase()}),tap=async code=>{await key(code);await key(code,'keyUp');};
await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await call('Page.navigate',{url:process.env.DREAMHOME_URL||'http://127.0.0.1:5174/'});
for(let i=0;i<80;i++){await delay(250);if(await ev("!!window.__dreamhome&&document.getElementById('loading').classList.contains('hidden')"))break;}
await ev("__dreamhome.setQuality('balanced');__dreamhome.setTime(false);__dreamhome.place(5.5,0,-3);document.querySelectorAll('.top,.bottom,.intro,.crosshair,.prompt,.toast').forEach(e=>e.style.visibility='hidden')");if(await ev('__dreamhome.status().third'))await tap('KeyV');
const baths=await ev(`(async()=>{const {bathrooms,bathRoute,bathView}=await import('/src/bathroomPlan.ts');return bathrooms.map(b=>({...b,route:bathRoute(b),view:bathView(b),vanityView:bathView(b,true)}));})()`);
const report={source:'actual Babylon.js browser; normal first-person camera',eyeHeight:1.65,fov:1.05,bathrooms:[],performance:[],errors};
const capture=async name=>{await delay(450);const s=await call('Page.captureScreenshot',{format:'png'});await writeFile(`${directory}/${name}.png`,Buffer.from(s.data,'base64'));};
const travel=async(p,y)=>{
 const a=await ev('__dreamhome.player.asArray()'),yaw=Math.atan2(p.x-a[0],p.z-a[2]),distance=Math.hypot(p.x-a[0],p.z-a[2]);if(distance<.025)return a;
 await ev(`__dreamhome.face(${yaw});`);await key('KeyW');
 const result=await ev(`(async()=>{const t=performance.now();while(performance.now()-t<7000){await new Promise(requestAnimationFrame);const p=__dreamhome.player;if((p.x-(${a[0]}))*Math.sin(${yaw})+(p.z-(${a[2]}))*Math.cos(${yaw})>=${distance-.025})return p.asArray();}return null;})()`);await key('KeyW','keyUp');
 if(!result||Math.abs(result[1]-y)>.02)throw Error('Bathroom walk blocked '+JSON.stringify({target:p,result,from:a}));return result;
};
const aim=async(view,base)=>{const p=await ev('__dreamhome.player.asArray()'),yaw=Math.atan2(view.target.x-p[0],view.target.z-p[2]),pitch=Math.atan2(1.65-view.targetHeight,Math.hypot(view.target.x-p[0],view.target.z-p[2]));await ev(`__dreamhome.face(${yaw},${pitch})`);};
await ev('__dreamhome.world.doors.forEach(d=>d.open=true)');await delay(600);
if(!capturesOnly){
for(const b of baths){
 const y=b.floor*4.2,name=JSON.stringify(b.name),row={id:b.id,route:[],controls:[]};
 await ev(`__dreamhome.world.doors.find(d=>d.name===${name}).open=false;__dreamhome.place(${b.route[0].x},${y},${b.route[0].z})`);await delay(500);await tap('KeyE');await delay(500);
 if(!await ev(`__dreamhome.world.doors.find(d=>d.name===${name}).open`))throw Error('Bathroom entrance interaction '+b.id);
 for(let i=1;i<3;i++)row.route.push(await travel(b.route[i],y));await tap('KeyE');await delay(550);
 if(await ev(`__dreamhome.world.doors.find(d=>d.name===${name}).open`))throw Error('Bathroom privacy door close '+b.id);row.controls.push('entered and closed privacy door');
 for(const p of b.route.slice(3))row.route.push(await travel(p,y));
 await travel(b.view.eye,y);await aim(b.view,y);await capture(b.id);
 await tap('KeyL');await delay(250);if(await ev(`__dreamhome.world.zones.find(z=>z.name===${name}).on`))throw Error('Bathroom light off '+b.id);await tap('KeyL');await delay(250);if(!await ev(`__dreamhome.world.zones.find(z=>z.name===${name}).on`))throw Error('Bathroom light on '+b.id);row.controls.push('bathroom-specific light switch');
 await travel(b.vanityView.eye,y);await aim(b.vanityView,y);await capture(b.id+'-vanity');
 await travel(b.view.eye,y);await ev('__dreamhome.setTime(true)');await aim(b.view,y);await capture(b.id+'-night');await ev('__dreamhome.setTime(false)');
 await travel(b.route[2],y);await tap('KeyE');await delay(500);if(!await ev(`__dreamhome.world.doors.find(d=>d.name===${name}).open`))throw Error('Bathroom exit interaction '+b.id);
 await travel(b.route[1],y);await travel(b.route[0],y);row.controls.push('reopened and exited');report.bathrooms.push(row);console.log('Bathroom passed',b.id);
}
// Public guest-bath approach uses the cloak vestibule, not a bedroom.
await ev('__dreamhome.place(5.5,0,-2.1)');for(const p of [{x:-1,z:-2.1},{x:-1,z:-4.1},{x:-8.8,z:-4.1}])await travel(p,0);report.guestPublicRoute=true;
for(const [preset,dpr,night] of [['balanced',1,false],['balanced',1,true],['high',2,true]]){
 await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:dpr,mobile:false});await ev(`__dreamhome.setQuality('${preset}');__dreamhome.setTime(${night});__dreamhome.showDesignView('bath-master')`);await delay(300);
 const sample=await ev(`(async()=>{let last=performance.now();const times=[];for(let i=0;i<130;i++){await new Promise(requestAnimationFrame);const now=performance.now();if(i>=30)times.push(now-last);last=now;}times.sort((a,b)=>a-b);const e=__dreamhome.scene.getEngine();return {medianMs:times[50],p95Ms:times[95],width:e.getRenderWidth(),height:e.getRenderHeight(),meshes:__dreamhome.scene.meshes.length,localLights:__dreamhome.world.zones.filter(z=>z.light.isEnabled()).length};})()`);report.performance.push({preset,dpr,night,...sample});
}
}else{
 // Capture-only mode changes viewpoint directly; it never overwrites movement/performance evidence.
 for(const b of baths){const y=b.floor*4.2;await ev(`__dreamhome.world.doors.find(d=>d.name===${JSON.stringify(b.name)}).open=false`);
  for(const [name,view,night] of [[b.id,b.view,false],[b.id+'-vanity',b.vanityView,false],[b.id+'-night',b.view,true]]){await ev(`__dreamhome.place(${view.eye.x},${y},${view.eye.z});__dreamhome.setTime(${night})`);await aim(view,y);await capture(name);}
 }
}
await call('Emulation.setDeviceMetricsOverride',{width:1600,height:1000,deviceScaleFactor:1,mobile:false});await ev("__dreamhome.setQuality('balanced');__dreamhome.setTime(false)");
await ev(`(async()=>{const {floorPlanSvg}=await import('/src/diagrams.ts');const e=document.createElement('div');e.id='review-sheet';e.style.cssText='position:fixed;inset:0;z-index:100;background:#f4f1e9;display:flex;align-items:center;padding:35px;gap:25px';e.innerHTML='<div style="width:50%">'+floorPlanSvg(0)+'</div><div style="width:50%">'+floorPlanSvg(1)+'</div>';document.body.append(e);})()`);
await delay(300);const plans=await call('Page.captureScreenshot',{format:'png'});await writeFile('docs/views/floor-plans.png',Buffer.from(plans.data,'base64'));await ev("document.getElementById('review-sheet').remove()");
await ev(`(async()=>{const {bathroomPlanSvg}=await import('/src/diagrams.ts');const {bathrooms}=await import('/src/bathroomPlan.ts');const e=document.createElement('div');e.id='bathroom-sheet';e.style.cssText='position:fixed;inset:0;z-index:100;background:#f4f1e9;padding:30px;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(2,1fr);gap:20px';e.innerHTML=bathrooms.map(b=>'<div style="display:flex;align-items:center">'+bathroomPlanSvg(b)+'</div>').join('')+'<div style="padding:30px;font:18px/1.6 system-ui;color:#343d37"><h2>Bathroom plans</h2>Finished clear dimensions<br>Green dashed: walking route<br>Gold outlines: working spaces<br>Gold arc: privacy door swing<br><small>Concept geometry; rear at top.</small></div>';document.body.append(e);})()`);
await delay(300);const sheet=await call('Page.captureScreenshot',{format:'png'});await writeFile(`${directory}/plans.png`,Buffer.from(sheet.data,'base64'));await ev("document.getElementById('bathroom-sheet').remove()");
if(!capturesOnly)await writeFile(`${directory}/review.json`,JSON.stringify(report,null,2));if(errors.length)throw Error(JSON.stringify(errors));console.log('Review complete',JSON.stringify(report.performance));ws.close();clearInterval(keep);
