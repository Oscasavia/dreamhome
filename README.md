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
| L | Toggle the nearest room's lighting |
| V | First-person / third-person camera |
| N | Day / night |
| M | Estate map and destination shortcuts |
| R | Return to entrance |
| Escape | Release the mouse |

Touch devices have movement buttons and drag-to-look. The entrance stairs connect ground level, the upper floor, and the rooftop. Map shortcuts provide an alternative to walking.

## The design

A deep entrance frame and stone stair volume anchor the street elevation. A recessed suite loggia composes the west side; a sheltered family-lounge loggia turns the east front corner. Quiet solid walls and selective deep glazing connect these to the projecting rear wing. Two rear bedroom balconies flank a carved upper garden terrace. The garage remains detached.

- **Everyday route:** sheltered entrance → short foyer → double-height living → dining and open kitchen → rear terrace. The island and dining furniture leave a clear walking aisle. A separate pantry serves the kitchen.
- **Ground:** two full ensuite bedrooms, study, gym, cinema and discreet guest half-bath. Bedrooms have a private corridor.
- **Upper:** four full ensuite bedrooms, including the 117 m² primary module with a separate 5.7 × 3.2 m walk-in closet; family lounge, balconies and furnished 9 × 3 m living overlook.
- **Court:** a compact 4.5 × 5 m family retreat beside living and kitchen, surrounded on all four sides, open to the sky, with seating, planting, glazed thresholds and drainage intent.
- **Stair and roof:** a broad foyer opening reveals the stair, with the bedroom privacy door farther along the hall. Broad return stairs, two flights per storey and two intermediate landings, connect the ground, upper floor and guarded roof terrace.
- **Grounds:** one-acre assumption, pool, gazebo, roundabout, detached three-car garage, landscaping, high perimeter wall and separate gates.

Use **Estate map → Site / Ground / Upper** for diagrams and destination shortcuts. **Architectural views** offers exterior and interior inspection cameras. Select **Walkthrough** to return to walking. Keyboard, touch controls and quality presets remain available.

The latest exterior captures and matching baseline views are collected in [the exterior review](docs/EXTERIOR_REVIEW.md): [front](docs/views/exterior-after/front.png), [front-left](docs/views/exterior-after/front-left.png), [front-right](docs/views/exterior-after/front-right.png), [west](docs/views/exterior-after/west.png), [east](docs/views/exterior-after/east.png), [rear/pool](docs/views/exterior-after/rear.png), [foyer to stair](docs/views/exterior-after/foyer-stair.png), [plain materials](docs/views/exterior-after/plain-materials.png) and [night arrival](docs/views/exterior-after/front-left-night.png). [View both updated floor plans](docs/views/floor-plans.png).

Earlier interior-study captures remain in `docs/views/`; use the exterior review for the current enclosure and staircase opening. General furnishing and decorating are deferred.

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

`npm ci`, all eight `npm test` groups, and `npm run build` passed for this stage.

The redesign uses named floor datums, nonoverlapping plates and thin decorative finishes without extra walking support. The eight automated test groups cover the room schedule, genuine voids, plate overlaps, every doorway, continuous social routes, four stair flights and their landings, floor connectivity to every room, bathroom, pantry, dressing room, balcony and roof, and the new loggias and direct foyer-to-stair route. These programmatic checks are separate from visual review.

The actual application was rendered in headless Chrome/WebGL with large overlays hidden. The latest visual review covers the front, both front three-quarter views, both full side elevations, rear/pool, foyer-to-stair opening, plain materials and night arrival. Keyboard-driven checks exercised **38 doors/gates**, both return-stair pairs up/down, social/private hall routes, the foyer-to-stair approach, both new loggias, first/third person, room lighting, day/night, all quality presets and plan tabs. Results are in [browser-check.json](docs/views/browser-check.json). They are functional checks, not a target-hardware certification.

A short 80-frame sample after warmup measured a median browser frame interval of about **16.7 ms** in each preset. Performance rendered at 969 × 606; Balanced and High at 1600 × 1000 because the headless browser's device scale was 1. High therefore did **not** test Retina resolution. The sample is one exterior scene and excludes sustained thermal/load testing. No M4 performance guarantee follows from it.

Run `npm ci`, `npm test` and `npm run build` for dependency installation, geometry checks and the production bundle. Generate SVG diagrams with `node --import tsx tooling/export-plans.ts`. For browser review, start Vite, launch an isolated Chrome session with debugging on localhost port 9222, then run `DREAMHOME_URL=http://127.0.0.1:5174/ node tooling/browser-review.mjs` (use the actual Vite port). `node tooling/exterior-review.mjs after` refreshes the comparable exterior review set; the default URL is port 5174 and `DREAMHOME_URL` overrides it. Preserve `docs/views/exterior-before/` as the baseline. `node tooling/capture-views.mjs` captures the earlier broad interior/exterior camera set. Native Node WebSocket/CDP drives a development-only bridge; the production bundle excludes that bridge. No browser automation package is installed.

The prior compact-courtyard redesign is checkpoint `23a32fd`, which provides the baseline for the exterior refinement's before/after comparisons.

Pointer-lock capture, touch gestures and actual GPU performance on the target Mac still need manual verification. Materials and furnishings remain procedural; transparent-surface ordering and shadow aliasing remain visible. Furniture collision is simplified. Windows are currently fixed visualizations; operable ventilation, emergency escape, security glazing and hardware need professional design. Courtyard drainage, roof waterproofing, structure, climate response and local Ugandan requirements also need verification.

This is an architectural visualization concept, not a structural, engineering or permit drawing.
