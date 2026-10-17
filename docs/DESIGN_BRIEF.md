# Dreamhome — framed arrival and offset family court

## Design intent and retained requirements

An original contemporary villa for a future site in Uganda, implemented in Babylon.js, TypeScript and Vite. The latest supplied redesign brief supersedes the former oversized courtyard scheme. The references inform depth, selective glazing, substantial frames and warm concealed lighting; no reference façade, garage arrangement or floor plan is reproduced.

The house has two residential floors: two ground-floor ensuite bedrooms and four upstairs, including the primary. It retains a separate primary walk-in closet, guest half-bath, study, gym, cinema, pantry, balconies, accessible roof terrace and genuine double-height living room. The one-acre site retains the roundabout, detached three-car garage, pool, gazebo, landscaping, high wall and separate vehicle and pedestrian gates. The square boundary is provisional, not surveyed.

## Plan and composition

The entrance opens into a short foyer with an immediate view into the living room. Living, dining and kitchen form one connected social sequence. A clear walking aisle along the eastern side of the living furniture continues through dining to the rear terrace; the island sits beside this route. The enclosed pantry is behind the kitchen. The bedroom corridor is separated from living by the media spine and entered from the foyer or dining circulation. The guest WC is discreetly in the front private vestibule. The cinema is across the house from the west bedroom wing.

The **4.5 × 5 m internal court** sits beside living and kitchen. It is surrounded by building on all four sides, open through both storeys and the roof, with two glazed sliding thresholds, seating for approximately six and a small planter. Fixed sidelights separate the sheltered social route from the outdoor court. Perimeter slot drains express drainage intent; actual falls, outlets, overflow and waterproofing remain engineering work. The court is not on the entrance-to-living route.

A deep central entrance frame and tall stone stair blade establish the front hierarchy. The west rear bedroom wing steps outward two metres. The quieter west front wing has a covered upper loggia; the east wing starts farther back. The central upper gallery glazing is recessed two metres behind the entrance wall. At the rear, two sheltered bedroom balconies flank a six-metre-deep carved upper terrace. Columns continue to ground; the terrace has no roof slab over it. The palette is light warm plaster, fine textured stone, charcoal frames and selective oak soffits/storage. Protected courtyard and garden sides have the larger glass openings; the street remains substantially solid.

The upper living overlook is a furnished, three-metre-deep gallery connected to the private hall, east bedroom and garden terrace. It looks into the **actual 9 × 10 m living void**. A guard protects each accessible floor edge. The roof above living remains intact; the upper floor below it does not.

## Exterior refinement and visible stair

The entrance hierarchy is retained. Its main head now meets the roof slab underside, eliminating the disconnected inner ledge. A 550 mm lower canopy edge joins the upper slab, with protected oak beneath and a substantial timber entrance door between deep stone jambs. The stone arrival blade continues into a roof stair enclosure rather than terminating below an unrelated rooftop shelter. The roof exit has an animated glazed door and matching collision boundary.

The long elevations are authored in `src/facades.ts`, independently of the room loop. The west elevation combines a continuous stone ground-floor base, a **3 × 8 m recessed upper loggia** belonging to Suite 04, and the existing two-metre projection of the primary wing. The east elevation pairs a **2.6 × 7 m family-lounge loggia** with a quieter stone link and protected garden suite. Both loggias occupy the existing floor and roof footprint; inward room walls create real usable recesses. They have room-connected sliding doors, solid 1.1 m outer parapets and piers carried to ground. The east front return wraps around the street corner; the west stone base and protected oak soffit turn its front corner. Rear balconies retain their arrangement with thicker supporting posts, deeper roof edges and sheltered oak soffits.

Exterior walls are 480 mm nominal with glazing set 220 mm inward from their centreline, giving approximately 460 mm from the outer wall face to glass. Openings respond to bedroom, bathroom, cinema and study uses. Bathroom side windows are high-level, including the one facing the private west loggia. These visual privacy measures are not certified security or ventilation specifications.

The study stays on the ground floor. A **4.8 m wide, 3.65 m high framed opening** replaces the former foyer-to-private-wing door, revealing the existing return stair. The bedroom privacy door is moved across the hall beyond the stair approach. The living media spine and direct social route remain intact. General interior styling is deferred: only furniture obstructing new doors/windows was moved, and the narrower family lounge retains one sofa to keep its entrance clear.

## Named dimensions and room schedule

Coordinates are metres: Y up, +Z toward the rear garden. Compass orientation is unresolved. `LEVEL` and `ARCH` in `src/plan.ts` are the primary dimensions. Room sizes below are nominal modules, before wall/finish deductions; bedroom areas include ensuite/storage.

| Element | Nominal dimension |
| --- | --- |
| Square-acre assumption | 63.61 × 63.61 m; 4,046.8564 m² |
| Main wing envelope | X −15 to +17; Z −5 to +20, with arrival frame and rear balconies beyond |
| Ground / upper / roof finished floors | 0 / 4.2 / 8.4 m |
| Eye height | 1.65 m above walking support |
| Typical interior ceiling | Approximately 3.8 m |
| Living room and upper void | 9 × 10 m; approximately 8 m high |
| Dining / open kitchen | 9 × 9 m / 8 × 10 m |
| Courtyard | 4.5 × 5 m, 22.5 m² |
| Upper overlook | 9 × 3 m |
| Primary dressing room | 5.7 × 3.2 m, 18.24 m², separate door and two storage banks |
| Pantry | 3.2 × 3.3 m |
| Ensuites | 3.1 × 3.1 m each; toilet, basin and shower |
| Private corridor | 2 m nominal |
| Return stair | Two 1.6 m flights per storey; 4.2 m run and 2.1 m rise each; 12 risers each |
| Intermediate stair landings | 3.9 × 1.8 m at 2.1 and 6.3 m |
| Detached garage / pool water | 12 × 9 m / 11.5 × 4 m |
| Perimeter wall | Approximately 3 m |

