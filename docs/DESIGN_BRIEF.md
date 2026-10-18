# Dreamhome — approved ivory mansion and internal family court

## Design intent and retained requirements

The latest approved **Ivory mansion with rotated garage** image controls the front architecture, raised veranda, open paved forecourt, materials, lighting and west-facing garage. It supersedes earlier instructions to avoid reproducing a reference façade, retain a roundabout or face the garage doors toward the street. The implementation remains Babylon.js, TypeScript and Vite.

Two residential floors retain two ground-floor ensuite bedrooms and four upstairs, including the primary, a separate primary walk-in closet, guest half-bath, study, gym, cinema, pantry, balconies, accessible roof terrace and a genuine double-height living room. The one-acre site retains a detached three-car garage, pool, gazebo, landscaping, high wall and separate gates. The square boundary is provisional, not surveyed.

The front comprises an 11.2 m-wide pale travertine volume with two narrow lower windows and a 5.8 m-wide recessed upper balcony; a narrow screened dark light slot; a 9.6 m-wide, 9.5 m-high ivory entrance frame, 5 m deep, lined in walnut; an upper entrance balcony over the veranda; dark paired entrance doors; and a quieter recessed ivory east wing. These dimensions are inferred design assumptions. The original interior relationships are retained behind the new frontage.

The open arrival court replaces **all** roundabout geometry. The detached garage has a fully rotated 9 × 12 m footprint, X 21–30 and Z −18 to −6. Its three 3.4 m-wide doors face west across an 8 m nominal apron; bays are arranged along Z with centres −16, −12 and −8. Cars enter west-to-east (+X). The short south end is solid ivory. At least 4 m separates the garage from the eastern mansion wall. South/front, north/rear, west/left and east/right refer to the approved image; true site orientation needs confirmation.

The exterior datum is −0.75 m. Ground/veranda/foyer remain 0 m, upper 4.2 m, roof 8.4 m. Five shallow 150 mm risers with 480 mm treads form the 8.2 m-wide illuminated approach. Seating stays beside the clear double-door route. Rear garden steps descend from the 0 m terrace to exterior grade. The stairs are an intentional replacement of the earlier near-level entrance; a step-free arrival route remains future design work.

[Current views, comparison and verification](IVORY_REVIEW.md) records the approved-image stage and its remaining visual differences. Earlier exterior comparisons are historical.

## Plan and composition

The entrance opens into a short foyer with an immediate view into the living room. Living, dining and kitchen form one connected social sequence. A clear walking aisle along the eastern side of the living furniture continues through dining to the rear terrace; the island sits beside this route. The enclosed pantry is behind the kitchen. The bedroom corridor is separated from living by the media spine and entered from the foyer or dining circulation. The guest WC is discreetly in the front private vestibule. The cinema is across the house from the west bedroom wing.

The **4.5 × 5 m internal court** sits beside living and kitchen. It is surrounded by building on all four sides, open through both storeys and the roof, with two glazed sliding thresholds, seating for approximately six and a small planter. Fixed sidelights separate the sheltered social route from the outdoor court. Perimeter slot drains express drainage intent; actual falls, outlets, overflow and waterproofing remain engineering work. The court is not on the entrance-to-living route.

The substantial front frame and travertine wing establish the arrival hierarchy. The west rear bedroom wing steps outward two metres. The quieter side wings contain occupied recessed upper loggias. At the rear, two sheltered bedroom balconies flank a six-metre-deep carved upper terrace. Columns continue to ground; the terrace has no roof slab over it. The palette is warm ivory plaster, pale travertine, dark bronze and selective walnut. Protected courtyard and garden sides carry larger openings; the street remains substantially solid.
The upper living overlook is a furnished, three-metre-deep gallery connected to the private hall, east bedroom and garden terrace. It looks into the **actual 9 × 10 m living void**. A guard protects each accessible floor edge. The roof above living remains intact; the upper floor below it does not.

## Exterior refinement and visible stair

The approved entrance frame has 850 mm piers, substantial head depth, walnut internal faces, an upper balcony and a sheltered veranda. The left balcony has deep stone jambs and an inset glass guard. A dark bronze screen and warm vertical light mark the narrow recess between volumes. The compact roof stair housing remains visible behind the front wing to preserve real headroom; its glazed roof exit is animated and has a matching collision boundary.
The long elevations are authored in `src/facades.ts`, independently of the room loop. The west elevation combines a continuous stone ground-floor base, a **3 × 8 m recessed upper loggia** belonging to Suite 04, and the existing two-metre projection of the primary wing. The east elevation pairs a **2.6 × 7 m family-lounge loggia** with a quieter stone link and protected garden suite. Both loggias occupy the existing floor and roof footprint; inward room walls create real usable recesses. They have room-connected sliding doors, solid 1.1 m outer parapets and piers carried to ground. The east front return wraps around the street corner; the west stone base and protected walnut soffit turn its front corner. Rear balconies retain their arrangement with thicker supporting posts, deeper roof edges and sheltered walnut soffits.

