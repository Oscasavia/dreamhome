# Working on Dreamhome

## Preserve the user's requirements

Read `docs/DESIGN_BRIEF.md` before changing the architecture. The courtyard is **inside the house footprint**, not a detached garden. Ground level has two ensuite bedrooms; the upper level has four, including the primary. Preserve a genuine double-height living room with an upper overlook and spacious rooms. Do not fill the living void with a floor or the courtyard with a roof.

The latest redesign uses a compact 4.5 × 5 m offset internal courtyard. Preserve the short foyer → living → dining/open kitchen route, separate pantry, private bedroom hall, and separate primary dressing room. Floor plates must remain nonoverlapping, with finished datums from `LEVEL`. Decorative rugs and finishes must not become walking surfaces. The main stair has two broad flights in the front-left living void; the independent upper-to-roof pair remains in the old west bay. Both intermediate landings and visual paths must agree with movement support.

Exterior composition is authored in `src/facades.ts`; do not restore automatic identical room-by-room side windows. Preserve both accessible recessed side loggias and the broad foyer-to-cloak-lobby opening. Keep the bedroom privacy threshold beyond the stair approach and retain the living media spine.

The approved ivory-mansion image now controls the front. Preserve the raised veranda (interior 0 m, site −0.75 m), five shallow approach steps, open paved forecourt and detached garage at X 21–30 / Z −18 to −6. All three garage doors face west: cars enter along +X. Do not restore any roundabout. `SITE`, `FRONT` and `approachStairs` define these assumptions. Repeated foliage uses thin instances; exclude those meshes from static merging. Textures must explicitly repeat rather than clamp metre-based UVs.

The social interior now uses `SOCIAL` in `src/interiorPlan.ts` and reusable furniture/material components in `src/interior.ts`. Preserve the living → dining → island relationship, 4.4 m waterfall island, full-height media finish and true roof-suspended chandelier. The living void is 6.5 × 15 m, with a 2.5 m east gallery and 9 × 2 m rear overlook; the central garden terrace is now 2 m deep. Update physical geometry, door positions, destinations, diagrams and occupied-seat clearance checks together. The court remains in place. The latest user explicitly relocated the main stair into the former arrival-seating area: preserve `MAIN_STAIR`, its 1.8 m clear width between handrails, 2.5 × 2.5 m approach and upper arrival, and broad turning landing. Do not restore the removed arrival chairs/table/rug. Keep the old ground bay as a cloak lobby, its upper slab closed, and the roof stair opening/enclosure intact. See `docs/STAIR_REVIEW.md`; keep the rigid furniture-route check coordinated with any geometry changes.

The bathroom pass uses `src/bathroomPlan.ts` as the shared source for finished dimensions, fixtures, privacy-door geometry, working spaces, privacy windows and bedroom furnishings. Keep all seven bathrooms coordinated with `src/bathrooms.ts`, floor cuts, destinations and diagrams. Preserve 12.8–14.4 m² standard baths, the 21.84 m² primary bath, separate dressing room and complete guest WC enclosure. Do not restore uniform 3.1 m ensuites or raised shower trays. All fixtures and glass need collision; door swings and safe closing positions are tested. Keep Suite 03’s bed facing the entrance so nightstands do not sever bedside access. Use `src/bathroomAudit.ts` for separate dry-bedroom areas; do not report gross suite modules as sleeping areas. See `docs/BATHROOM_REVIEW.md`.

## Workflow

- This is a Babylon.js + TypeScript + Vite browser application. Do not replace it with React, a database, a static rendered image, or a Godot project without a user request.
- Run `npm ci`, `npm test`, and `npm run build` after relevant code changes.
- Inspect the live view in a supported browser when available. Verify arrival, every room doorway, all four stair flights and both return landings, roof access, both camera modes, lighting, gates and day/night presets.
- Do not claim an FPS target or photorealistic finish without measuring / viewing the actual result.
- All coordinates are metres; Y is up and +Z points toward the rear garden.
- Keep geometry and colliders aligned. Movement uses obstacle rectangles and explicit floor surfaces, not a full physics engine.
- Keep room doors animated; do not bake them into static batches. The avatar is created after world batching.
- The upper living-room void must have collision guards. Stairs use visual treads and a continuous movement ramp.
- There is no backend. User settings use localStorage with a failure-safe fallback.
- Keep `dist/` and `node_modules/` out of Git. Preserve `package-lock.json`.
- Use modular Babylon imports and avoid downloading large assets at startup.

## Next visual refinement

The implementation uses procedural architecture and furniture, with more detailed social-space furnishings. For greater realism, retain the layout while replacing key furnishings with licensed, optimized GLB assets, adding carefully authored materials and baked lighting. Keep an editable source for each model. Test performance on the M4 MacBook Air (16 GB), especially with Retina scaling and night lighting. Maintain quality presets.

Known limitations are documented in README.md. Do not erase them until verified fixes exist.
