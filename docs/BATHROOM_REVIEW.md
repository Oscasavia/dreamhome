# Six ensuites and guest WC — bathroom review

This pass starts from the completed stair implementation, commit `a2032d4`. It retains the main stair, roof stair, social arrangement, internal courtyard, living void, primary dressing room, exterior composition and site. All seven bathrooms now use one dimensioned layout source for fixtures, walls, moving doors, collision, floor finishes, privacy windows, destinations and diagrams.

## Audit and measured schedule

The old `ensuiteRect()` still produced six nominal 3.1 × 3.1 m rectangles, and `bathroom(r)` repeated the same fixtures. After the added 120 mm partitions and exterior-wall intrusion, their effective clear dimensions were approximately 2.95 × 2.98 m, or 8.79 m². The 3.2 m partitions stopped below the structural soffit, some inner wall geometry concealed the exterior window, shower trays were raised, and toilets lacked usable collision bodies. The guest WC had no complete south enclosure. Its old 3 × 2 m label did not establish a finished enclosed room.

All seven were captured before editing: [original geometry schedule](views/bathrooms-before/audit.json) and [Suite 01 example](views/bathrooms-before/suite-1.png). These are historical close-range audit views, not presentations of the new design.

| Room | Before bath, effective clear | New bath, finished clear | New bath area | Dry bedroom before → after |
| --- | --- | --- | ---: | ---: |
| Ground suite 01 | 2.95 × 2.98 m | 3.60 × 3.80 m | 13.68 m² | 71.15 → 65.59 m² |
| Ground suite 02 | 2.95 × 2.98 m | 3.60 × 4.00 m | 14.40 m² | 98.74 → 92.23 m² |
| Upper suite 03 | 2.95 × 2.98 m | 3.20 × 4.00 m | 12.80 m² | 27.02 → 22.49 m² |
| Upper suite 04 | 2.95 × 2.98 m | 3.60 × 3.60 m | 12.96 m² | 47.87 → 43.07 m² |
| Primary | 2.95 × 2.98 m | 5.20 × 4.20 m | 21.84 m² | 81.84 → 67.68 m² |
| Upper suite 05 | 2.95 × 2.98 m | 3.40 × 3.80 m | 12.92 m² | 63.15 → 58.39 m² |
| Guest half-bath | 3 × 2 m nominal, incomplete enclosure | 2.80 × 1.76 m | 4.93 m² | Not applicable |

**Measurement convention:** bathroom dimensions are between finished faces, including the usable floor occupied by fixtures. Dry bedroom area is separate from the combined suite module: internal bedroom floor less the bathroom enclosure, its partitions, fixed wardrobes and, for the primary, the separate dressing-room enclosure. It includes the bed footprint and bedroom circulation; it is not an empty-floor or unobstructed turning-area claim. Both columns use the same method, calculated in `src/bathroomAudit.ts`; [machine-readable schedule](views/bathrooms/schedule.json). No bedroom module is enlarged. The primary closet retains its 5.7 × 3.2 m nominal footprint.

## Layout decisions

