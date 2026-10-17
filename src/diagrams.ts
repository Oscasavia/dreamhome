import {rooms,roomRect,roomEntry,ensuiteRect,ARCH,STOREY,SITE_SIDE,balconies,galleries,stairs,type Rect} from './plan';
const rect=(r:Rect,fill:string,stroke='#908777',width=.12)=>`<rect x="${r.x-r.w/2}" y="${-r.z-r.d/2}" width="${r.w}" height="${r.d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
const label=(x:number,z:number,text:string,size=.65,color='#343d37')=>`<text x="${x}" y="${-z}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${size}" fill="${color}">${text}</text>`;
export function floorPlanSvg(floor:number){
 const parts=[`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-19 -28 38 36" role="img" aria-label="${floor?'Upper':'Ground'} floor concept plan; rear garden at top"><rect x="-19" y="-28" width="38" height="36" fill="#f4f1e9"/>`];
 for(const g of galleries)parts.push(rect(g,'#e3d7ba'));
 parts.push(rect(ARCH.foyer,'#e3d7ba'),rect(ARCH.living,'#e3d7ba'),rect(ARCH.courtyard,'#bdc9a7'));
 parts.push(label(0,11,'OPEN COURTYARD',.65),label(0,9.8,'10 × 8 m · open sky',.5));
 if(floor){
  parts.push(rect(ARCH.livingVoid,'#d2dedc'),label(0,18,'LIVING VOID',.65),label(0,17,'look down to ground',.5),label(0,14.65,'OVERLOOK',.45));
  for(const b of balconies)parts.push(rect(b,'#e3d7ba'),label(b.x,b.z,'SHELTERED BALCONY',.5));
  parts.push(rect({x:10.5,z:-1,w:7,d:2},'#d6c7af'),label(10.5,-1.2,'SCREENED LOGGIA',.45));
 }else parts.push(label(-1,18,'DOUBLE-HEIGHT',.6),label(-1,17,'LIVING / DINING',.6));
 for(const r of rooms.filter(r=>r.floor===floor)){
  parts.push(rect(roomRect(r),r.master?'#ded1b7':'#eee8da'));
  const name=r.name.replace('Bedroom suite','Suite').replace('Garden suite','Suite').replace('Kitchen & breakfast','Kitchen / breakfast').replace('Recessed upper lounge','Upper lounge');
  parts.push(label(r.x,r.master?16:r.z,name,.6),label(r.x,r.master?14.9:r.z-1,`${r.width} × ${r.depth} m`,.48));
  if(r.ensuite){const b=ensuiteRect(r);parts.push(rect(b,'#dce8e3'),label(b.x,b.z,'BATH',.45));}
  const e=roomEntry(r);parts.push(`<path d="M ${e.x} ${-e.z} v ${-e.width}" stroke="#f4f1e9" stroke-width=".28"/><path d="M ${e.x} ${-e.z} h ${Math.sign(r.x)*e.width}" stroke="#8c7052" stroke-width=".1"/>`);
 }
 if(floor)parts.push(rect(ARCH.wardrobe,'#cbb89b'),label(ARCH.wardrobe.x,ARCH.wardrobe.z,'WALK-IN CLOSET',.55));
 else parts.push(rect({x:-3.7,z:-1.45,w:2.4,d:2.7},'#dce8e3'),label(-3.7,-1.45,'WC',.5));
 for(const [i,s] of stairs.entries()){
  parts.push(rect(s,'#c9c3b5'));
  for(let n=1;n<24;n++)parts.push(`<path d="M ${s.x-s.w/2+n*s.w/24} ${-s.z-s.d/2} v ${s.d}" stroke="#928775" stroke-width=".045"/>`);
  parts.push(label(s.x,s.z-.2,i?(floor?'UP TO ROOF →':'ROOF STAIR ABOVE'):(floor?'FROM GROUND →':'UP TO GALLERY →'),.42));
 }
 parts.push(label(0,-4.6,'SHELTERED ENTRANCE',.5),label(0,27,'REAR GARDEN',.6),label(0,-7,`${floor?'UPPER':'GROUND'} · ${(floor*STOREY).toFixed(1)} m datum`,.7));
 parts.push(`<path d="M -17  -25 h 5 m -5 -.2 v .4 m 5 -.4 v .4" stroke="#343d37" stroke-width=".1"/>`,label(-14.5,24,'5 m',.45),'</svg>');
 return parts.join('');
}
export function sitePlanSvg(){
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-34 -34 68 68" role="img" aria-label="Estate plan; rear garden at top">${rect({x:0,z:0,w:SITE_SIDE,d:SITE_SIDE},'#bac3a7','#52674f',.5)}${rect({x:0,z:-25,w:7,d:14},'#7b8074')}
 <circle cx="0" cy="15" r="9" fill="#7b8074"/><circle cx="0" cy="15" r="3.5" fill="#9ba982"/>${rect({x:15,z:-12,w:20,d:6},'#7b8074')}
 ${rooms.filter(r=>!r.floor).map(r=>rect(roomRect(r),'#e9e6db')).join('')}${galleries.map(r=>rect(r,'#e9e6db')).join('')}${rect(ARCH.foyer,'#e9e6db')}${rect(ARCH.living,'#e9e6db')}${rect(ARCH.courtyard,'#a6b68f')}
 ${rect({x:23,z:0,w:12,d:9},'#e2ddd1')}${rect({x:-5,z:28,w:11.5,d:4},'#659c9b')}${rect({x:13,z:26,w:7,d:7},'#938774')}
 ${label(0,10,'COURTYARD',1.2)}${label(23,0,'GARAGE',1)}${label(-5,28,'POOL',1)}${label(13,26,'GAZEBO',1)}${label(0,-15,'ARRIVAL',1)}
 <circle id="mapDot" cx="7.2" cy="23" r=".8" fill="#edbd71" stroke="#273b2a" stroke-width=".3"/></svg>`;
}
