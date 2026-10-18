# Previous exterior refinement — historical review

This documents the pass before the approved ivory reference. For the current architecture and captures, see [IVORY_REVIEW.md](IVORY_REVIEW.md). Its browser results and floor-plan overview have since been updated for the current pass.

The retained entrance frame now belongs to a continuous composition of a stone stair volume, occupied side loggias, quieter private walls and sheltered rear balconies. The study stays downstairs. The foyer opens directly toward the existing return stair; bedroom privacy begins beyond that opening. General interior styling remains a later stage.

## Comparable browser views

These are screenshots of the running Babylon.js application, not generated reference imagery. The baseline is commit `23a32fd`; the final set is the exterior refinement. Camera positions and projection settings are recorded in each directory's `review.json`. Large interface overlays are hidden. Doors are closed in these views.

| View | Before | After |
| --- | --- | --- |
| Front, 1.65 m eye height | [Before](views/exterior-before/front.png) | [After](views/exterior-after/front.png) |
| Front-left three-quarter | [Before](views/exterior-before/front-left.png) | [After](views/exterior-after/front-left.png) |
| Front-right three-quarter | [Before](views/exterior-before/front-right.png) | [After](views/exterior-after/front-right.png) |
| Full west elevation | [Before](views/exterior-before/west.png) | [After](views/exterior-after/west.png) |
| Full east elevation | [Before](views/exterior-before/east.png) | [After](views/exterior-after/east.png) |
| Rear and pool | [Before](views/exterior-before/rear.png) | [After](views/exterior-after/rear.png) |
| Full rear elevation | [Before](views/exterior-before/rear-elevation.png) | [After](views/exterior-after/rear-elevation.png) |
| Foyer toward staircase | [Before](views/exterior-before/foyer-stair.png) | [After](views/exterior-after/foyer-stair.png) |

[Plain materials](views/exterior-after/plain-materials.png) · [Night arrival](views/exterior-after/front-left-night.png) · [Updated floor-plan overview](views/floor-plans.png)

Perspective views use a moderate 0.8 radian vertical field of view (approximately 46°). The two full side elevations are orthographic. The front-right camera is elevated to 7 m to clear the detached garage and foreground tree; the separate front view remains at normal eye height. The west loggia is 3 × 8 m and Suite 04 remains an 8 × 8 m module including its ensuite. The east loggia is 2.6 × 7 m; its family lounge remains 5.4 × 6.6 m. Dimensions are nominal, before wall and finish deductions.

## Rendering diagnosis

The [baseline with shadows disabled](views/exterior-before/diagnostic-no-shadows.png) removes the jagged bands seen in its normal front-left view. A further [texture-disabled comparison](views/exterior-before/diagnostic-no-shadows-no-textures.png) separates material variation from the shadow artifact. The revised directional map uses fitted depth bounds and tighter projection padding, back-face casting, adjusted bias and medium PCF filtering. Its resolution stays 1024 pixels. Quality scaling and the four-local-light cap remain intact.

This reduces the prominent self-shadow bands; fine aliasing can still appear along ledges. It does not establish physically accurate lighting or a photorealistic finish. The new [shadow-disabled comparison](views/exterior-after/diagnostic-no-shadows.png) and plain-material view retain the side recesses because they are actual building geometry.

## Verification scope

`npm ci`, all eight architecture test groups, and the TypeScript/Vite production build passed. Programmatic checks cover disjoint floor surfaces, six ensuite bedrooms, the open courtyard and living void, every doorway, all four stair flights and both landings, connectivity to required rooms and terraces, and the new loggias' support/guards. The foyer-to-stair route is checked with doors closed; its sightline check excludes the stair guard rectangles because they represent spaced balusters rather than opaque walls.

All final views in the comparison table, the plain-material view, night arrival and the paired floor plans were visually inspected. Keyboard-driven browser checks passed for 38 doors/gates, all four flights and both intermediate landings in both directions, the direct foyer-to-stair approach, both loggias, roof exit, camera modes, lighting, day/night, quality presets and plan tabs. Results are recorded in [browser-check.json](views/browser-check.json). These interaction checks are separate from visual inspection of the rendered elevations. Pointer-lock behavior, touch gestures, Retina rendering and sustained performance on the user's M4 MacBook Air remain unverified. The short headless-browser timing sample is not target-hardware certification.

The local building design still needs professional verification of structure, drainage, waterproofing, ventilation, emergency escape, security glazing and hardware, guards, actual site orientation and Ugandan requirements. The square-acre boundary remains provisional.
