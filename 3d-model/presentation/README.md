# Samarkand green apartments · engineering views

Open **Energy Systems** in the 3D viewer. Choose a system, then use the second menu for seasonal rays, the gas-plant comparison, the exploded assembly or the construction stage. Drag to orbit and scroll to inspect equipment. **Reset view** restores the full building at noon.

Each link opens a 1600 × 900 PNG. The source IDs below refer to the [project cost schedule](../../cost-data.js) and its same-size traditional comparator. The [building model](../building.js) supplies the site orientation, existing roof layout and lighting. The [civil model](../civil-site.js) supplies the courtyard and water routes.

| Presentation image | Technology and applicability | Basis and interpretation |
|---|---|---|
| [Winter envelope cutaway](energy-envelope-cutaway.png) | Green facade and roof. A low winter ray enters the recessed south window. | B09, B14, B15, B17, B18, B20, B21, B23. The red arrows locate potential heat paths. Ray angles illustrate seasonal behaviour. |
| [Wall assembly](wall-assembly.png) | Green facade. Window, finish, exterior insulation, AAC and an accessible service zone. | B15–B20. The layer offsets and maintenance clearance are enlarged to make the parts legible. |
| [Summer shading](summer-shading.png) | Green facade. The external horizontal shade intercepts a high ray. | B23 and the model’s south-window louvers. The image illustrates one bay. It does not quantify a cooling saving. |
| [Traditional heating and cooling](heating-cooling-traditional.png) | Same-size traditional comparator. Shared gas boiler plant, tank, radiators and wet-room fan. | C01–C06, C10 and the traditional rate for C11. Room layout and service routes are illustrative. |
| [Green heating and cooling](heating-cooling-green.png) | Green design. Solar heat enters the shared tank. The apartment detail shows natural ventilation and local extraction. | C01–C06, C10–C11 and C15. Two 100 kW boilers are a concept allowance. The plant cutaway does not establish a final room location or peak load. |
| [Water reuse cutaway](water-system.png) | Green design. A rain tank feeds toilets, a separate greywater plant feeds irrigation, and the tap uses potable water. | C07, C19–C24 and E06. The cistern holds 15 m³. The 85 m³/year rainwater and 250 m³/year greywater figures are reuse assumptions. Tank locations and pipe routes require design verification. |
| [Exploded facade and frame](circular-materials-exploded.png) | Green design. Separate facade layers and window units expose the retained five-storey frame. | B06, B09, B15–B20. Offsets and bay spacing illustrate component relationships. AAC partitions are masonry. |
| [Construction sequence](construction-process.png) | Green design shown in three stages. Frame and slabs, then enclosure, then windows and solar equipment. | B06–B09, B15, B18, B26–B28 and C11. This selective erection sequence is an illustration, not a trade programme. |
| [Solar roof layout](solar-roof-layout.png) | Green design. PV on both wings and a separate collector bank on the rear strip. | B26–B28, C11 and the scene layout. The module assumption is 60 × 500 W. Hot-water collector aperture is 20 m². |
| [Full building and courtyard](green-building-full-view.png) | Green design. The five-storey building, roofs, courtyards and access routes in context. | Current 3D building and civil plan. The viewer uses the 72 × 58 m illustrative site. The cost plan uses its separate 2,500 m² site allowance. |

The traditional comparison changes allowances for facade insulation and windows. Product-specific U-values, baseline layer thicknesses, hourly energy results, ground-floor insulation and a heat-pump COP are unspecified. The study views illustrate assembly and operation. The project cost and performance calculations remain in their original sources.

The [adapted implementation prompt](adapted-prompt.md) records the scope. [capture-engineering.cjs](../capture-engineering.cjs) regenerates the images from the viewer using Playwright, a Chromium executable and cached Three.js r128 and OrbitControls scripts.
