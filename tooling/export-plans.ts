import {writeFile,mkdir} from 'node:fs/promises';
import {floorPlanSvg,sitePlanSvg} from '../src/diagrams';
await mkdir('docs/views',{recursive:true});
await Promise.all([
 writeFile('docs/views/ground-plan.svg',floorPlanSvg(0)),
 writeFile('docs/views/upper-plan.svg',floorPlanSvg(1)),
 writeFile('docs/views/site-plan.svg',sitePlanSvg())
]);