Exterior walls are 480 mm nominal with glazing set 220 mm inward from their centreline, giving approximately 460 mm from the outer wall face to glass. Openings respond to bedroom, bathroom, cinema and study uses. Bathroom side windows are high-level, including the one facing the private west loggia. These visual privacy measures are not certified security or ventilation specifications.

The study stays on the ground floor. A **4.8 m wide, 3.65 m high framed opening** replaces the former foyer-to-private-wing door, revealing the existing return stair. The bedroom privacy door is moved across the hall beyond the stair approach. The living media spine and direct social route remain intact. General interior styling is deferred: only furniture obstructing new doors/windows was moved, and the narrower family lounge retains one sofa to keep its entrance clear.

## Named dimensions and room schedule

Coordinates are metres: Y up, +Z toward the rear garden. Reference north is +Z; survey orientation is unresolved. `LEVEL`, `SITE`, `FRONT` and `ARCH` in `src/plan.ts` are the primary dimensions. Room sizes below are nominal modules, before wall/finish deductions; bedroom areas include ensuite/storage.

| Element | Nominal dimension |
| --- | --- |
| Square-acre assumption | 63.61 × 63.61 m; 4,046.8564 m² |
| Main wing envelope | X −15 to +17; front volume Z −6.8, veranda/frame to −8; rear to +20 and balconies beyond |
| Exterior / ground / upper / roof finished floors | −0.75 / 0 / 4.2 / 8.4 m |
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
| Detached garage / pool water | 9 m E–W × 12 m N–S / 11.5 × 4 m |
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

The source uses shared wall/opening/door/slab/loggia components, metre-based repeating textures and three thin-instanced vegetation buffers and plan-derived destinations. `ENVELOPE` holds the facade depths, loggia bounds, foyer opening and stair tower dimensions; `sideWalls` schedules the authored elevations. Balcony posts, portico piers and rooftop pavilion supports express structural intent. Wall thicknesses, slab spans, connections, foundations, lateral stability and the living-roof span require a structural engineer; the visualization is not a construction detail.

## Rendering diagnosis and verification scope

The current review is [IVORY_REVIEW.md](IVORY_REVIEW.md). Its screenshots come from the running Babylon.js application. The approved-front camera, a separate walking-height front view, both full side elevations, rear, top, night and plain-material views are reproducible with `tooling/ivory-review.mjs`. Earlier before/after captures in `EXTERIOR_REVIEW.md` describe the previous design and remain historical records.

The current pass separates lawn from paving, explicitly repeats the small authored textures, and projects box UVs in metres on each face. Travertine courses and stone pavers are intentional surface patterns; stretched texture edge pixels and overlapping floor bands are not. The pool terrace has a real opening and coping ring, keeping the water visible below deck level. Indoor plates remain disjoint, finishes remain decorative, and collision boundaries follow the actual door leaves and architectural openings.

The retained directional shadow source uses a 1024-pixel map, fitted caster depth bounds, tight projection padding, back-face casting, tuned bias and medium PCF filtering. The cap of four nearest local lights and existing performance presets remain. Tropical foliage is repeated with three thin-instanced mesh buffers, opaque materials and no new foliage shadow casters. Small step, wall and garden lights share emitter materials. Fine shadow aliasing and transparent-surface ordering remain possible.

Nine programmatic test groups check the six-suite schedule, court and living voids, disjoint plates, every opened doorway, flat social route, all four indoor flights and landings in both directions, loggia guards, foyer-to-stair route and connectivity to rooms, bathrooms, dressing room, pantry, balconies and rooftop. They also check both exterior flights, paired entrance leaves, garage approaches and the unobstructed single-surface forecourt. These geometry checks are distinct from inspecting rendered views and sending keyboard events through the actual application. Browser results and their limits are in the README and `views/browser-check.json`.

## Privacy, climate and later professional verification

Selective, recessed street openings and the absence of an external stair to the upper floors or a projecting street bedroom balcony support privacy. The high boundary wall and detached garage do not establish a security rating. The entrance remains visible from the approach. Larger openings face protected gardens and the internal court.

Rendered windows are currently fixed. Operable ventilation, insect screens, cross-ventilation, safe bedroom escape, fire strategy, security glazing, hardware and guard details must be designed and checked locally. Fewer windows alone are not assumed to make the house secure. Verify the actual Ugandan boundary, access, orientation, setbacks, climate, rain protection, drainage, roof falls/waterproofing, service spaces and approvals with local professionals.

Furniture, planting, water, mirrors and the avatar remain simplified procedural geometry. Licensed optimized GLB assets, authored materials and baked lighting are later visual refinements. No large remote models load at startup. Target-device Retina performance, pointer lock and touch gestures still require manual verification. This is an editable architectural visualization, not a photorealistic asset pack or approved engineering/permit drawing.
