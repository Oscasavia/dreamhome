// Comparable before/after captures: moderate perspective and true orthographic side elevations.
import {writeFile,mkdir} from 'node:fs/promises';
const phase=process.argv[2]||'after';
const directory=`docs/views/exterior-${phase}`;await mkdir(directory,{recursive:true});
const pages=await(await fetch('http://127.0.0.1:9222/json/list')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let next=0;const pending=new Map(),errors=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);};
const call=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++next,{resolve,reject});ws.send(JSON.stringify({id:next,method,params}));});
const ev=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
await call('Runtime.enable');await call('Emulation.setDeviceMetricsOverride',{width:1600,height:1000,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:process.env.DREAMHOME_URL||'http://127.0.0.1:5174/'});
for(let i=0;i<60;i++){await pause(300);if(await ev("!!window.__dreamhome&&document.getElementById('loading').classList.contains('hidden')"))break;}
await ev("__dreamhome.setQuality('balanced');__dreamhome.setTime(false);document.querySelectorAll('.top,.bottom,.intro,.crosshair,.prompt,.toast').forEach(e=>e.style.visibility='hidden')");
const views=[
 ['front',[7.5,1.65,-28],[0,4.1,3]],
 ['front-left',[-21,2,-26],[0,4.2,5]],
 ['front-right',[28,7,-24],[1,4.2,5]],
 ['west',[-24,5.5,8],[-5,5.5,8],true],
 ['east',[24,5.5,8],[5,5.5,8],true],
 ['rear',[-24,2,30],[0,4,17]],
 ['rear-elevation',[1,5.5,31],[1,5.5,10],true],
 ['foyer-stair',[3,1.65,-2.2],[-3,2,-1.5]]
];
const aim=async(eye,target,ortho=false)=>ev(`__dreamhome.showDesignView('arrival');{const c=__dreamhome.overview;c.mode=${ortho?1:0};c.fov=.8;c.orthoLeft=-17;c.orthoRight=17;c.orthoTop=10.625;c.orthoBottom=-10.625;c.setTarget(c.target.set(${target.join(',')}));c.setPosition(c.position.clone().set(${eye.join(',')}));}`);
const capture=async name=>{await pause(600);const shot=await call('Page.captureScreenshot',{format:'png'});await writeFile(`${directory}/${name}.png`,Buffer.from(shot.data,'base64'));};
for(const [name,eye,target,ortho] of views){await aim(eye,target,ortho);await capture(name);}
await aim(views[1][1],views[1][2]);
await ev('__dreamhome.scene.shadowsEnabled=false');await capture('diagnostic-no-shadows');
await ev('__dreamhome.scene.texturesEnabled=false');await capture('diagnostic-no-shadows-no-textures');
await ev('__dreamhome.scene.texturesEnabled=true;__dreamhome.scene.shadowsEnabled=true');
await ev(`window.__reviewMaterials=__dreamhome.scene.materials.map(m=>({m,diffuse:m.diffuseColor?.clone(),emissive:m.emissiveColor?.clone()}));__dreamhome.scene.texturesEnabled=false;for(const {m} of __reviewMaterials)if(m.alpha===1){m.diffuseColor?.set(.78,.78,.76);m.emissiveColor?.set(0,0,0);}`);
await capture('plain-materials');
await ev('for(const {m,diffuse,emissive} of __reviewMaterials){if(diffuse)m.diffuseColor.copyFrom(diffuse);if(emissive)m.emissiveColor.copyFrom(emissive);}delete window.__reviewMaterials;__dreamhome.scene.texturesEnabled=true');
await ev('__dreamhome.setTime(true)');await capture('front-left-night');
await writeFile(`${directory}/review.json`,JSON.stringify({phase,views,perspectiveVerticalFovRadians:.8,sideProjection:'orthographic',source:phase==='after'?'exterior refinement working tree':'23a32fd baseline',errors},null,2));
if(errors.length)throw Error(JSON.stringify(errors));console.log('Saved',directory);ws.close();
