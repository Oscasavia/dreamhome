# Dreamhome

A contemporary six-suite courtyard estate on a one-acre plot. An interactive architectural concept built with **Babylon.js, TypeScript, and Vite**, designed to remain editable in VS Code and to run entirely in the browser. No server or database is required.

## Run on your Mac

Install Node.js 22.12+ (24 LTS is suitable), then:

```bash
git clone https://github.com/Oscasavia/dreamhome.git
cd dreamhome
npm ci
npm run dev
```

Open the local URL printed by Vite. Open the `dreamhome` folder in VS Code to continue with Codex. If you already cloned this repository, pull the latest changes first.

```bash
npm test       # architecture, movement and interaction checks
npm run build # TypeScript checking and static production bundle
npm run preview
```

## Explore

| Control | Action |
| --- | --- |
| Enter the estate / click the view | Start walking and capture the mouse |
| WASD / arrow keys | Walk |
| Mouse | Look |
| Shift | Walk faster |
| E | Open or close a nearby door / gate |
| L | Toggle the current bathroom’s lights, or nearest room lighting |
| V | First-person / third-person camera |
| N | Day / night |
| M | Estate map and destination shortcuts |
| R | Return to entrance |
| Escape | Release the mouse |

Touch devices have movement buttons and drag-to-look. The main stair connects the foyer to the front gallery; a separate stair in the west bay continues to the rooftop. Map shortcuts provide an alternative to walking.

## The design

The approved ivory-mansion image now governs the front: a pale travertine wing, two tall narrow windows, deeply recessed balcony, illuminated dark slot, walnut-lined ivory entrance frame and raised veranda with five shallow illuminated steps. Paired dark doors open together. The open stone-paved arrival court replaces the roundabout. The detached garage sits east/front-right, with all three doors facing west and cars entering along +X. Side loggias and sheltered rear balconies continue the same materials.

- **Everyday route:** sheltered entrance → short foyer → double-height living → dining and open kitchen → rear terrace. Dining sits between lounge and kitchen; its ten-seat table runs parallel to the 4.4 m waterfall island with five stools. Occupied seating, appliance openings and pantry access retain clear routes.
- **Living interior:** a genuine 8.16 m-high space with full-height marble/walnut media wall, floating console, fireplace and cascading opal chandelier. Warm ivory porcelain runs continuously through the social spaces.
- **Ground:** two full ensuite bedrooms, study, gym, cinema and discreet guest half-bath. Bedrooms have a private corridor.
- **Upper:** four full ensuite bedrooms, including the 117 m² primary module with a separate 5.7 × 3.2 m walk-in closet; family lounge, balconies, a 2.5 m-wide side gallery and 9 × 2 m rear overlook into the extended living void.
- **Bathrooms:** five 12.80–14.40 m² standard ensuites, a 21.84 m² primary bathroom with double vanity, separate shower and tub, and a fully enclosed 4.93 m² guest WC. Finished dimensions, bedroom-area deductions and reviewed views are in the [bathroom review](docs/BATHROOM_REVIEW.md).
- **Court:** a compact 4.5 × 5 m family retreat beside living and kitchen, surrounded on all four sides, open to the sky, with seating, planting, glazed thresholds and drainage intent.
- **Stair and roof:** an open pale-stone return stair rises from the front-left living volume to the front gallery, with glass guards, bronze supports, 1.8 m clear flights and a broad turning landing. It replaces the separate arrival sitting pair. The old ground stair bay becomes a cloak lobby; the independent roof stair stays above it in the west bay.
- **Grounds:** one-acre assumption, pool, gazebo, open arrival court, detached west-facing three-car garage, landscaping, high perimeter wall and separate gates.

Use **Estate map → Site / Ground / Upper** for diagrams and destination shortcuts. **Architectural views** offers exterior and interior inspection cameras. Select **Walkthrough** to return to walking. Keyboard, touch controls and quality presets remain available.

See the [approved-image implementation review](docs/IVORY_REVIEW.md) for the actual application captures: [front](docs/views/ivory/approved-front.png), [night](docs/views/ivory/approved-front-night.png), [walking approach](docs/views/ivory/walking-front.png), [west](docs/views/ivory/west.png), [east](docs/views/ivory/east.png), [rear](docs/views/ivory/rear.png) and [top/garage orientation](docs/views/ivory/top.png). [View both floor plans](docs/views/floor-plans.png).

The [preceding social-interior review](docs/INTERIOR_REVIEW.md) includes actual application views of the [social sequence](docs/views/interior/social-sequence.png), [media wall and chandelier](docs/views/interior/full-height-media.png), [island](docs/views/interior/island-front.png), [upper overlook](docs/views/interior/upper-overlook.png) and [evening lighting](docs/views/interior/social-evening.png). The front and garage are retained; the central rear terrace is shallower to accommodate the longer living void and rear gallery. Earlier reviews remain historical records.

