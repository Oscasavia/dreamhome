import '@babylonjs/core/Meshes/thinInstanceMesh';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';
import {Matrix,Quaternion,Vector3} from '@babylonjs/core/Maths/math.vector';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {Color3} from '@babylonjs/core/Maths/math.color';
import type {Scene} from '@babylonjs/core/scene';

// Repeated tropical leaves share three mesh buffers. No foliage transparency or shadow maps.
// Planting is deliberately confined to beds outside all circulation and garage turning areas.
export function createLandscape(scene:Scene,grade:number){
 const material=(name:string,hex:string)=>{const m=new StandardMaterial(name,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor.set(.035,.035,.025);m.backFaceCulling=false;return m;};
 const greens=[material('Tropical deep green','#344c26'),material('Tropical young leaf','#63703a')],bark=material('Palm bark','#756044');
 const matrices:Matrix[][]=[[],[]],trunks:Matrix[]=[];
 let seed=109;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const addLeaf=(x:number,y:number,z:number,length:number,width:number,azimuth:number,tilt:number,kind=0)=>{
  matrices[kind].push(Matrix.Compose(new Vector3(width,length,length),Quaternion.RotationYawPitchRoll(azimuth,tilt,0),new Vector3(x,y,z)));
 };
 const shrub=(x:number,z:number,size:number)=>{
  for(let i=0;i<13;i++)addLeaf(x,grade+.08,z,size*(.75+random()*.4),.65*size,i*2.4,.35+(i%3)*.42,i%2);
 };
 const palm=(x:number,z:number,h:number)=>{
  trunks.push(Matrix.Compose(new Vector3(.22,h,.22),Quaternion.Identity(),new Vector3(x,grade+h/2,z)));
  for(let arm=0;arm<9;arm++){
   const a=arm*Math.PI*2/9,reach=2.9;
   // Paired curved leaflets form a feathered frond, rather than an opaque spherical crown.
   for(let i=0;i<11;i++){
    const t=(i+.7)/11,r=t*reach,yy=grade+h+.5*Math.sin(t*Math.PI)-.55*t;
    for(const side of [-1,1])addLeaf(x+Math.sin(a)*r,yy,z+Math.cos(a)*r,.85*(1-t*.65),.25,a+side*.85,1.35,arm%2);
   }
   addLeaf(x,grade+h,z,1.5,.35,a,.5,1);
  }
 };
 // Front foundation beds, kept behind the broad paved apron and away from the stair mouth.
 for(let x=-14.6;x<-1.4;x+=1.15){shrub(x,-8.2,1.25);shrub(x+.4,-9.4,.65);}
 for(let x=10.7;x<17.8;x+=1.1){shrub(x,-4.5,1.45);shrub(x,-5.8,.7);}
 for(let z=-26;z<-7;z+=1.45){shrub(-21.3,z,1.3);shrub(-22.5,z+.65,.7);}
 for(let z=-17;z<-5;z+=1.15)shrub(30.8,z,.95);
 for(let x=-27;x<28;x+=1.7){shrub(x,30.4,1.3);if(x<-4||x>8)shrub(x,-30.5,.8);}
 for(let z=-24;z<27;z+=2.6){shrub(-29.7,z,1.6);shrub(29.7,z+1,1.6);}
 for(const [x,z,h] of [[-25,-22,7],[-24,-7,7.5],[-26,10,8],[-23,25,7],[24,4,7],[27,23,8],[2,29,7.2],[-15,-10,4.8],[-1.8,-8.7,3.5],[18,-4.8,4.6],[29,-22,7]])palm(x,z,h);
 // Layered fan leaves fill protected side and rear beds without projecting into walkways.
 for(const [x,z] of [[-17,14],[-17,19],[-14,24],[21,8],[21,17],[20,25]]){shrub(x,z,1.7);shrub(x+.8,z+.7,.9);}
 const positions:number[]=[],indices:number[]=[],normals:number[]=[];
 // A folded, tapering blade bends naturally at the tip. Both sides share the same opaque material.
 for(let i=0;i<=8;i++){
  const t=i/8,w=.28*Math.sin(Math.PI*t)**.75;
  positions.push(-w,t,.32*t*t,w,t,.32*t*t,0,t,.32*t*t-.055*Math.sin(Math.PI*t));
  if(i<8){const a=i*3,b=a+3;indices.push(a,b,a+2,a+2,b,b+2,a+2,b+2,a+1,a+1,b+2,b+1);}
 }
 VertexData.ComputeNormals(positions,indices,normals);
 for(let k=0;k<2;k++){
  const mesh=new Mesh('Instanced tropical leaves '+k,scene),data=new VertexData();data.positions=positions;data.indices=indices;data.normals=normals;data.applyToMesh(mesh);
  mesh.material=greens[k];mesh.isPickable=false;mesh.receiveShadows=true;
  mesh.thinInstanceSetBuffer('matrix',new Float32Array(matrices[k].flatMap(m=>Array.from(m.asArray()))),16,true);
 }
 const trunk=MeshBuilder.CreateCylinder('Instanced palm trunks',{diameterTop:.7,diameterBottom:1,height:1,tessellation:10},scene);trunk.material=bark;trunk.isPickable=false;trunk.receiveShadows=true;
 trunk.thinInstanceSetBuffer('matrix',new Float32Array(trunks.flatMap(m=>Array.from(m.asArray()))),16,true);
}
