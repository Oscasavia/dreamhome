import {Scene} from '@babylonjs/core/scene';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture';
import {Color3} from '@babylonjs/core/Maths/math.color';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {surfaceTexture} from './surfaceTextures';
import {LEVEL,ARCH,disjoint,type Obstacle} from './plan';
import {SOCIAL,diningSeats,islandSeats,seatPosition,type Seat} from './interiorPlan';
import type {LightZone} from './world';

export function socialMaterials(scene:Scene,headless:boolean){
 const mat=(name:string,color:string,spec=.06)=>{const m=new StandardMaterial(name,scene);m.diffuseColor=Color3.FromHexString(color);m.specularColor.set(spec,spec,spec);m.specularPower=64;return m;};
 const m={porcelain:mat('Social ivory porcelain','#ded9ce',.11),marble:mat('Warm white veined marble','#e8e4da',.18),walnut:mat('Interior quarter-cut walnut','#79583d'),cream:mat('Cream woven upholstery','#e4ddce'),taupe:mat('Taupe upholstery','#a99b87'),bronze:mat('Champagne bronze','#9e8762',.38),dark:mat('Interior dark bronze','#302d27',.18),rug:mat('Woven wool rug','#c6baa5'),ceiling:mat('Social warm white ceiling','#eeeae0',0),screen:mat('TV and appliance glass','#111b20',.35)};
 if(!headless){
  surfaceTexture(scene,m.walnut,'wood');
  for(const [material,kind] of [[m.porcelain,'tile'],[m.marble,'marble'],[m.rug,'weave'],[m.cream,'weave'],[m.taupe,'weave']] as const){
   const size=kind==='marble'?1024:512,t=new DynamicTexture(material.name+' authored surface',{width:size,height:size},scene,true),c=t.getContext() as CanvasRenderingContext2D;
   let seed=113;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
   c.fillStyle=material.diffuseColor.toHexString();c.fillRect(0,0,size,size);
   for(let i=0;i<18000;i++){c.fillStyle=rand()>.5?'rgba(255,255,255,.045)':'rgba(66,52,36,.025)';c.fillRect(rand()*size,rand()*size,kind==='weave'?4:2,1);}
   if(kind==='tile'){
    // A 6 m repeat holds five 1.2 m tiles; fine joints, no extra floor meshes.
    c.strokeStyle='rgba(112,104,91,.18)';c.lineWidth=.7;
    for(let i=0;i<=5;i++){c.beginPath();c.moveTo(i*size/5,0);c.lineTo(i*size/5,size);c.moveTo(0,i*size/5);c.lineTo(size,i*size/5);c.stroke();}
   }
   if(kind==='marble'){
    // Sparse branching veins across an 8 m field; no high-contrast tiny repeated marble tiles.
    for(let vein=0;vein<14;vein++){
     const start=rand()*size*1.3-size*.15,points:number[][]=[];
     for(let i=0;i<=28;i++){const y=i*size/28,x=start+y*.34+Math.sin(i*.6+vein)*12+Math.sin(i*1.8+vein)*3;points.push([x,y]);}
     for(const [width,alpha] of [[8,.025],[2,.10],[.7,.22]]){c.strokeStyle=vein%4===0?`rgba(151,123,87,${alpha})`:`rgba(104,109,105,${alpha})`;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
     if(vein%2===0){const [x,y]=points[12];c.strokeStyle='rgba(119,118,107,.12)';c.lineWidth=.7;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x-20,y+50,x-70,y+90,x-110,y+160);c.stroke();}
    }
   }
   t.wrapU=1;t.wrapV=1;t.uScale=t.vScale=kind==='marble'?3/8:kind==='tile'?.5:3;t.update();material.diffuseTexture=t;material.diffuseColor=Color3.White();
  }
 }
 return m;
}
type Materials=ReturnType<typeof socialMaterials>;
interface Context {
 scene:Scene;obstacles:Obstacle[];castShadow:(mesh:Mesh)=>void;
 box:(name:string,x:number,y:number,z:number,w:number,h:number,d:number,m:StandardMaterial,solid?:boolean,shadow?:boolean)=>Mesh;
 cylinder:(name:string,x:number,y:number,z:number,d:number,h:number,m:StandardMaterial,top?:number)=>Mesh;
 zone:(name:string,x:number,y:number,z:number,w:number,d:number,ceiling?:boolean)=>LightZone;
}

