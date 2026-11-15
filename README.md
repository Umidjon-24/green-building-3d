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
- **Day / Sunset / Night** lighting modes
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
