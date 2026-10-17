// Uses a separately launched Chrome debugging session. No browser package is installed.
import {writeFile} from 'node:fs/promises';
const pages=await (await fetch('http://127.0.0.1:9222/json/list')).json();
const page=pages.find(p=>p.type==='page');
const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let next=0;const pending=new Map();const errors=[];
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
const report={doors:[],stairs:[],controls:[],errors};
await evaluate('__dreamhome.world.doors.forEach(d=>d.open=true)');await delay(800);
const doors=await evaluate('__dreamhome.world.doors.map(d=>({name:d.name,x:d.x,y:d.y,z:d.z,width:d.width,along:d.along}))');
for(const d of doors){
 const cx=d.x+(d.along==='x'?d.width/2:0),cz=d.z+(d.along==='z'?d.width/2:0);
 // Gates are operated from inside the boundary; walking outside the acre is intentionally clamped.
 if(d.name.includes('gate')){
  await evaluate(`__dreamhome.place(${cx},0,${cz+.8},Math.PI);__dreamhome.world.doors.find(d=>d.name===${JSON.stringify(d.name)}).open=false`);await delay(500);await key('KeyE');await key('KeyE','keyUp');
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
for(const [floor,z] of [[0,1],[1,4]]){
 const up=await move(-4.65,floor*4.2,z,Math.PI/2,9.3);if(Math.abs(up[1]-(floor+1)*4.2)>.06)throw new Error('Stair height failed');
 const down=await move(4.65,(floor+1)*4.2,z,-Math.PI/2,9.3);if(Math.abs(down[1]-floor*4.2)>.06)throw new Error('Stair descent failed');
 report.stairs.push({floor,up,down});
}
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
for(const preset of ['low','balanced','high']){await evaluate(`__dreamhome.setQuality('${preset}')`);await delay(100);report.controls.push(preset+' quality');}
await evaluate("__dreamhome.setQuality('balanced');document.getElementById('map').click();document.querySelector('[data-plan=\"1\"]').click()");
if(!await evaluate("document.querySelector('#planDiagram svg').getAttribute('aria-label').startsWith('Upper')"))throw new Error('Plan switch failed');
await evaluate("document.getElementById('map').click()");report.controls.push('floor plan tabs');
console.log('Browser interactions passed',report.doors.length,'doors',report.stairs.length,'stairs');
await writeFile('docs/views/browser-check.json',JSON.stringify(report,null,2));
await evaluate("document.querySelectorAll('.top,.bottom,.intro,.crosshair,.prompt,.toast').forEach(e=>e.style.visibility='hidden')");
const capture=async(name,expression)=>{await evaluate(expression);await delay(900);const shot=await call('Page.captureScreenshot',{format:'png'});await writeFile(`docs/views/${name}.png`,Buffer.from(shot.data,'base64'));console.log('Captured',name);};
await capture('entrance-day',"__dreamhome.setTime(false);__dreamhome.showDesignView('arrival')");
await capture('garden-day',"__dreamhome.showDesignView('rear')");
await capture('courtyard',"__dreamhome.showDesignView('court')");
await capture('aerial',"__dreamhome.showDesignView('aerial')");
await capture('entrance-night',"__dreamhome.setTime(true);__dreamhome.showDesignView('arrival')");
await capture('living-overlook',"__dreamhome.setTime(false);__dreamhome.place(0,4.2,14.8,0,.45)");
await capture('floor-plans',`(async()=>{const {floorPlanSvg}=await import('/src/diagrams.ts');const sheet=document.createElement('div');sheet.id='review-sheet';sheet.style.cssText='position:fixed;inset:0;z-index:100;background:#f4f1e9;display:flex;align-items:center;padding:40px;gap:25px';sheet.innerHTML='<div style=\"width:50%\">'+floorPlanSvg(0)+'</div><div style=\"width:50%\">'+floorPlanSvg(1)+'</div>';document.body.append(sheet);})()`);
await evaluate("document.getElementById('review-sheet').remove()");
console.log('Errors',JSON.stringify(errors));
ws.close();
