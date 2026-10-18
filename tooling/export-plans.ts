import {writeFile,mkdir} from 'node:fs/promises';
import {bathrooms} from '../src/bathroomPlan';
import {bathroomSchedule} from '../src/bathroomAudit';
import {floorPlanSvg,sitePlanSvg,bathroomPlanSvg} from '../src/diagrams';
await mkdir('docs/views',{recursive:true});
await Promise.all([
 writeFile('docs/views/ground-plan.svg',floorPlanSvg(0)),
 writeFile('docs/views/upper-plan.svg',floorPlanSvg(1)),
 writeFile('docs/views/site-plan.svg',sitePlanSvg())
]);

await mkdir('docs/views/bathrooms',{recursive:true});
await Promise.all([...bathrooms.map(b=>writeFile('docs/views/bathrooms/'+b.id+'-plan.svg',bathroomPlanSvg(b))),writeFile('docs/views/bathrooms/schedule.json',JSON.stringify(bathroomSchedule(),null,2))]);