export function furnishSocial(c:Context,m:Materials){
 const {scene,box,cylinder,zone,obstacles}=c;
 // Bevelled upholstery, cached by dimensions; static batching still consolidates the final meshes.
 const shapes=new Map<string,Mesh>();
 function soft(name:string,x:number,y:number,z:number,w:number,h:number,d:number,r:number,material:StandardMaterial,yaw=0){
  const key=[w,h,d,r].join('/');let mesh:Mesh;
  if(shapes.has(key))mesh=shapes.get(key)!.clone(name)!;
  else{
   mesh=new Mesh(name,scene);const half=[w/2,h/2,d/2],positions:number[]=[],normals:number[]=[],indices:number[]=[],uvs:number[]=[];
   for(const [axis,sign,u,v] of [[0,1,1,2],[0,-1,2,1],[1,1,2,0],[1,-1,0,2],[2,1,0,1],[2,-1,1,0]]){
    const range=(a:number)=>[-half[a],-half[a]+r*.3,-half[a]+r,half[a]-r,half[a]-r*.3,half[a]],us=range(u),vs=range(v),offset=positions.length/3;
    for(let j=0;j<6;j++)for(let i=0;i<6;i++){
     const p=[0,0,0];p[axis]=sign*half[axis];p[u]=us[i];p[v]=vs[j];const q=p.map((n,a)=>Math.max(-half[a]+r,Math.min(half[a]-r,n))),n=Vector3.FromArray(p.map((n,a)=>n-q[a])).normalize();
     positions.push(q[0]+n.x*r,q[1]+n.y*r,q[2]+n.z*r);normals.push(n.x,n.y,n.z);uvs.push(p[u],p[v]);
     if(i<5&&j<5){const a=offset+j*6+i;indices.push(a,a+7,a+1,a,a+6,a+7);}
    }
   }
   const data=new VertexData();data.positions=positions;data.normals=normals;data.indices=indices;data.uvs=uvs;data.applyToMesh(mesh);shapes.set(key,mesh);
  }
  mesh.position.set(x,y,z);mesh.rotation.y=yaw;mesh.material=material;mesh.receiveShadows=true;mesh.isPickable=true;mesh.metadata={solid:true};c.castShadow(mesh);return mesh;
 }
 const obstacle=(name:string,x:number,z:number,w:number,d:number,top:number,bottom=0)=>obstacles.push({name,x,z,w,d,bottom,top});
 const living=zone('Double-height living',3.5,0,11.5,6,14,false);
 living.light.position.set(3.4,4.5,11.5);living.light.range=14;
 const dining=zone('Dining',SOCIAL.dining.x,0,SOCIAL.dining.z,3.5,5.8,false),kitchen=zone('Kitchen',13.7,0,13.3,6,6,false);
 const led=living.material;
 // The living finish touches the structural roof underside; there is no one-storey ceiling over the void.
 const voidRect=ARCH.livingVoid;
 box('Living ceiling finish',voidRect.x,SOCIAL.ceiling-.01,voidRect.z,voidRect.w,.02,voidRect.d,m.ceiling);
 for(const side of [-1,1]){
  box('Living roof cove',voidRect.x+side*(voidRect.w/2-.24),SOCIAL.ceiling-.05,voidRect.z,.035,.025,voidRect.d-.5,led);
  box('Living roof cove',voidRect.x,SOCIAL.ceiling-.05,voidRect.z+side*(voidRect.d/2-.25),voidRect.w-.5,.025,.035,led);
 }
 for(const x of [1.2,5.4])for(const z of [3,7,11,15])cylinder('Living recessed downlight',x,SOCIAL.ceiling-.025,z,.095,.02,led);
 for(const r of disjoint([ARCH.living,ARCH.dining,ARCH.kitchen],[ARCH.livingVoid]))box('Lower social ceiling finish',r.x,SOCIAL.lowCeiling-.012,r.z,r.w,.024,r.d,m.ceiling);
 box('Warm plaster media spine finish',.17,SOCIAL.ceiling/2,ARCH.livingVoid.z,.035,SOCIAL.ceiling,ARCH.livingVoid.d,m.ceiling);
 // Two-storey porcelain slabs and walnut side panels hide neither the corridor nor its rear entry.
 const wall=SOCIAL.media,marbleStart=wall.z-wall.marbleWidth/2;
 box('Media shadow backing',wall.x,.5*SOCIAL.ceiling,wall.z,.12,SOCIAL.ceiling,wall.width,m.dark);
 for(let col=0;col<3;col++)for(let row=0;row<4;row++){
  const width=wall.marbleWidth/3-.012,height=SOCIAL.ceiling/4-.012;
  box('Full-height marble media slab',wall.x+.08,(row+.5)*SOCIAL.ceiling/4,marbleStart+(col+.5)*wall.marbleWidth/3,.07,height,width,m.marble);
 }
 for(const side of [-1,1]){
  const z=wall.z+side*(wall.marbleWidth/2+.55);
  box('Tall walnut media panel',wall.x+.06,SOCIAL.ceiling/2,z,.08,SOCIAL.ceiling,1.05,m.walnut);
  for(let i=-4;i<=4;i++)box('Walnut fine vertical joint',wall.x+.105,SOCIAL.ceiling/2,z+i*.11,.014,SOCIAL.ceiling,.009,m.dark);
  box('Media concealed vertical wash',wall.x+.13,SOCIAL.ceiling/2,wall.z+side*(wall.marbleWidth/2+.025),.025,SOCIAL.ceiling-.14,.018,led);
 }
 box('Floating walnut media console',.69,.38,wall.z,.82,.26,4.65,m.walnut,true,true);
 box('Media console shadow base',.65,.24,wall.z,.6,.04,4.4,m.dark);
 box('Linear fireplace recess',.34,.77,wall.z,.08,.35,3.4,m.screen);
 const fire=new StandardMaterial('Warm fireplace ribbon',scene);fire.diffuseColor.set(.5,.15,.025);fire.emissiveColor.set(.8,.25,.035);fire.disableLighting=true;
 box('Fireplace ember line',.39,.65,wall.z,.03,.025,3.15,fire);
 for(let i=0;i<19;i++){const f=cylinder('Small flame',.395,.7,wall.z-1.45+i*.16,.055,.08+(i%4)*.025,fire,0);f.scaling.x=.4;}
 box('TV slim bezel',.35,wall.tvCentre,wall.z,.09,wall.tvHeight+.07,wall.tvWidth+.07,m.dark);
 box('TV seated-height screen',.403,wall.tvCentre,wall.z,.013,wall.tvHeight,wall.tvWidth,m.screen);
 // Continuous satin porcelain is assigned to the existing slabs, never placed above them as another surface.
 const rug=SOCIAL.rug;box('Living wool rug',rug.x,LEVEL.finish+.006,rug.z,rug.w,.012,rug.d,m.rug);
 const sofa=SOCIAL.sofa;
 obstacle('Living sofa',sofa.x,sofa.z,sofa.w,sofa.d,1.02);
 soft('Living sofa plinth',sofa.x,.19,sofa.z,sofa.w,.26,sofa.d,.07,m.walnut);
 soft('Living sofa upholstered base',sofa.x,.35,sofa.z,sofa.w,.32,sofa.d,.1,m.cream);
 soft('Living sofa tall back',sofa.x+.43,.75,sofa.z,.25,.68,sofa.d,.1,m.cream);
 for(let i=0;i<4;i++){
  const z=sofa.z+(i-1.5)*.9;soft('Living sofa seat',sofa.x-.1,.56,z,.82,.23,.86,.09,m.cream);
  const p=soft('Living sofa loose cushion',sofa.x+.19,.86,z,.25,.52,.72,.1,i%2?m.taupe:m.cream);p.rotation.z=-.12;
 }
 for(const sign of [-1,1])soft('Living sofa arm',sofa.x,.69,sofa.z+sign*(sofa.d/2-.12),sofa.w,.38,.24,.09,m.cream);
 const chaise=SOCIAL.chaise;obstacle('Living chaise',chaise.x,chaise.z,chaise.w,chaise.d,.64);
 soft('Chaise upholstered base',chaise.x,.35,chaise.z,chaise.w,.32,chaise.d,.09,m.cream);
 soft('Chaise cushion',chaise.x,.56,chaise.z,chaise.w-.08,.22,chaise.d-.1,.09,m.cream);
 const coffee=SOCIAL.coffee;obstacle('Living coffee table',coffee.x,coffee.z,coffee.w,coffee.d,.38);
 soft('Low walnut coffee table',coffee.x,.33,coffee.z,coffee.w,.1,coffee.d,.045,m.walnut);
 box('Coffee table recessed pedestal',coffee.x,.16,coffee.z,.8,.28,1.5,m.walnut);
 box('Coffee table book',coffee.x,.405,coffee.z-.5,.5,.05,.36,m.ceiling);
 cylinder('Coffee table ceramic bowl',coffee.x,.42,coffee.z+.5,.38,.12,m.taupe,.5);
 // The table and island run parallel, with dining physically between island and living seating.
 const table=SOCIAL.dining;
 obstacle('Dining table',table.x,table.z,table.w,table.d,table.height);
 soft('Dining walnut slab',table.x,table.height-.045,table.z,table.w,.09,table.d,.04,m.walnut);
 for(const z of [-1.1,1.1])box('Dining bronze trestle',table.x,.34,table.z+z,.7,.68,.09,m.bronze);
 cylinder('Dining ceramic centrepiece',table.x,.81,table.z,.38,.12,m.ceiling,.5);
 function seat(s:Seat){
  const p=seatPosition(s),height=s.kind==='chair'?.46:.65,w=s.kind==='chair'?.59:.54,d=.58;
  const local=(x:number,z:number)=>({x:p.x+x*Math.cos(s.yaw)+z*Math.sin(s.yaw),z:p.z-x*Math.sin(s.yaw)+z*Math.cos(s.yaw)});
  obstacle(s.kind==='chair'?'Dining chair':'Counter stool',p.x,p.z,Math.abs(Math.cos(s.yaw))*w+Math.abs(Math.sin(s.yaw))*d,Math.abs(Math.sin(s.yaw))*w+Math.abs(Math.cos(s.yaw))*d,height+.46);
  soft('Upholstered '+s.kind+' seat',p.x,height,p.z,w,.13,d,.055,m.taupe,s.yaw);
  const back=local(0,-.24);soft('Upholstered '+s.kind+' back',back.x,height+.25,back.z,w,.43,.13,.055,m.taupe,s.yaw);
  for(const x of [-.22,.22])for(const z of [-.21,.21]){const q=local(x,z);cylinder('Bronze chair leg',q.x,height/2-.025,q.z,.028,height-.05,m.bronze);}
  if(s.kind==='stool'){const q=local(0,.18);const foot=box('Stool footrest',q.x,.25,q.z,w-.1,.025,.025,m.bronze);foot.rotation.y=s.yaw;}
 }
 diningSeats.forEach(seat);islandSeats.forEach(seat);
 const island=SOCIAL.island,low=island.z-island.d/2,high=island.z+island.d/2;
 obstacle('Waterfall kitchen island',island.x,island.z,island.w,island.d,island.height);
 box('Island recessed toe kick',island.x+.13,.08,island.z,island.w-island.overhang-.12,.16,island.d-.16,m.dark);
 box('Island warm wood cabinetry',island.x+island.overhang/2,.49,island.z,island.w-island.overhang,.78,island.d-.13,m.walnut,false,true);
 // Unfold the marble coordinates over each short end: a continuous field across the slab and down its waterfalls.
 function islandStone(name:string,x:number,y:number,z:number,w:number,h:number,d:number,end=0){
  const mesh=box(name,x,y,z,w,h,d,m.marble,false,true),pos=mesh.getVerticesData('position')!,normals=mesh.getVerticesData('normal')!,uv:number[]=[];
  for(let i=0;i<pos.length;i+=3){const px=pos[i]+x,py=pos[i+1]+y,pz=pos[i+2]+z;
   const fold=end||(Math.abs(normals[i+2])>.5?Math.sign(normals[i+2]):0);
   uv.push((fold?(fold<0?low:high)+fold*(island.height-py):pz)/3,px/3);}
  mesh.setVerticesData('uv',uv);return mesh;
 }
 islandStone('Marble island countertop',island.x,island.height-island.edge/2,island.z,island.w,island.edge,island.d);
 for(const sign of [-1,1])islandStone('Marble waterfall end',island.x,(island.height-island.edge)/2,sign<0?low+island.edge/2:high-island.edge/2,island.w,island.height-island.edge,island.edge,sign);
 for(let i=0;i<5;i++){
  const z=low+.12+(i+.5)*(island.d-.24)/5;
  box('Island working cabinet front',island.x+island.w/2+.002,.51,z,.025,.69,(island.d-.24)/5-.018,m.walnut);
  box('Island recessed cabinet pull',island.x+island.w/2+.018,.84,z,.028,.018,.48,m.dark);
 }
 // Working wall: sink and prep in front of the existing window, cooking to its south, tall appliances to its north.
 const cab=SOCIAL.cabinet;
 box('Kitchen base cabinets',cab.x,.46,cab.z,cab.w,.82,cab.d,m.walnut,true);
 box('Kitchen recessed toe kick',cab.x,.07,cab.z,cab.w-.1,.14,cab.d,m.dark);
 box('Kitchen marble worktop',cab.x,.915,cab.z,cab.w+.06,.05,cab.d,m.marble);
 for(let i=0;i<8;i++){const z=cab.z-cab.d/2+(i+.5)*cab.d/8;box('Kitchen cabinet division',cab.x-cab.w/2-.012,.48,z,.02,.72,cab.d/8-.018,m.walnut);box('Kitchen drawer pull',cab.x-cab.w/2-.027,.8,z,.03,.015,.42,m.bronze);}
 box('Marble backsplash under window',16.75,1.12,13,.035,.36,4.15,m.marble);
 box('Cooking marble backsplash',16.75,1.72,10.9,.035,1.55,1,m.marble);
 box('Integrated induction hob',16.22,.948,11,.5,.012,.72,m.screen);
 for(const z of [10.8,11.2]){const ring=MeshBuilder.CreateTorus('Induction zone',{diameter:.2,thickness:.006,tessellation:24},scene);ring.position.set(16.22,.956,z);ring.material=m.bronze;}
 box('Concealed cooker hood cabinetry',16.45,2.7,10.9,.52,.7,1,m.walnut,true);
 box('Sink dark inset',16.22,.95,13.05,.5,.018,.74,m.dark);
 box('Sink basin bottom',16.22,.955,13.05,.39,.012,.61,m.bronze);
 cylinder('Sink tap stem',16.53,1.16,13.05,.035,.42,m.bronze);
 box('Sink tap spout',16.38,1.36,13.05,.32,.035,.035,m.bronze);
 for(const [z,name] of [[15,'Built-in oven'],[15.9,'Integrated refrigerator']] as const){
  box(name+' walnut housing',16.27,1.4,z,.95,2.8,.8,m.walnut,true);
  box(name+' panel',15.78,1.4,z,.035,2.65,.76,name==='Built-in oven'?m.screen:m.walnut);
  if(name==='Built-in oven')for(const h of [1.05,1.8])box('Oven pull',15.72,h,z,.045,.025,.56,m.bronze);
  else box('Refrigerator pull',15.72,1.5,z-.24,.045,.9,.025,m.bronze);
 }
 // Secondary linear lights use existing zones; no pendant gets its own real-time point light.
 for(const [z,light] of [[table.z,dining],[island.z,kitchen]] as const){const x=light===dining?table.x:island.x,y=light===dining?2.35:2.55;
  box('Slim linear pendant',x,y,z,.055,.055,light===dining?2.8:3.2,m.bronze);
  box('Linear pendant warm diffuser',x,y-.033,z,.04,.015,light===dining?2.7:3.1,light.material);
  for(const zz of [z-1.1,z+1.1])cylinder('Pendant suspension',x,(SOCIAL.lowCeiling+y)/2,zz,.009,SOCIAL.lowCeiling-y,m.dark);
 }
 box('Kitchen under-cabinet task glow',16.14,2.33,10.95,.025,.025,1.1,kitchen.material);
 // Cascading opal pendants, all suspended from the true roof soffit, safely inside the guarded void.
 const chandelier=SOCIAL.chandelier,anchor=SOCIAL.ceiling-.055;
 const mount=cylinder('Chandelier ceiling canopy',chandelier.x,anchor,chandelier.z,1,.065,m.bronze);mount.scaling.set(chandelier.width,1,chandelier.depth);
 for(let i=0;i<chandelier.count;i++){
  const a=i*2.39996,r=Math.sqrt((i+.5)/chandelier.count),x=chandelier.x+Math.cos(a)*r*chandelier.width*.43,z=chandelier.z+Math.sin(a)*r*chandelier.depth*.43;
  const bottom=chandelier.lowest+(i%5)*.63+(i>=5?.2:0),neck=bottom+.45;
  cylinder('Chandelier fine suspension',x,(anchor+neck)/2,z,.009,anchor-neck,m.bronze);
  cylinder('Chandelier bronze pendant stem',x,neck-.16,z,.045,.32,m.bronze);
  const opal=MeshBuilder.CreateSphere('Warm opal pendant',{diameter:.22,segments:12},scene);opal.scaling.y=1.5;opal.position.set(x,bottom+.165,z);opal.material=led;opal.isPickable=false;
 }
 // A small arrival console and art sit against the solid front wall, clear of stair and door approaches.
 box('Foyer walnut console',2,.8,-4.55,2.1,.12,.42,m.walnut,true);
 for(const x of [1.1,2.9])box('Foyer bronze console leg',x,.4,-4.55,.04,.8,.32,m.bronze);
 box('Foyer artwork frame',2,2,-4.82,1.65,1.65,.045,m.bronze);
 box('Foyer artwork ivory ground',2,2,-4.79,1.57,1.57,.02,m.ceiling);
 box('Foyer artwork walnut field',1.8,2.13,-4.77,.6,.9,.015,m.walnut);
 box('Foyer artwork taupe field',2.3,1.78,-4.75,.5,.6,.015,m.taupe);
 cylinder('Foyer ceramic vase',2.65,1.02,-4.55,.2,.32,m.taupe,.13);
}
