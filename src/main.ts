import {Engine} from '@babylonjs/core/Engines/engine';
import {Scene} from '@babylonjs/core/scene';
import {UniversalCamera} from '@babylonjs/core/Cameras/universalCamera';
import {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {Color3} from '@babylonjs/core/Maths/math.color';
import {Ray} from '@babylonjs/core/Culling/ray';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {createWorld,type Door} from './world';
import {blocked,groundHeight,destinations,rooms,STOREY,SITE_SIDE,ARCH,LEVEL,inside} from './plan';
import {floorPlanSvg,sitePlanSvg} from './diagrams';
import './style.css';

const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`
<canvas id="view" aria-label="Interactive 3D mansion walkthrough" tabindex="0"></canvas>
<div class="loading" id="loading"><div><div class="eyebrow">OSCAR’S PRIVATE ESTATE</div><h2>Dreamhome.</h2><p>PREPARING YOUR ARRIVAL</p></div></div>
<header class="top"><div class="brand"><div class="monogram">D.</div><div><strong>DREAMHOME</strong><small>A contemporary courtyard estate</small></div></div><nav class="toolbar" aria-label="View controls"><button class="button" id="time">☀ Daylight</button><button class="button" id="camera">First person</button><button class="button" id="map">Estate map</button><select id="quality" aria-label="Graphics quality"><option value="balanced">Balanced</option><option value="low">Performance</option><option value="high">High quality</option></select><select id="designView" aria-label="Architectural views"><option value="walk">Walkthrough</option><option value="arrival">Entrance view</option><option value="front">Front elevation</option><option value="frontLeft">Front-left view</option><option value="frontRight">Front-right view</option><option value="west">West elevation</option><option value="east">East elevation</option><option value="foyerStair">Foyer to stair</option><option value="rear">Garden view</option><option value="court">Courtyard view</option><option value="courtSky">Courtyard overlook</option><option value="social">Social spaces</option><option value="foyer">Foyer view</option><option value="overlook">Living overlook</option><option value="stair">Upper stair arrival</option><option value="stairLower">Intermediate landing</option><option value="stairRoof">Roof stair arrival</option><option value="roof">Rooftop terrace</option><option value="aerial">Aerial view</option></select><button class="button" id="help">?</button></nav></header>
<section class="intro" id="intro"><div class="eyebrow">ONE ACRE · SIX PRIVATE SUITES</div><h1>Room to breathe.<br>Space to belong.</h1><p>A quiet courtyard at the heart of a contemporary home. Explore two floors, a rooftop retreat, and gardens designed around life outdoors.</p><div class="specs"><div><b>06</b><span>Ensuite bedrooms</span></div><div><b>02</b><span>Residential floors</span></div><div><b>01</b><span>Acre of possibility</span></div></div><div class="actions"><button class="button primary" id="enter">Enter the estate ↗</button><button class="button" id="explore">Explore the plan</button></div><p class="subnote">Interactive architectural concept · dimensions and layout are editable</p></section>
<div id="crosshair" class="crosshair hidden"></div><div id="prompt" class="prompt hidden"></div>
<aside class="map-panel hidden" id="mapPanel"><div class="eyebrow">YOUR PLACE IN THE ESTATE</div><h2>Take a look around.</h2><div class="plan-tabs"><button class="button" data-plan="site">Site</button><button class="button" data-plan="0">Ground</button><button class="button" data-plan="1">Upper</button></div><div id="planDiagram">${sitePlanSvg()}</div><div id="destinations"></div><p>Concept plot: ${SITE_SIDE.toFixed(2)} × ${SITE_SIDE.toFixed(2)} m. Rear garden is at the top; compass orientation is unconfirmed. Use these shortcuts or walk through the estate.</p></aside>
<div class="bottom"><div class="controls"><span><kbd>W A S D</kbd> Walk</span><span><kbd>Mouse</kbd> Look</span><span><kbd>E</kbd> Door</span><span><kbd>L</kbd> Lights</span><span><kbd>V</kbd> Camera</span><span><kbd>Esc</kbd> Release</span></div><div class="location"><strong id="location">Arrival court</strong><span class="dot"></span><span id="stats">Preparing estate</span></div></div>
<div class="touch" id="touch"><button data-key="KeyW" aria-label="Move forward">↑</button><button data-key="KeyA" aria-label="Move left">←</button><button data-key="KeyS" aria-label="Move backward">↓</button><button data-key="KeyD" aria-label="Move right">→</button></div><div class="mobile-action"><button class="button" id="interact">Open / close</button><button class="button" id="lights">Lights</button></div>
<div class="help hidden" id="helpPanel"><button class="button" id="closeHelp">Close</button><h2>Make yourself at home.</h2><ul><li>Enter the estate, then click the view to capture the mouse.</li><li>WASD / arrow keys move; mouse looks. Hold Shift to walk faster.</li><li>E opens or closes a nearby door. L switches the nearest room's lighting.</li><li>V changes first / third person. N changes day / night. M opens the map.</li><li>Stairs in the entrance hall connect both floors and the rooftop.</li><li>Escape releases the mouse. On touchscreens, drag to look and use the arrow buttons.</li><li>Performance mode reduces resolution and disables shadows.</li><li>R returns to the entrance if you get stuck.</li></ul></div><div class="toast hidden" id="toast" role="status"></div>`;
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const canvas=$<HTMLCanvasElement>('view');
try { start(); }catch(e){$('loading').innerHTML='<div class="error"><h2>Unable to start 3D</h2><p>Check that hardware acceleration and WebGL are enabled in your browser, then reload.</p><p>'+String(e).replace(/[<>&]/g,'')+'</p></div>';console.error(e);}

function start(){
const engine=new Engine(canvas,true,{stencil:true,preserveDrawingBuffer:false,powerPreference:'high-performance'});
const scene=new Scene(engine);scene.skipPointerMovePicking=true;
const world=createWorld(scene);
const camera=new UniversalCamera('Walkthrough',new Vector3(6,LEVEL.eye,-12),scene);camera.minZ=.07;camera.maxZ=180;camera.fov=1.05;camera.inputs.clear();
const overview=new ArcRotateCamera('Estate overview',-Math.PI*.7,Math.PI*.31,83,new Vector3(0,1,4),scene);overview.fov=1.05;overview.minZ=.2;overview.maxZ=250;scene.activeCamera=overview;
const player=new Vector3(6,LEVEL.ground,-12);let designView=false;let yaw=0,pitch=0,third=false,started=false,night=false,keys=new Set<string>(),quality='balanced',toastTimer=0,drag=false,lastX=0,lastY=0,elapsed=0;
const avatar=new TransformNode('Visitor',scene);const shirt=new StandardMaterial('Visitor linen',scene);shirt.diffuseColor=Color3.FromHexString('#c8c9b7');const pants=new StandardMaterial('Visitor trousers',scene);pants.diffuseColor=Color3.FromHexString('#34413a');const skin=new StandardMaterial('Visitor skin',scene);skin.diffuseColor=Color3.FromHexString('#a77755');
const torso=MeshBuilder.CreateCapsule('Visitor torso',{height:.75,radius:.2,tessellation:8},scene);torso.parent=avatar;torso.position.y=1.1;torso.material=shirt;
const head=MeshBuilder.CreateSphere('Visitor head',{diameter:.31,segments:10},scene);head.parent=avatar;head.position.y=1.64;head.material=skin;
const limbs:Mesh[]=[];for(const side of [-1,1]){const leg=MeshBuilder.CreateCapsule('Visitor leg',{height:.8,radius:.085,tessellation:8},scene);leg.parent=avatar;leg.position.set(side*.12,.42,0);leg.material=pants;limbs.push(leg);const arm=MeshBuilder.CreateCapsule('Visitor arm',{height:.68,radius:.07,tessellation:8},scene);arm.parent=avatar;arm.position.set(side*.29,1.03,0);arm.material=shirt;limbs.push(arm);}avatar.setEnabled(false);
for(const m of [torso,head,...limbs]){m.isPickable=false;world.shadows.addShadowCaster(m);}
function toast(text:string){$('toast').textContent=text;$('toast').classList.remove('hidden');clearTimeout(toastTimer);toastTimer=window.setTimeout(()=>$('toast').classList.add('hidden'),3200);}
function save(){try{localStorage.setItem('dreamhome-settings',JSON.stringify({night,quality,third}));}catch{}}
function setQuality(value:string){quality=value;const dpr=Math.min(window.devicePixelRatio||1,2);engine.setHardwareScalingLevel(value==='low'?1.65:value==='high'?1/dpr:1);world.shadows.getShadowMap()!.refreshRate=value==='low'?0:1;scene.shadowsEnabled=value!=='low';engine.resize();save();}
function setTime(value:boolean){night=value;world.setNight(night);$('time').textContent=night?'☾ Nightfall':'☀ Daylight';$('time').classList.toggle('active',night);save();}
function setCamera(){third=!third;$('camera').textContent=third?'Third person':'First person';avatar.setEnabled(third&&started);save();}
function enter(lock=true){designView=false;$<HTMLSelectElement>('designView').value='walk';started=true;scene.activeCamera=camera;$('intro').classList.add('hidden');$('crosshair').classList.remove('hidden');avatar.setEnabled(third);if(lock&&matchMedia('(pointer:fine)').matches)canvas.requestPointerLock()?.catch(()=>toast('Click and drag in the view to look around.'));}
function nearestDoor():Door|undefined {
 const centre=(d:Door)=>new Vector3(d.x+(d.along==='x'?d.width/2:0),d.y,d.z+(d.along==='z'?d.width/2:0));
 return world.doors.filter(d=>Math.abs(d.y-player.y)<1.6&&Vector3.Distance(centre(d),player)<3.2).sort((a,b)=>Vector3.DistanceSquared(centre(a),player)-Vector3.DistanceSquared(centre(b),player))[0];
}
function interact(){if(!started)return;const d=nearestDoor();if(d){d.open=!d.open;toast(`${d.name} · ${d.open?'opening':'closing'}`);}else toast('Move closer to a door or gate.');}
function lights(){if(!started)return;const near=world.zones.filter(z=>Math.abs(z.position.y-player.y-1)<2).sort((a,b)=>Vector3.DistanceSquared(a.position,player)-Vector3.DistanceSquared(b.position,player))[0];if(near&&Vector3.Distance(near.position,player)<8){near.on=!near.on;toast(`${near.name} · lights ${near.on?'on':'off'}`);}else toast('Move inside a room to switch its lighting.');}
function toggleMap(){document.exitPointerLock();$('mapPanel').classList.toggle('hidden');keys.clear();}
function go(id:string){const d=destinations.find(v=>v.id===id)!;player.set(d.x,d.y,d.z);yaw=d.yaw;pitch=0;enter(false);$('mapPanel').classList.add('hidden');toast(d.name+' · click the view to look around');}
$('destinations').innerHTML=destinations.map((d,i)=>`<button class="destination" data-destination="${d.id}"><span>${String(i+1).padStart(2,'0')} &nbsp; ${d.name}</span><span>↗</span></button>`).join('');document.querySelectorAll<HTMLButtonElement>('[data-destination]').forEach(b=>b.onclick=()=>go(b.dataset.destination!));
document.querySelectorAll<HTMLButtonElement>('[data-plan]').forEach(b=>b.onclick=()=>{$('planDiagram').innerHTML=b.dataset.plan==='site'?sitePlanSvg():floorPlanSvg(Number(b.dataset.plan));});
const designViews:Record<string,{eye:number[];target:number[];ortho?:boolean;fov?:number}>= {
 front:{eye:[7.5,1.65,-28],target:[0,4.1,3],fov:.8},frontLeft:{eye:[-21,2,-26],target:[0,4.2,5],fov:.8},frontRight:{eye:[28,7,-24],target:[1,4.2,5],fov:.8},
 west:{eye:[-24,5.5,8],target:[-5,5.5,8],ortho:true},east:{eye:[24,5.5,8],target:[5,5.5,8],ortho:true},foyerStair:{eye:[3,1.65,-2.2],target:[-3,2,-1.5],fov:.8},
 arrival:{eye:[-14,1.65,-21],target:[1,3,0]},rear:{eye:[-24,1.65,30],target:[1,3.4,19]},
 court:{eye:[9.8,1.65,9.1],target:[11.6,1.2,6.5]},courtSky:{eye:[10.2,5.85,4.25],target:[11.25,1,7.5]},aerial:{eye:[-34,43,-35],target:[2,0,5]},
 social:{eye:[7.5,1.65,19],target:[8,1.6,8]},foyer:{eye:[3,1.65,-3.5],target:[3,2,8]},
 overlook:{eye:[4.5,5.85,12],target:[4.5,1.5,5]},stair:{eye:[-2.8,5.85,-4.5],target:[-4.6,2.5,1]},
 stairLower:{eye:[-5.1,3.75,1.5],target:[-2.9,4,-3.5]},stairRoof:{eye:[-2.8,10.05,-4.5],target:[-4.6,6.7,1]},roof:{eye:[-1,10.05,-3.7],target:[9,9.2,9]}

};
function showDesignView(id:string){
 const view=designViews[id];if(!view){enter(false);return;}
 document.exitPointerLock();keys.clear();designView=true;started=false;avatar.setEnabled(false);
 $('intro').classList.add('hidden');$('crosshair').classList.add('hidden');$('prompt').classList.add('hidden');
 overview.mode=view.ortho?1:0;overview.fov=view.fov??1.05;overview.orthoLeft=-17;overview.orthoRight=17;overview.orthoTop=17/engine.getAspectRatio(overview);overview.orthoBottom=-overview.orthoTop;
 overview.setTarget(Vector3.FromArray(view.target));overview.setPosition(Vector3.FromArray(view.eye));scene.activeCamera=overview;
 $<HTMLSelectElement>('designView').value=id;
}
$<HTMLSelectElement>('designView').onchange=e=>showDesignView((e.target as HTMLSelectElement).value);
// Development-only review bridge for reproducible browser inspection; absent from production.
if(import.meta.env.DEV)Object.assign(window,{__dreamhome:{world,scene,player,camera,overview,go,showDesignView,setTime,setQuality,
 place:(x:number,y:number,z:number,heading=0,tilt=0)=>{player.set(x,y,z);yaw=heading;pitch=tilt;enter(false);},
 status:()=>({third,night,quality,started,position:player.asArray(),meshes:scene.meshes.length})}});
$('enter').onclick=()=>enter();$('explore').onclick=toggleMap;$('map').onclick=toggleMap;$('time').onclick=()=>setTime(!night);$('camera').onclick=setCamera;$('interact').onclick=interact;$('lights').onclick=lights;
$('help').onclick=()=>{document.exitPointerLock();keys.clear();$('helpPanel').classList.toggle('hidden');};$('closeHelp').onclick=()=>$('helpPanel').classList.add('hidden');$<HTMLSelectElement>('quality').onchange=e=>setQuality((e.target as HTMLSelectElement).value);
try{const s=JSON.parse(localStorage.getItem('dreamhome-settings')||'{}');night=!!s.night;third=!!s.third;quality=['low','balanced','high'].includes(s.quality)?s.quality:'balanced';}catch{}
setTime(night);setQuality(quality);$<HTMLSelectElement>('quality').value=quality;$('camera').textContent=third?'Third person':'First person';
window.addEventListener('keydown',e=>{if(e.target instanceof HTMLSelectElement||e.target instanceof HTMLInputElement)return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(!started)return;keys.add(e.code);if(e.repeat)return;if(e.code==='KeyE')interact();if(e.code==='KeyL')lights();if(e.code==='KeyV')setCamera();if(e.code==='KeyN')setTime(!night);if(e.code==='KeyM')toggleMap();if(e.code==='KeyR')go('foyer');});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>keys.clear());
document.addEventListener('pointerlockchange',()=>{keys.clear();});
canvas.addEventListener('pointerdown',e=>{if(!started)return;if(e.pointerType==='mouse'&&document.pointerLockElement!==canvas){canvas.requestPointerLock()?.catch(()=>{});}drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
window.addEventListener('pointerup',()=>drag=false);window.addEventListener('pointermove',e=>{if(!started)return;let dx=0,dy=0;if(document.pointerLockElement===canvas){dx=e.movementX;dy=e.movementY;}else if(drag){dx=e.clientX-lastX;dy=e.clientY-lastY;}yaw+=dx*.0025;pitch=Math.max(-1.25,Math.min(1.25,pitch+dy*.0022));lastX=e.clientX;lastY=e.clientY;});
document.querySelectorAll<HTMLButtonElement>('[data-key]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key!);};b.onpointerup=()=>keys.delete(b.dataset.key!);b.onpointercancel=()=>keys.delete(b.dataset.key!);});
window.addEventListener('resize',()=>engine.resize());
let tick=0;
engine.runRenderLoop(()=>{
 const dt=Math.min(engine.getDeltaTime()/1000,.05);elapsed+=dt;
 if(!started){if(!designView)overview.alpha+=dt*.025;}
 else {
  const forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0);const side=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);
  const speed=(keys.has('ShiftLeft')?4.8:2.7)*dt/Math.max(1,Math.hypot(forward,side));const dx=(Math.sin(yaw)*forward+Math.cos(yaw)*side)*speed,dz=(Math.cos(yaw)*forward-Math.sin(yaw)*side)*speed;
  const nx=player.x+dx,nz=player.z+dz;if(Math.abs(nx)<SITE_SIDE/2-.35&&!blocked(nx,player.z,player.y,world.obstacles))player.x=nx;if(Math.abs(nz)<SITE_SIDE/2-.35&&!blocked(player.x,nz,player.y,world.obstacles))player.z=nz;
  const floor=groundHeight(player.x,player.z,player.y,world.surfaces);player.y=floor>=player.y?floor:Math.max(floor,player.y-dt*5);
  avatar.position.copyFrom(player);avatar.rotation.y=yaw;const walking=forward||side;limbs.forEach((l,i)=>l.rotation.x=walking?Math.sin(elapsed*9+(i<2?0:Math.PI))*.25:0);
  const eye=player.add(new Vector3(0,LEVEL.eye,0));const look=new Vector3(Math.sin(yaw)*Math.cos(pitch),-Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));
  if(third){const desired=eye.subtract(look.scale(3.4)).add(new Vector3(0,.7,0));const delta=desired.subtract(eye);const hit=scene.pickWithRay(new Ray(eye,delta.normalizeToNew(),delta.length()),m=>!!m.metadata?.solid||world.doors.some(d=>d.leaf===m));camera.position.copyFrom(hit?.hit?eye.add(delta.normalizeToNew().scale(Math.max(.25,hit.distance-.25))):desired);camera.setTarget(eye.add(look.scale(4)));}
  else{camera.position.copyFrom(eye);camera.rotation.set(pitch,yaw,0);}
  const d=nearestDoor();$('prompt').classList.toggle('hidden',!d);if(d)$('prompt').textContent=`E · ${d.open?'Close':'Open'} ${d.name}`;
 }
 world.update(dt,designView?overview.position:player);scene.render();
 if(++tick%20===0){let name='Estate gardens';const r=rooms.find(r=>Math.abs(player.y-r.floor*STOREY)<1&&Math.abs(player.x-r.x)<r.width/2&&Math.abs(player.z-r.z)<r.depth/2);if(player.y>8)name='Rooftop terrace';else if(r)name=r.name;else if(inside(player.x,player.z,ARCH.courtyard))name='Family courtyard';else if(player.z<-3)name='Arrival court';else if(player.z>22)name='Pool terrace';else if(inside(player.x,player.z,ARCH.living)||inside(player.x,player.z,ARCH.dining))name='Living & dining';else if(inside(player.x,player.z,ARCH.foyer))name='Entrance foyer';$('location').textContent=name;$('stats').textContent=`${Math.round(engine.getFps())} FPS · ${night?'Nightfall':'Daylight'} · ${quality}`;const dot=document.getElementById('mapDot')!;if(dot){dot.setAttribute('cx',String(player.x));dot.setAttribute('cy',String(-player.z));}}
});
scene.executeWhenReady(()=>{$('loading').classList.add('hidden');});
}