- **Suite 01:** expands the rear service corner with a 1.8 m vanity and 1.5 × 1.5 m shower. The large sleeping zone and bed position remain. Its west bedroom opening is shortened to stay wholly outside the new bathroom.
- **Suite 02:** uses the deeper rear wing for a 1.5 × 1.6 m shower and 1.8 m vanity. The bed, wardrobe and rear garden connection retain their positions.
- **Suite 03:** the smallest suite uses a longer 3.2 × 4 m bathroom, 1.5 m vanity, 1.5 × 1.6 m shower, a relocated 2.2 m wardrobe along the front wall and a 1.9 × 2.3 m bed facing the entrance, keeping the nightstands away from the approach. Both bedsides remain reachable, although their approximately 0.6–0.7 m passages are less generous than the other suites. The front balcony remains accessible.
- **Suite 04:** a squarer bath fits behind the retained west loggia entry. The bed moves toward the front and the wardrobe moves against the inner wall, preserving a route to the balcony and bathroom. Vanity 1.5 m; shower 1.5 × 1.5 m.
- **Primary:** the rear-west bathroom has a 2.8 m double vanity, 1.6 × 1.8 m walk-in shower, separate 1.9 × 0.85 m tub, linen tower and 1.44 m-high marble WC screens. It connects through the dry bedroom/dressing vestibule, approximately 0.98 m between the closet enclosure and bathroom front wall. The tub has roughly 1.1 m in front, 0.7 m at the shower-side end and 0.55 m behind; the rear gap is maintenance access, not a generous circulation aisle. The bedroom and separate closet keep their existing doors and bed position.
- **Suite 05:** mirrors the service arrangement on the east garden wall, with a 1.7 m vanity and 1.5 × 1.5 m shower. The existing sleeping area, wardrobe, bedroom window and rear balcony remain usable.
- **Guest WC:** stays in the nominal 3 × 2 m front vestibule, now fully enclosed with a finished ceiling. An inward door parks along the front wall, with the WC on the west and a 1 m vanity on the north. Standing space is shared between the vanity and toilet, appropriate for one occupant. The foyer → cloak lobby → vestibule route avoids bedrooms and the new stair footprint. The offset doorway provides privacy from the entrance and social rooms.

The standard ensuites share a coherent wet/dry relationship but use individually sized enclosures, vanities and shower depths. Rear linen towers partly screen the WC from the vanity side. Exterior bathroom windows have 2.4 m sills; finish geometry is cut around their actual openings. The primary and Suite 05 now have solid rear bathroom walls; the former full-width rear sidelights are shortened to the dry bedrooms, while both balcony doors retain their positions. Existing west-side service corners are retained where practical, but the enlarged primary and offset upper wing will need coordinated service runs. Ceiling extract grilles indicate ventilation intent; the interior guest WC requires mechanical extraction.

## Doors, fixtures and surfaces

Entrance openings are 1.25 m gross with 35 mm jambs and 1.18 m animated leaves. The conservative limiting clear width is **1.065 m**, accounting for the modeled handle projection. All seven doors swing fully through 90° without striking fixed fixtures or shower screens. Each route includes a safe standing position outside the swing before closing the door.

Vanity working envelopes are 1.05 m deep, allowing an assumed 450 mm drawer extension plus approximately 600 mm standing depth. WC front envelopes are 1 m deep and 0.9 m wide. Vanity approaches stay outside shower zones. These are comfort checks, not certification. Cabinets are modeled with drawers and pulls, but drawers do not animate.

Showers use fixed glass screens and **doorless** side entries, avoiding a second door sweep. Standard nominal openings are 1.05 m, approximately 1.032 m between finished glass edges; primary 1.1 m nominal, approximately 1.082 m finished. Screen collision prevents walking through glass. Rain heads, mixer controls, shelves, bottles and linear drains define each wet area.

Toilets have open modeled bowls, seat rings, pedestals, cisterns and flush buttons. Vanities have hollow ceramic basins, taps, usable 600 mm counters (560 mm in the guest WC), storage, trays, mirrors and lighting. The tub has an open bowl and separate filler. Fixtures and beds have real collision rectangles; curved contours and small fittings are simplified.

The shared palette uses satin greige 600 mm floor tiles, ivory 600 × 1,200 mm wall tiles, marble-look shower feature walls and counters, walnut cabinetry and dark bronze fittings. Mirror strips and recessed downlights share each bathroom's light zone. Pressing **L** within a bathroom selects that bathroom. Four nearby real-time local lights remain the maximum.

Finished ceilings sit at 3.76 m. Partitions continue to the 3.96 m slab underside, avoiding exposed gaps. Floors and showers stay at 0 or 4.2 m, with no raised trays or duplicate support surfaces. Linear drains express intent; actual falls and waterproofing are not simulated.

## Plans and actual application views

[Seven bathroom plans](views/bathrooms/plans.png) · [Paired floor plans](views/floor-plans.png) · [Ground SVG](views/ground-plan.svg) · [Upper SVG](views/upper-plan.svg)

