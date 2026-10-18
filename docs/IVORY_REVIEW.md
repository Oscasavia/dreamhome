# Approved ivory mansion — implementation review

This stage implements the user's **Ivory mansion with rotated garage** image. It replaces the earlier roundabout and front-facing garage arrangement. The screenshots linked below are captures of the running Babylon.js application, not generated images.

The front combines a substantial pale travertine wing, two narrow lower windows, an inset upper balcony, a dark illuminated vertical recess, a deep walnut-lined ivory entrance frame, paired dark walnut doors and a raised veranda. The right wing stays quieter; occupied side loggias and sheltered garden balconies extend the same materials around the house. The six-suite plan, internal courtyard, double-height living room, return stairs and roof terrace remain.

## Current browser views

| View | Actual application capture |
| --- | --- |
| Reference-composition camera, day | [Front](views/ivory/approved-front.png) |
| Same camera, night | [Night](views/ivory/approved-front-night.png) |
| Front at walking height | [Pedestrian approach](views/ivory/walking-front.png) |
| Entrance steps and veranda | [Veranda](views/ivory/veranda.png) |
| Front-left | [Front-left](views/ivory/front-left.png) |
| Full west and east elevations | [West](views/ivory/west.png) · [East](views/ivory/east.png) |
| Rear and pool | [Rear](views/ivory/rear.png) |
| Garage orientation and whole site | [Top view](views/ivory/top.png) · [Garage doors](views/ivory/garage.png) |
| Retained internal spaces | [Courtyard](views/ivory/courtyard.png) · [Living overlook](views/ivory/living-overlook.png) |
| Foyer toward stair | [Stair approach](views/ivory/foyer-stair.png) |
| Floor-plan overview | [Ground and upper](views/floor-plans.png) |
| Diagrammatic site plan | [Site](views/site-plan.svg) |

The final front/day/night, walking approach, west, east, rear/pool, garage, top, courtyard, living overlook, foyer/stair, plain-material and paired-plan captures were visually inspected. Camera positions and projection settings are recorded in [review.json](views/ivory/review.json). The saved **Approved front composition** camera is elevated to include the front composition and all three garage bays; **Front at walking height** uses an eye height of 1.65 m above exterior grade. Side elevations and the site view are orthographic. Interface overlays are hidden for captures.

## Reference interpretation and deliberate differences

Image dimensions are assumptions, not surveyed information. Interior finished floors remain 0 / 4.2 / 8.4 m. Exterior grade is −0.75 m. The front flight is 8.2 m wide with five 150 mm risers and 480 mm treads, joining the veranda and foyer at 0 m. A separate five-riser garden flight joins the rear terrace to the lower garden. The walkway simulation uses continuous ramps derived from the same step dimensions.

The detached garage is 9 m east–west by 12 m north–south at X 21–30, Z −18 to −6. All three door planes face west at X 21.08, with bay centres Z −16 / −12 / −8; vehicles approach along +X. Its short south end is solid. The paved apron gives 8 m nominal depth in front of the doors, and the garage remains at least 4 m east of the mansion's eastern wall. Vehicle turning radii are not simulated. The open forecourt contains no roundabout disc, island, curb or central tree.

The roof stair housing remains visible behind the left front volume to preserve usable stair headroom and weather shelter. The retained interior plan gives the entrance gallery more glazing than the reference. Furniture, foliage, stone and paving are lightweight procedural approximations. There is no reference car, photographic tropical backdrop, physically simulated sunset or offline-render lighting. This is a navigable interpretation of the approved architecture, not a pixel-identical or photorealistic reconstruction.

## Rendering and movement corrections

The initial live review exposed two distinct defects: coplanar lawn and forecourt surfaces, and clamped procedural textures that stretched edge pixels into bands. The lawn now excludes hardscape and textures explicitly repeat using metre-based box UVs. Side-face UVs are projected from vertex positions to keep stone courses horizontal. The pool uses an actual coping ring and cut-out terrace with visible water below deck level. The front stone roof edge is trimmed around the roof stair enclosure so it cannot obstruct the last flight. The veranda foundation collider is omitted only beneath the supported front step mouth, avoiding a collision before the ramp reaches the interior datum. Paired entrance leaves share one interaction and have handles on both faces.

The foliage uses three thin-instanced mesh buffers, opaque leaf materials and no additional foliage shadow casters. Small warm fixtures share emissive materials. The existing 1024-pixel directional shadow map, four-nearest-local-light limit and quality scaling remain. [Shadow-disabled](views/ivory/diagnostic-no-shadows.png), [texture-disabled](views/ivory/diagnostic-no-shadows-no-textures.png) and [plain-material](views/ivory/plain-materials.png) captures help distinguish geometry from shading. Fine shadow aliasing and transparency ordering remain limitations.

## Verification

Programmatic geometry tests are separate from inspecting screenshots and exercising the application. `npm ci`, all nine `npm test` groups and `npm run build` passed for this stage. The nine test groups cover the retained space schedule and voids; nonoverlapping floor plates; every open door; social circulation; all four indoor flights and both landings in both directions; connectivity to rooms, ensuites, closet, pantry, balconies and roof; loggia guards; direct foyer-to-stair access; both exterior flights; paired entrance leaves; west-to-east garage approaches and single-surface, unobstructed forecourt.

The browser review script dispatches real keyboard events through the normal application movement loop for doors, gates, exterior and indoor stairs, social/private routes, both camera modes, lighting, day/night and quality presets. The machine-readable result is [browser-check.json](views/browser-check.json). All 40 leaves/gates passed, as did both exterior flights, four indoor flights, return landings, roof exit, social/private routes and both camera modes. Its short headless-browser frame timing is not a Retina or M4 MacBook Air performance certification. Pointer lock, physical touch gestures and sustained target-device performance still require manual checks.

Structure, waterproofing, drainage, guard design, ventilation, emergency escape, security glazing/hardware, actual boundary/orientation and local Ugandan requirements need professional verification. No claim of security compliance follows from the amount of glass. The original square-acre site remains a provisional assumption.
