## Revised cost plan — 17 November 2026

Open `/cost` on Vercel, or `/cost-estimate.html` when serving the repository root locally. The viewer includes a **Cost estimate & budget** link.

- The cost brief is **five storeys, 40 homes, one five-stop elevator, 2,900 m² GFA and a 2,500 m² site**. Rooftop planting is excluded; an insulated roof and PV remain. The 3D viewer now displays an unplanted roof with a schematic lift overrun.
- `cost-data.js` contains 106 direct line items (including two zero-quantity roof exclusions), dated price sources, and the scenario calculation. Nine calculated indirect items bring the schedule to 115 lines.
- `cost-estimate.html` and `cost-estimate.js` display A–F totals, low/expected/high ranges, apartment interiors, green premium/payback, source register, Excel-compatible CSV/clipboard exports and a savings calculator. No external JavaScript dependencies are required by the cost page.
- Base unit rates are net of VAT. The estimate adds VAT once and shows explicit contingency, escalation and financing bases. Unquoted allowances are identified; source listings are not firm tenders.
- Run `node verify-cost.mjs` from the repository root. Run `node 3d-model/verify-site.mjs` for scene checks (requires Three.js CDN access or a local r128 file argument).
- The older Python/OBJ/JSON export and the viewer's 4,176 m² civil plot remain legacy design references, **not cost take-off sources**. The older project description below is historical and does not override this revised cost brief.

---

# 🏗️ Green Apartment Building — Interactive 3D Model

> **Circular Economy ECON330 — Design Charrette (HW2)**  
> Sustainable, affordable, replicable housing for Uzbekistan's regional cities

![License](https://img.shields.io/badge/license-MIT-green)
![Three.js](https://img.shields.io/badge/Three.js-r128-blue)
![Python](https://img.shields.io/badge/Python-3.x-yellow)

---

## 🌐 Live Demo

Open `index.html` via a local server to explore the interactive 3D model:

```bash
cd 3d-model
python -m http.server 8080
# Open http://localhost:8080
```

## ✨ Features

- **Interactive 3D visualization** built with Three.js (WebGL)
- **Samarkand time slider** for sun position and shadows on the current local date, with Day and Night shortcuts
- **8 clickable green features** with animated camera focus and detailed stats
- **OBJ export** — importable into Blender, SketchUp, AutoCAD
- **Python generator** — programmatic 3D model and specs creation

## 🏢 Building Design

| Parameter | Value |
|-----------|-------|
| **Type** | U-shaped apartment with central courtyard |
| **Dimensions** | 36m × 14m × 12m (4 floors) |
| **Units** | 48 apartments |
| **Structure** | Reinforced concrete frame (seismic) |
| **Walls** | 380mm brick + 120mm mineral wool (R-3.5) |
| **Windows** | Double-glazed Low-E, U=1.1 W/m²·K |

## 🌿 Green Features

| Feature | Specification |
|---------|---------------|
| ☀️ **Solar PV** | 30 kW → 45,000 kWh/yr, −22t CO₂/yr |
| 🌱 **Green Roof** | 200 m² extensive (sedum), −3–5°C cooling |
| 🌳 **Courtyard** | Hovli-inspired garden with deciduous trees |
| 💧 **Rainwater** | 15,000L cistern, 85,000 L/yr capture |
| 🔄 **Greywater** | Biofilter recycling, 35% water savings |
| 💨 **Ventilation** | Cross + stack effect, 40% cooling reduction |
| 🏗️ **Shading** | Horizontal louvers (S), vertical fins (E/W) |
| 🌿 **Landscaping** | 85% native plants, permeable paving, bioswales |

## ♻️ Circular Economy Principles

1. Local materials (fired brick, stone) — minimal transport emissions
2. Modular design — disassemble and reuse components
3. Durable construction — 80+ year lifespan
4. Closed water loop — rainwater + greywater recycling
5. Community gardens — local food production
6. Renewable energy — rooftop solar generation
7. Biodiversity — green roof + native landscaping
8. Passive cooling — natural ventilation
9. Replicable design — adaptable across Uzbekistan

## 📁 Project Structure

```
├── 3d-model/
│   ├── index.html            # Interactive 3D viewer (Three.js)
│   ├── building.js           # 3D scene, geometry, UI logic
│   ├── generate_model.py     # Python OBJ/JSON generator
│   ├── green_building.obj    # Wavefront 3D model (1,548 verts)
│   ├── building.mtl          # Material definitions
│   └── building_specs.json   # Full technical specifications
└── Green Home Design Charrette project_.docx.pdf  # Assignment brief
```

## 🛠️ Tech Stack

- **Three.js** (r128) — WebGL 3D rendering
- **Python** — OBJ model generation & specs
- **HTML/CSS** — Responsive UI overlays
- **Wavefront OBJ** — Standard 3D interchange format

## 📋 How to Use

### Interactive Viewer
1. Start a local server: `python -m http.server 8080`
2. Open `http://localhost:8080` in your browser
3. Use mouse to orbit, zoom, and pan
4. Click feature buttons to explore green building elements

### Regenerate OBJ Model
```bash
cd 3d-model
python generate_model.py
```

### Import into 3D Software
The `green_building.obj` file can be imported into Blender, SketchUp, AutoCAD, or any 3D modeling application.

---

## 📝 License

MIT License — Free to use, modify, and distribute.

## 👤 Author

**Umidjon-24** — Circular Economy ECON330, New Uzbekistan University


## Civil / Landscape layer

The interactive viewer now includes a **72 ? 58 m concept plot** (4,176 m?), with north along -Z and east along +X. The existing five-storey building geometry and its site orientation are retained. Plot dimensions are a design assumption, not a surveyed boundary.

- Car-free community courtyard south of the entrance: 8 ? 7 m play area, four benches, shade trees and shared planting.
- Deciduous south/west trees, mulched low planting and no large lawns.
- Connected 2 m pedestrian routes, entrance plaza, six cycle stands and a street-side bus stop.
- Six permeable parking bays on the east edge, including a wider end bay with a transfer strip; vehicles enter from the street along the east-edge aisle.
- An 18 m planted rain garden beside parking, runoff arrows, cistern overflow and two separate reuse tanks. Blue pipes connect the roof, 15 m³ rain tank and toilet supply. Green pipes connect the bathroom drains, greywater treatment tank and courtyard drip lines. The exposed pipes illustrate normally buried connections.
- A screened waste-sorting and covered compost point at the courtyard service edge.

Use **Site Plan** in the camera controls for a north-up orthographic drawing with labels, boundary dimensions, legend and a metre-based scale bar. Pan and zoom remain available; rotation is locked in plan. **3D View** restores orbit controls. All eight original feature buttons remain, alongside eight civil highlights. Clicking site geometry also opens its feature explanation. Escape closes the explanation and restores materials.

For a presentation: start with Site Plan, explain the courtyard and pedestrian route, then parking and the rain garden. Return to 3D View for trees, play equipment and the visible water connection. The new layer is in `3d-model/civil-site.js`; the existing OBJ export and Python generator have not been extended with this layer.

### Verification

Run `node verify-site.mjs` from `3d-model/` with Node 18+ and network access, or pass a local Three.js r128 file as its first argument. Checks use actual Three.js geometry/math with stubbed DOM, renderer and orbit input: scene creation, all 16 highlights and restoration, plan/perspective transitions, portrait/landscape camera fitting and time-dependent sun direction. This is not a substitute for browser/WebGL visual inspection.

Drainage capacity, infiltration, local plant selection, accessible parking dimensions and emergency/service access require site-specific design verification before construction.