| Bathroom | Finished plan | Daytime interior | Vanity | Evening |
| --- | --- | --- | --- | --- |
| Suite 01 | [Plan](views/bathrooms/suite-1-plan.svg) | [View](views/bathrooms/suite-1.png) | [View](views/bathrooms/suite-1-vanity.png) | [View](views/bathrooms/suite-1-night.png) |
| Suite 02 | [Plan](views/bathrooms/suite-2-plan.svg) | [View](views/bathrooms/suite-2.png) | [View](views/bathrooms/suite-2-vanity.png) | [View](views/bathrooms/suite-2-night.png) |
| Suite 03 | [Plan](views/bathrooms/suite-3-plan.svg) | [View](views/bathrooms/suite-3.png) | [View](views/bathrooms/suite-3-vanity.png) | [View](views/bathrooms/suite-3-night.png) |
| Suite 04 | [Plan](views/bathrooms/suite-4-plan.svg) | [View](views/bathrooms/suite-4.png) | [View](views/bathrooms/suite-4-vanity.png) | [View](views/bathrooms/suite-4-night.png) |
| Primary | [Plan](views/bathrooms/master-plan.svg) | [Tub/shower](views/bathrooms/master.png) | [Double vanity](views/bathrooms/master-vanity.png) | [View](views/bathrooms/master-night.png) |
| Suite 05 | [Plan](views/bathrooms/suite-5-plan.svg) | [View](views/bathrooms/suite-5.png) | [View](views/bathrooms/suite-5-vanity.png) | [View](views/bathrooms/suite-5-night.png) |
| Guest WC | [Plan](views/bathrooms/guest-plan.svg) | [View](views/bathrooms/guest.png) | [View](views/bathrooms/guest-vanity.png) | [View](views/bathrooms/guest-night.png) |

These are rendered Babylon.js captures, not generated reference images. The browser review uses normal first-person eye height **1.65 m** and field of view **1.05 radians**. Each bathroom was entered using keyboard movement, its door closed, fixtures approached, shower entered and exited where present, bathroom lights switched off/on, and door reopened for exit. The primary route also reaches the tub's side and rear. Day and evening views were captured for all seven, and all seven daytime interiors were visually inspected. [Bathroom interaction and frame-sample report](views/bathrooms/review.json).

The movement collision model uses a 460 mm-wide avatar footprint; the larger fixture working envelopes are checked separately. Programmatic checks separately test finished area, fixture collisions, dry working envelopes, enclosure, door sweep at one-degree intervals, and route/support continuity at 25 mm intervals. Existing connectivity checks additionally reach both sides and the foot of each bed and the wardrobe fronts. The full estate browser review exercises doors/gates, all stair flights and return landings, roof access, both camera modes, lighting and quality presets: [estate report](views/browser-check.json).

## Reproduction and limitations

Run `npm ci`, `npm test`, `npm run build`, and `node --import tsx tooling/export-plans.ts`. With Vite running and isolated Chrome debugging on port 9222, run `node tooling/bathroom-review.mjs` and then `node tooling/browser-review.mjs`. `node tooling/bathroom-review.mjs --captures-only` refreshes viewpoints/plans without replacing the keyboard-walk report. Both scripts default to Vite port 5174; `DREAMHOME_URL` overrides it. Run the scripts sequentially because they control the same browser page. The before script belongs to the baseline commit and must not overwrite historical captures from the updated implementation.

Fourteen test groups and the production build pass. Short Chrome frame samples cover Balanced day/night and High at 2× scale; they do not establish sustained M4 MacBook Air performance. Mirrors are shaded approximations without real reflections, transparent surfaces can sort imperfectly, and furnishings remain procedural. Pointer lock and touch gestures still require manual device testing. Plumbing routes, ventilation capacity, drainage falls, waterproofing, operable privacy glazing, fixture specifications and Ugandan requirements require professional verification. All measurements are concept geometry, not construction certification.