The [preceding stair review](docs/STAIR_REVIEW.md) includes actual rendered views of the [foyer approach](docs/views/stairs/foyer-stair.png), [flights and landing](docs/views/stairs/flights-landing.png), [upper arrival](docs/views/stairs/upper-arrival.png) and [rigid furniture proxy](docs/views/stairs/furniture-turn-proxy.png). The exterior, main lounge and social arrangement are retained.

The [current bathroom review](docs/BATHROOM_REVIEW.md) includes the before/after area schedule, seven detailed plans and normal-height application captures of [Suite 01](docs/views/bathrooms/suite-1.png), [the primary bathroom](docs/views/bathrooms/master.png), [double vanity](docs/views/bathrooms/master-vanity.png) and [guest WC](docs/views/bathrooms/guest.png). All seven bathrooms are available through map shortcuts and Architectural views.

Read [the design brief](docs/DESIGN_BRIEF.md) for dimensions, room relationships, the return-stair choice, floor continuity, rendering diagnosis and professional-verification items. The square acre and compass orientation remain provisional.

## Performance choices

- Three quality presets. **Balanced** starts at approximately CSS-pixel resolution, avoiding automatic full Retina rendering. **Performance** reduces resolution and disables shadows. **High** allows up to 2× pixel density.
- Static meshes are batched by material and spatial cell. Moving doors stay separate.
- One directional shadow source and at most four nearby local lights. No ray tracing, screen-space reflections or physics-library download.
- Procedural lightweight furniture, surface textures, vegetation and water. No remote 3D asset downloads.
- Settings persist locally. Google Fonts is optional; system fonts work if it is unavailable.

Frame rate on the user's M4 MacBook Air has **not** been measured. The in-app FPS display helps compare presets. This is a functioning architectural prototype, not a finished photorealistic Blender asset pack. Furniture, water, mirrors and the third-person figure are simplified. Large-model imports and baked lightmaps are future visual upgrades.

## Project files

| File | Responsibility |
| --- | --- |
| `src/plan.ts` | Site dimensions, room schedule, destinations, collision and walking surfaces |
| `src/facades.ts` | Authored side elevations, opening schedule, loggia and stair-enclosure dimensions |
| `src/world.ts` | Procedural architecture, furnishing, lighting, doors and static batching |
| `src/stairs.ts` | Reusable treads, supports, glass, rails and headroom boundaries |
| `src/stairClearance.ts` | Rigid 3D furniture poses and separating-axis clearance check |
| `src/interiorPlan.ts` | Social furniture dimensions, occupied-seat envelopes and circulation routes |
| `src/interior.ts` | Social materials, reusable rounded furniture, kitchen, media wall and chandelier |
| `src/surfaceTextures.ts` | Repeating procedural travertine, paving, wood and floor textures |
| `src/landscape.ts` | Three thin-instanced tropical foliage/trunk buffers |
| `src/bathroomPlan.ts` | Finished bathroom dimensions, fixtures, doors, working clearances and bedroom furniture |
| `src/bathrooms.ts` | Shared bathroom construction and detailed procedural sanitary fixtures |
| `src/bathroomAudit.ts` | Comparable before/after dry bedroom floor-area calculations |
| `tests/bathrooms.test.ts` | Enclosure, working spaces, real fixture collisions and door/route checks |
| `src/diagrams.ts` | Site and floor-plan SVGs generated from the architectural schedule |
| `src/main.ts` | Interface, movement, first/third-person cameras and input |
| `src/style.css` | Interface styling and responsive layouts |
| `tests/estate.test.ts` | Headless scene and geometry tests |
| `docs/DESIGN_BRIEF.md` | User requirements and design assumptions |
| `AGENTS.md` | Instructions for continued Codex work |

## GitHub and hosting

The repository is the source project. `npm run build` creates a static `dist/` folder suitable for GitHub Pages or another static host. Relative asset paths support hosting beneath `/dreamhome/`.

CI runs tests and the build on pushes and pull requests. A separate **Deploy GitHub Pages** workflow can be run manually after setting **Settings → Pages → Source → GitHub Actions**. This project does not assume Pages is already enabled or a live deployment exists.

No database, API keys, account system or paid services are needed. New source files use the MIT license; dependency licenses remain their own.

## Verification and remaining work

`npm ci`, all fourteen `npm test` groups, and `npm run build` passed for this stage.

The redesign uses named floor datums, nonoverlapping plates and thin decorative finishes without extra walking support. The fourteen automated test groups cover the room schedule, genuine voids, plate overlaps, every doorway, continuous social routes, four stair flights and their landings, floor connectivity to every room, bathroom, pantry, dressing room, balcony and roof, the loggias and direct foyer-to-stair route, shallow exterior stairs, paired entrance, forecourt surfaces and west-facing garage approaches. They also check occupied/pulled-out seating, open appliance clearance, social sightlines and the extended void/gallery. A rigid 2.2 × 1.0 × 0.9 m proxy also clears both main flights, a 180° landing turn and the front-gallery route into bedroom circulation. Bathroom tests additionally check finished areas, enclosure, vanity/WC working spaces, collision bodies, complete privacy-door sweeps, shower entries and flat floor support. Both bedsides, bed feet and wardrobe fronts are checked for connection to circulation. These programmatic checks are separate from visual review.

