// Current approved-image review: saved front camera, walking approach, orthographic sides and site.
import {writeFile,mkdir} from 'node:fs/promises';
const phase='ivory';
const directory='docs/views/ivory';await mkdir(directory,{recursive:true});
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
 ['approved-front',[-4,7.5,-37],[4.5,2.4,-4]],
 ['walking-front',[4.8,.9,-29],[3.5,3.4,-3],false,1.05],
 ['front-left',[-22,2,-24],[0,4,1]],
 ['west',[-25,5,7],[-5,5,7],true],
 ['east',[25,5,9],[5,5,9],true],
 ['rear',[-25,3,30],[0,4,18]],
 ['garage',[10,4,-25],[25,1,-11]],
 ['courtyard',[9.8,1.65,9.1],[11.6,1.2,6.5]],
 ['living-overlook',[4.5,5.85,17],[2.8,2.4,11.5]],
 ['top',[0,65,0],[0,0,.01],true,.95,52],
 ['veranda',[4.8,1.3,-12],[5.2,2,-4]],
 ['foyer-stair',[5.5,1.65,-3],[2.7,2.4,3.2]]
];
const aim=async(eye,target,ortho=false,fov=.95,span=19)=>ev(`__dreamhome.showDesignView('arrival');{const c=__dreamhome.overview;c.mode=${ortho?1:0};c.fov=${fov};c.orthoLeft=-${span};c.orthoRight=${span};c.orthoTop=${span/1.5};c.orthoBottom=-${span/1.5};c.setTarget(c.target.set(${target.join(',')}));c.setPosition(c.position.clone().set(${eye.join(',')}));}`);
const capture=async name=>{await pause(600);const shot=await call('Page.captureScreenshot',{format:'png'});await writeFile(`${directory}/${name}.png`,Buffer.from(shot.data,'base64'));};
for(const [name,eye,target,ortho,fov,span] of views){await aim(eye,target,ortho,fov,span);await capture(name);}
await aim(views[0][1],views[0][2]);
await ev('__dreamhome.scene.shadowsEnabled=false');await capture('diagnostic-no-shadows');
await ev('__dreamhome.scene.texturesEnabled=false');await capture('diagnostic-no-shadows-no-textures');
await ev('__dreamhome.scene.texturesEnabled=true;__dreamhome.scene.shadowsEnabled=true');
await ev(`window.__reviewMaterials=__dreamhome.scene.materials.map(m=>({m,diffuse:m.diffuseColor?.clone(),emissive:m.emissiveColor?.clone()}));__dreamhome.scene.texturesEnabled=false;for(const {m} of __reviewMaterials)if(m.alpha===1){m.diffuseColor?.set(.78,.78,.76);m.emissiveColor?.set(0,0,0);}`);
await capture('plain-materials');
await ev('for(const {m,diffuse,emissive} of __reviewMaterials){if(diffuse)m.diffuseColor.copyFrom(diffuse);if(emissive)m.emissiveColor.copyFrom(emissive);}delete window.__reviewMaterials;__dreamhome.scene.texturesEnabled=true');
await ev('__dreamhome.setTime(true)');await capture('approved-front-night');
await writeFile(`${directory}/review.json`,JSON.stringify({phase,views,perspectiveVerticalFovRadians:.95,sideProjection:'orthographic',source:'approved ivory reference implementation',errors},null,2));
if(errors.length)throw Error(JSON.stringify(errors));console.log('Saved',directory);ws.close();
