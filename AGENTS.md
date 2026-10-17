# Working on Dreamhome

## Preserve the user's requirements

Read `docs/DESIGN_BRIEF.md` before changing the architecture. The courtyard is **inside the house footprint**, not a detached garden. Ground level has two ensuite bedrooms; the upper level has four, including the primary. Preserve a genuine double-height living room with an upper overlook and spacious rooms. Do not fill the living void with a floor or the courtyard with a roof.

## Workflow

- This is a Babylon.js + TypeScript + Vite browser application. Do not replace it with React, a database, a static rendered image, or a Godot project without a user request.
- Run `npm ci`, `npm test`, and `npm run build` after relevant code changes.
- Inspect the live view in a supported browser when available. Verify arrival, every room doorway, both stair flights, roof access, both camera modes, lighting, gates and day/night presets.
- Do not claim an FPS target or photorealistic finish without measuring / viewing the actual result.
- All coordinates are metres; Y is up and +Z points toward the rear garden.
- Keep geometry and colliders aligned. Movement uses obstacle rectangles and explicit floor surfaces, not a full physics engine.
- Keep room doors animated; do not bake them into static batches. The avatar is created after world batching.
- The upper living-room void must have collision guards. Stairs use visual treads and a continuous movement ramp.
- There is no backend. User settings use localStorage with a failure-safe fallback.
- Keep `dist/` and `node_modules/` out of Git. Preserve `package-lock.json`.
- Use modular Babylon imports and avoid downloading large assets at startup.

## Next visual refinement

This first implementation uses procedural architecture and simplified furniture. For greater realism, retain the layout while replacing key furnishings with licensed, optimized GLB assets, adding carefully authored materials and baked lighting. Keep an editable source for each model. Test performance on the M4 MacBook Air (16 GB), especially with Retina scaling and night lighting. Maintain quality presets.

Known limitations are documented in README.md. Do not erase them until verified fixes exist.