| Floor | Room | Nominal module |
| --- | --- | --- |
| Ground | Study | 7 × 6 m |
| Ground | Garden suite 01, ensuite | 11 × 8 m |
| Ground | Garden suite 02, ensuite | 13 × 9 m |
| Ground | Cinema | 8 × 7 m |
| Ground | Gym | 3.5 × 6 m |
| Ground | Guest half-bath | 3 × 2 m |
| Upper | Suite 03, ensuite | 7 × 6 m |
| Upper | Suite 04, ensuite | 8 × 8 m, plus 3 × 8 m west loggia |
| Upper | Primary, ensuite and separate dressing room | 13 × 9 m |
| Upper | Suite 05, ensuite | 8 × 10 m |
| Upper | Family lounge | 5.4 × 6.6 m, plus 2.6 × 7 m east loggia |

[Ground plan](views/ground-plan.svg) · [Upper plan](views/upper-plan.svg) · [Site plan](views/site-plan.svg) · [Paired plans](views/floor-plans.png)

## Stairs, surfaces and structural intent

A broad return stair was selected instead of a curved stair: it fits beside the private foyer, keeps the social route clear, and gives predictable treads, landings and a matching movement path. Four flights connect the three datums. Each uses 175 mm visual risers and 350 mm treads with continuous ramp support for smooth walking, handrails and guards. The landings allow a full turn without crossing a guard. Headroom is governed by the full-storey spacing and the explicit stair slab openings.

Floor plates are a disjoint union of named footprint rectangles. Upper living and stair voids and the roof courtyard/terrace openings are subtracted explicitly. Rugs and bathroom finishes are thin decorative meshes, not extra walking surfaces. Social rooms, court thresholds and rear social terrace share the ground datum. Wall tops stop at slab undersides to avoid coplanar exposed faces. Doors and their collision rectangles animate together; front vestibule doors swing into their rooms to preserve the passage.

The source uses shared wall/opening/door/slab/loggia components and plan-derived destinations. `ENVELOPE` holds the facade depths, loggia bounds, foyer opening and stair tower dimensions; `sideWalls` schedules the authored elevations. Balcony posts, portico piers and rooftop pavilion supports express structural intent. Wall thicknesses, slab spans, connections, foundations, lateral stability and the living-roof span require a structural engineer; the visualization is not a construction detail.

## Rendering diagnosis and verification scope

For this exterior pass, matching front-left captures with shadows disabled removed the jagged bands. Disabling textures separately did not identify a new texture or slab-overlap cause. The retained 1024-pixel directional shadow map now uses fitted caster depth bounds, tighter projection padding, back-face casting, tuned depth/normal bias and medium PCF filtering. This reduces self-shadow artifacts without increasing map resolution, adding shadow sources or changing preset scaling. Fine shadow aliasing remains visible at some slab edges; the result is not an artifact-free offline render. The shadow-off comparisons are saved beside the before/after views.

The new review set uses identical before/after camera positions, 0.8 radian vertical perspective field of view (about 46°), and orthographic full-side elevations. The front camera is 1.65 m high. Doors remain closed in the foyer comparison, so stair visibility does not depend on opening a hidden corridor door. The final plain-material capture checks massing without surface textures. [Exterior review and comparisons](EXTERIOR_REVIEW.md) records the actual views and verification limits.


The earlier scene was compared in the actual browser with shadows disabled, then procedural textures disabled. Jagged shadow edges disappeared in the first comparison; repeated coursing/banding disappeared in the second. Separate code inspection found overlapping floor slabs and raised decorative finishes. The redesign removes the coursing pattern, gives box faces dimension-based texture coordinates, trims wall tops below slabs and creates nonoverlapping indoor plates. This addresses distinct causes rather than attributing every artifact to one source. Shadow aliasing and transparent-surface ordering remain possible in this lightweight renderer.

The test suite checks the six-suite schedule, court and living voids, disjoint plates, every opened doorway, flat social route, all stair flights and landings in both directions, side-loggia guards/support and privacy glazing, the door-free foyer-to-stair approach and sightline past wall colliders, and connected routes to rooms, bathrooms, dressing room, pantry, balconies and rooftop. Actual browser inspection and interaction results are documented in the README and `views/browser-check.json`, separately from these programmatic checks.

## Privacy, climate and later professional verification

Selective, recessed street openings and the absence of an external stair or projecting street bedroom balcony support privacy. The high boundary wall and detached garage do not establish a security rating. The entrance remains visible from the approach. Larger openings face protected gardens and the internal court.

Rendered windows are currently fixed. Operable ventilation, insect screens, cross-ventilation, safe bedroom escape, fire strategy, security glazing, hardware and guard details must be designed and checked locally. Fewer windows alone are not assumed to make the house secure. Verify the actual Ugandan boundary, access, orientation, setbacks, climate, rain protection, drainage, roof falls/waterproofing, service spaces and approvals with local professionals.

Furniture, planting, water, mirrors and the avatar remain simplified procedural geometry. Licensed optimized GLB assets, authored materials and baked lighting are later visual refinements. No large remote models load at startup. Target-device Retina performance, pointer lock and touch gestures still require manual verification. This is an editable architectural visualization, not a photorealistic asset pack or approved engineering/permit drawing.