The actual application was rendered in Chrome/WebGL with large overlays hidden. The preceding visual review covers the new stair from the foyer, lower approach, flights, turning landing, upper arrival, retained roof stair, living arrangement, evening lighting and furniture proxy. The preceding interior stage records the media wall/chandelier, dining/island, courtyard, front and rear. Previous exterior-only views are retained as historical evidence. Keyboard-driven checks exercised **40 door leaves/gates**, both exterior flights and both return-stair pairs up/down, social/private hall routes, the kitchen working and stool aisles, courtyard access, the east gallery and rear overlook, the foyer-to-stair approach and both loggias, first/third person, room lighting, day/night, all quality presets and plan tabs. A continuous keyboard-driven tour also ascends and descends the main stair and roof stair, crossing both galleries, in each camera mode without teleporting between waypoints. Results are in [browser-check.json](docs/views/browser-check.json); [the final continuous-walk report](docs/views/stairs/continuous-walk.json) rechecks the completed handrail details in both camera modes. They are functional checks, not a target-hardware certification.

The current bathroom review entered all seven bathrooms at normal first-person height/FOV, closed each door, approached fixtures, entered each shower, switched bathroom lighting and exited. All seven daytime interior captures were visually inspected. It also walked the guest WC’s public approach. See [bathrooms/review.json](docs/views/bathrooms/review.json) for routes and 100-frame Balanced day/night and High 2× samples.

The interaction run samples 80 frames after warmup at device scale 1. The stair review samples 100 frames after 30 warmup frames, Balanced day/evening and High at 2× scale; see [stairs/review.json](docs/views/stairs/review.json). The interior review separately samples 100 frames after 30 warmup frames in the social view, by day and evening, plus High at device scale 2 (3072 × 2048). Exact results are recorded in [interior/review.json](docs/views/interior/review.json). The local-light cap remains four. These short Chrome/WebGL samples are not sustained thermal/load testing or measured target-device certification; browser frame intervals alone do not establish GPU headroom.

Run `npm ci`, `npm test` and `npm run build` for dependency installation, geometry checks and the production bundle. Generate SVG diagrams with `node --import tsx tooling/export-plans.ts`. For browser review, start Vite, launch an isolated Chrome session with debugging on localhost port 9222, then run `DREAMHOME_URL=http://127.0.0.1:5174/ node tooling/browser-review.mjs` (use the actual Vite port). `node tooling/browser-review.mjs --tour-only` repeats the continuous route and controls without the individual doorway tests. `node tooling/bathroom-review.mjs` walks and captures all seven bathrooms and updates the paired plans. Run browser scripts sequentially. `node tooling/bathroom-before.mjs` is a historical audit tool for baseline `a2032d4`; do not rerun it on the updated scene. `node tooling/stair-review.mjs` captures the current stair views and day/evening/2× samples; `node tooling/interior-review.mjs` captures the social interior and its day/evening/2× performance samples; `node tooling/ivory-review.mjs` captures the preceding exterior camera set; `node tooling/exterior-review.mjs after` is the historical comparison tool; the default URL is port 5174 and `DREAMHOME_URL` overrides it. Preserve `docs/views/exterior-before/` as the baseline. `node tooling/capture-views.mjs` captures the earlier broad interior/exterior camera set. Native Node WebSocket/CDP drives a development-only bridge; the production bundle excludes that bridge. No browser automation package is installed.

The approved-image pass starts from `446d280`. The prior compact-courtyard redesign is checkpoint `23a32fd`, which provides the baseline for the exterior refinement's before/after comparisons.

Pointer-lock capture, touch gestures and actual GPU performance on the target Mac still need manual verification. The visible roof stair housing, simplified foliage and furniture, glazing and lighting still differ from the approved image. Image dimensions are assumptions; vehicle turning radii and a step-free arrival route are not resolved. Materials and furnishings remain procedural; transparent-surface ordering and shadow aliasing remain visible. Furniture collision uses simplified bounding rectangles. Bathroom mirrors have no real reflections, drawers are static with checked opening envelopes, and shower drainage/falls and mechanical extraction are intent only. The moving-box test checks a specific rigid object and carrying trajectory, with doors fully open; it does not include movers, packing, every bedroom doorway or construction tolerances. Main stair supports, glass fixings and guard details need engineering; the narrower retained roof stair is not included in the furniture test. Windows are currently fixed visualizations; operable ventilation, emergency escape, security glazing and hardware need professional design. Courtyard drainage, roof waterproofing, structure, climate response and local Ugandan requirements also need verification.

This is an architectural visualization concept, not a structural, engineering or permit drawing.
