import {SITE,LEVEL,approachStairs,rooms,roomRect,ensuiteRect,ARCH,STOREY,SITE_SIDE,balconies,stairs,groundPlates,upperPlates,bounds,type Rect} from './plan';
import {ENVELOPE,sideWalls} from './facades';
const rect=(r:Rect,fill:string,stroke='#918d83',width=.1)=>`<rect x="${r.x-r.w/2}" y="${-r.z-r.d/2}" width="${r.w}" height="${r.d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
const label=(x:number,z:number,text:string,size=.6,color='#343d37')=>`<text x="${x}" y="${-z}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${size}" fill="${color}">${text}</text>`;
const opening=(x:number,z:number,width:number,along:'x'|'z')=>`<path d="M ${x} ${-z} ${along==='x'?'h':'v'} ${along==='x'?width:-width}" stroke="#f4f1e9" stroke-width=".3"/>`;
export function floorPlanSvg(floor:number){
 const parts=[`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-17 -26 36 39" role="img" aria-label="${floor?'Upper':'Ground'} floor plan; rear garden at top"><rect x="-17" y="-26" width="36" height="39" fill="#f4f1e9"/>`];
 for(const r of floor?upperPlates:groundPlates)parts.push(rect(r,'#e2dbcb','#e2dbcb',0));
 for(const r of rooms.filter(r=>r.floor===floor)){
  parts.push(rect(roomRect(r),r.master?'#e1d3bc':'#eeeadf'));
  const lx=r.id==='suite-3'?r.x+1.35:r.x,title=r.kind==='gym'?'GYM':r.name.replace('Bedroom suite','Suite').replace('Garden suite','Suite');
  parts.push(label(lx,r.master?16:r.z+.4,title,.57),label(lx,r.master?15:r.z-.55,`${r.width} × ${r.depth} m`,.45));
  if(r.ensuite){const b=ensuiteRect(r);parts.push(rect(b,'#dae5e3'),label(b.x,b.z,'BATH',.42),opening(b.x-.85,b.z-b.d/2,1.2,'x'));}
  if(!r.open)parts.push(opening(r.entry.x,r.entry.z,r.entry.width,r.entry.along));
  else parts.push(opening(r.x-r.width/2,r.z-r.depth/2,r.depth,'z'));
  if(r.id==='lounge')parts.push(opening(10.65,3.6,1.2,'x'));
 }
 parts.push(rect(ARCH.courtyard,'#b7c5a4'),label(11.25,8,'FAMILY COURT',.42),label(11.25,7,'4.5 × 5 m',.42));
 if(floor){for(const [name,r] of [['WEST LOGGIA',ENVELOPE.westLoggia],['EAST LOGGIA',ENVELOPE.eastLoggia]] as const)parts.push(rect(r,'#d3c3a5'),label(r.x,r.z,name,.28));for(const face of sideWalls)for(const o of face.openings)if(o.door)parts.push(opening(face.x,o.at-o.width/2,o.width,'z'));parts.push(rect(ARCH.livingVoid,'#cfdddd'),label(4.5,6,'DOUBLE-HEIGHT VOID',.6),label(4.5,12,'FURNISHED OVERLOOK',.48),rect(ARCH.wardrobe,'#cbbda2'),label(ARCH.wardrobe.x,ARCH.wardrobe.z,'WALK-IN CLOSET',.42),rect(ARCH.rearTerrace,'#d3c3a5'),label(4.5,17,'RECESSED GARDEN TERRACE',.44));for(const b of balconies)parts.push(rect(b,'#d3c3a5'),label(b.x,b.z,'BALCONY',.45));}
 else{
  parts.push(label(4.5,6,'DOUBLE-HEIGHT LIVING',.57),label(4.5,15.5,'DINING',.65),label(4.5,-2,'FOYER',.55),rect(ARCH.pantry,'#cfc6b4'),label(ARCH.pantry.x,ARCH.pantry.z,'PANTRY',.42),rect(ARCH.powder,'#dae5e3'),label(ARCH.powder.x,ARCH.powder.z,'WC',.4));
  parts.push(`<path d="M 5.5 10.4 L 5.5 -2 L 6.5 -2 L 6.5 -18 M 6.5 -11.3 H 12" fill="none" stroke="#986e3e" stroke-width=".12" stroke-dasharray=".3 .2"/>`);
 }
 // Major partitions and openings clarify the protected private hall and open social plan.
 parts.push(rect(bounds(-.12,.12,floor?1:-5,20),'#918d83','#918d83',0),opening(0,floor?11.45:13.35,1.5,'z'));
 if(floor){parts.push(opening(-7,12.15,1.3,'z'),opening(4.6,14,2.4,'x'),label(11.25,4.25,'COURT ALCOVE',.25));for(const b of balconies)parts.push(opening(b.x+(b.x<0?2:-2)-1.1,20,2.2,'x'));}
 else parts.push(opening(ENVELOPE.foyerPortal.x,ENVELOPE.foyerPortal.z-ENVELOPE.foyerPortal.width/2,ENVELOPE.foyerPortal.width,'z'),rect(bounds(-2,0,2.58,2.82),'#918d83','#918d83',0),opening(-1.7,2.7,1.4,'x'),opening(14.35,16.5,1.2,'x'),opening(-9.5,-4.55,1.1,'z'),opening(9,5.7,1.6,'z'),opening(10,10,1.6,'x'),opening(SITE.entrance.x-SITE.entrance.width/2,SITE.entrance.z,SITE.entrance.width,'x'),opening(5.3,20,2.4,'x'));
 if(!floor){const s=approachStairs[0];parts.push(rect(SITE.veranda,'#d3c3a5'),rect(s,'#d3c3a5'));for(let i=1;i<s.steps;i++)parts.push(`<path d="M ${s.x-s.w/2} ${-(s.z-s.d/2+i*s.d/s.steps)} h ${s.w}" stroke="#827c71" stroke-width=".06"/>`);}
 else {for(const r of [SITE.frontBalcony,SITE.leftBalcony])parts.push(rect(r,'#d3c3a5'),label(r.x,r.z,'BALCONY',.4));parts.push(opening(4.2,-3,2.6,'x'),opening(-8,-3,1.4,'x'));}
 for(const s of stairs.filter(s=>s.level===0)){
  parts.push(rect(s,'#c2bfb5'));
  for(let i=1;i<s.steps;i++)parts.push(`<path d="M ${s.x-s.w/2} ${-(s.z-s.d/2+i*s.d/s.steps)} h ${s.w}" stroke="#827c71" stroke-width=".06"/>`);
  parts.push(label(s.x,s.z,s.direction===1?'↑':'↓',.75));
 }
 parts.push(label(-4,-4.6,floor?'STAIR / ROOF ACCESS':'RETURN STAIR',.36),label(-1,8,'PRIVATE',.3),label(-1,7.2,'HALL',.3));
 parts.push(label(2,25,'PROTECTED REAR GARDEN',.6),label(3,-11.5,floor?'INSET FRONT BALCONIES':'RAISED VERANDA · FIVE SHALLOW STEPS',.45),label(2,-12.5,`${floor?'UPPER':'GROUND'} · ${(floor*STOREY).toFixed(1)} m`,.7));
 parts.push(`<path d="M -13 -24 h 5 m -5 -.2 v .4 m 5 -.4 v .4" stroke="#343d37" stroke-width=".1"/>`,label(-10.5,23,'5 m',.4),'</svg>');return parts.join('');
}
export function sitePlanSvg(){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-34 -34 68 68" role="img" aria-label="Provisional square-acre site plan; front south at bottom; garage doors face west">
${rect({x:0,z:0,w:SITE_SIDE,d:SITE_SIDE},'#bac3a7','#52674f',.5)}
${[SITE.forecourt,SITE.garageApron,SITE.gateApproach].map(r=>rect(r,'#c9bc9f','#c9bc9f',0)).join('')}
${groundPlates.map(r=>rect(r,'#e9e6db','#e9e6db',0)).join('')}${rect(ARCH.courtyard,'#9bb586')}
${rect(approachStairs[0],'#c5b38d')}${rect(SITE.garage,'#e2ddd1')}
${SITE.garageBayCentres.map(z=>`<path d="M 17 ${-z} h 10 m -1 -1 l 1 1 l -1 1 M 21 ${-z-1.7} v 3.4" fill="none" stroke="#6d5839" stroke-width=".18"/>`).join('')}
${rect({x:-5,z:28,w:11.5,d:4},'#659c9b')}${rect({x:13,z:26,w:7,d:7},'#938774')}
${label(25.5,-4.4,'GARAGE · WEST DOORS',.72)}${label(-5,28,'POOL',1)}${label(13,26,'GAZEBO',1)}
${label(0,-21,'OPEN PAVED ARRIVAL COURT',1)}${label(0,-23,`EXTERIOR ${LEVEL.site.toFixed(2)} m`,.7)}${label(0,-30,'SOUTH / FRONT · SEPARATE GATES',.7)}${label(-27,0,'WEST',.8)}${label(27,0,'EAST',.8)}
<circle id="mapDot" cx="5.5" cy="16" r=".8" fill="#edbd71" stroke="#273b2a" stroke-width=".3"/></svg>`;}
