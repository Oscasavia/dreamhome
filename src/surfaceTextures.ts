import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {Color3} from '@babylonjs/core/Maths/math.color';
import type {Scene} from '@babylonjs/core/scene';

// Small deterministic, locally authored textures. Box UVs use metres / 3, including slab tops.
export function surfaceTexture(scene:Scene,m:StandardMaterial,kind:'travertine'|'floor'|'wood'|'grass'|'paver'){
 const size=512,t=new DynamicTexture(m.name+' surface',{width:size,height:size},scene,true),c=t.getContext();
 let seed=71;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const base=m.diffuseColor;
 c.fillStyle=base.toHexString();c.fillRect(0,0,size,size);
 if(kind==='paver'||kind==='travertine'){
  const cols=kind==='paver'?8:4,rows=kind==='paver'?16:6,bw=size/cols,bh=size/rows;
  for(let row=0;row<rows;row++)for(let col=-1;col<=cols;col++){
   const variation=.94+rand()*.12;
   c.fillStyle=base.scale(variation).toHexString();c.fillRect(col*bw+(row%2)*bw/2,row*bh,bw,bh);
   c.strokeStyle=kind==='paver'?'rgba(68,57,42,.28)':'rgba(125,107,79,.16)';c.lineWidth=kind==='paver'?1.8:1;
   c.strokeRect(col*bw+(row%2)*bw/2,row*bh,bw,bh);
  }
 }
 for(let i=0;i<13000;i++){
  c.fillStyle=rand()>.5?'rgba(255,255,255,.09)':'rgba(56,43,24,.055)';
  c.fillRect(rand()*size,rand()*size,kind==='wood'?.5:1+rand()*2,kind==='wood'?15+rand()*100:.4+rand()*2);
 }
 if(kind==='travertine')for(let i=0;i<220;i++){
  c.fillStyle='rgba(146,121,85,.08)';c.fillRect(rand()*size,rand()*size,3+rand()*20,.5+rand()*2);
 }
 t.wrapU=1;t.wrapV=1;t.update();t.uScale=kind==='grass'?8:1;t.vScale=kind==='grass'?8:1;
 m.diffuseTexture=t;m.diffuseColor=Color3.White();return t;
}
