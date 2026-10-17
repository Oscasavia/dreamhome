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

A deep central entrance frame, stone stair blade, sheltered upper loggia and recessed east wing compose the street elevation. Two rear bedroom balconies flank a carved upper garden terrace. The garage remains detached.

- **Everyday route:** sheltered entrance → short foyer → double-height living → dining and open kitchen → rear terrace. The island and dining furniture leave a clear walking aisle. A separate pantry serves the kitchen.
- **Ground:** two full ensuite bedrooms, study, gym, cinema and discreet guest half-bath. Bedrooms have a private corridor.
- **Upper:** four full ensuite bedrooms, including the 117 m² primary module with a separate 5.7 × 3.2 m walk-in closet; family lounge, balconies and furnished 9 × 3 m living overlook.
- **Court:** a compact 4.5 × 5 m family retreat beside living and kitchen, surrounded on all four sides, open to the sky, with seating, planting, glazed thresholds and drainage intent.
- **Stair and roof:** broad return stairs, two flights per storey and two intermediate landings, connect the ground, upper floor and guarded roof terrace.
- **Grounds:** one-acre assumption, pool, gazebo, roundabout, detached three-car garage, landscaping, high perimeter wall and separate gates.

Use **Estate map → Site / Ground / Upper** for diagrams and destination shortcuts. **Architectural views** offers exterior and interior inspection cameras. Select **Walkthrough** to return to walking. Keyboard, touch controls and quality presets remain available.

Actual browser captures: [human-eye entrance](docs/views/entrance-day.png), [garden](docs/views/garden-day.png), [night entrance](docs/views/entrance-night.png), [foyer into living](docs/views/foyer.png), [social spaces](docs/views/social-spaces.png), [courtyard](docs/views/courtyard.png), [court from the upper alcove](docs/views/courtyard-overlook.png), [living overlook](docs/views/living-overlook.png), [upper stair arrival](docs/views/stair-landing.png), [intermediate landing](docs/views/stair-intermediate.png), [roof stair arrival](docs/views/stair-roof.png), [roof terrace](docs/views/roof-terrace.png) and [aerial](docs/views/aerial.png). [View both floor plans](docs/views/floor-plans.png).

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

`npm ci`, all six `npm test` groups, and `npm run build` passed for this stage.

The redesign uses named floor datums, nonoverlapping plates and thin decorative finishes without extra walking support. The six automated test groups cover the room schedule, genuine voids, plate overlaps, every doorway, continuous social routes, four stair flights and their landings, and floor connectivity to every room, bathroom, pantry, dressing room, balcony and roof. These programmatic checks are separate from visual review.

The actual application was rendered in headless Chrome/WebGL with large overlays hidden. Front, rear, foyer/living, social spaces, courtyard, living overlook, stair landings, roof and aerial captures were visually reviewed. Keyboard-driven checks exercised **35 doors/gates**, both return-stair pairs up/down, social/private hall routes, first/third person, room lighting, day/night, all quality presets and plan tabs. Results are in [browser-check.json](docs/views/browser-check.json). They are functional checks, not a target-hardware certification.

A short 80-frame sample after warmup measured a median browser frame interval of about **16.7 ms** in each preset. Performance rendered at 969 × 606; Balanced and High at 1600 × 1000 because the headless browser's device scale was 1. High therefore did **not** test Retina resolution. The sample is one exterior scene and excludes sustained thermal/load testing. No M4 performance guarantee follows from it.

Run `npm ci`, `npm test` and `npm run build` for dependency installation, geometry checks and the production bundle. Generate SVG diagrams with `node --import tsx tooling/export-plans.ts`. For browser review, start Vite, launch an isolated Chrome session with debugging on localhost port 9222, then run `DREAMHOME_URL=http://127.0.0.1:5174/ node tooling/browser-review.mjs` (use the actual Vite port). `node tooling/capture-views.mjs` refreshes the architectural captures against port 5174. Native Node WebSocket/CDP drives a development-only bridge; the production bundle excludes that bridge. No browser automation package is installed.

A Git checkpoint was made before the substantive redesign: `6c1b616`. The supplied GitHub URL is configured as `origin`; connecting it does not publish these local changes.

Pointer-lock capture, touch gestures and actual GPU performance on the target Mac still need manual verification. Materials and furnishings remain procedural; transparent-surface ordering and shadow aliasing remain visible. Furniture collision is simplified. Windows are currently fixed visualizations; operable ventilation, emergency escape, security glazing and hardware need professional design. Courtyard drainage, roof waterproofing, structure, climate response and local Ugandan requirements also need verification.

This is an architectural visualization concept, not a structural, engineering or permit drawing.
