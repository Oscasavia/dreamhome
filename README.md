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

An asymmetrical courtyard house with a projecting stone study, a sheltered level entrance, recessed upper lounge, staggered bedroom wings and a garden-facing living pavilion. The detached three-car garage remains separate.

- **Ground:** two full ensuite bedroom suites, study, gym, cinema, kitchen/breakfast, guest half-bath and double-height living/dining.
- **Upper:** four full ensuite suites, including a 144 m² primary module with a separate 8.6 × 4.5 m walk-in closet; upper lounge, screened loggia, rear balconies and a genuine living overlook.
- **Courtyard:** 10 × 8 m, inside four enclosing wings, open to the sky, with continuous surrounding galleries.
- **Roof:** accessible guarded terrace and pergola; two measured stair flights connect all levels.
- **Grounds:** pool, gazebo, roundabout, detached garage, landscaping, high perimeter wall and separate vehicle/pedestrian gates.
- Selective recessed street windows, larger courtyard and garden openings, warm plaster, coursed stone, charcoal metal and selective oak accents.

Use **Estate map → Site / Ground / Upper** for diagrams and destination shortcuts. The **Architectural views** dropdown provides entrance, garden, courtyard and aerial cameras; select **Walkthrough** to return to walking. Existing keyboard and touch controls remain available.

Actual browser captures: [entrance](docs/views/entrance-day.png), [garden](docs/views/garden-day.png), [night entrance](docs/views/entrance-night.png), [courtyard](docs/views/courtyard.png), [living overlook](docs/views/living-overlook.png), [aerial](docs/views/aerial.png). [View both floor plans](docs/views/floor-plans.png).

Read [the design brief](docs/DESIGN_BRIEF.md) for the architectural rationale, room schedule, dimensions, circulation and professional-verification items. The square acre and compass orientation remain provisional.

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

`npm ci`, `npm test` and `npm run build` complete successfully. Four headless test groups check the room schedule, scene/interaction invariants, sampled door passages and stair travel, and connected routes through each floor. Collisions follow animated door leaves; shared surface edges have a small walking tolerance.

The actual application was rendered in headless Chrome/WebGL. Exterior, courtyard and living-overlook captures were visually inspected. Browser keyboard checks exercised all 30 doors/gates, both stair flights in both directions, first/third person, lighting, day/night, all three quality presets and plan tabs. The reproducible browser result is in [browser-check.json](docs/views/browser-check.json). These are functional checks, not a hardware performance benchmark.

To reproduce the diagrams, run `node --import tsx tooling/export-plans.ts`. To reproduce browser checks, start Vite, launch an isolated Chrome session with remote debugging on localhost port 9222, then run `DREAMHOME_URL=http://127.0.0.1:5173/ node tooling/browser-review.mjs` (use the actual Vite port). The review script drives the development-only inspection bridge, uses native Node WebSocket/CDP and saves captures under `docs/views/`. No browser automation dependency or bridge is included in the production bundle.

Pointer-lock capture, touch gestures and actual GPU performance on the target Mac still need manual verification. Materials and furnishings remain procedural; transparent-surface ordering and shadow aliasing remain visible. Furniture collision is simplified. Windows are currently fixed visualizations; operable ventilation, emergency escape, security glazing and hardware need professional design. Courtyard drainage, roof waterproofing, structure, climate response and local Ugandan requirements also need verification.

This is an architectural visualization concept, not a structural, engineering or permit drawing.
