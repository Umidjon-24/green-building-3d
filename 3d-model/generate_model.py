"""
Green Apartment Building - 3D Model Generator
Circular Economy ECON330 - Design Charrette
Generates OBJ 3D model file and building specifications

Sustainable apartment building for Uzbekistan's regional cities
"""

import math
import json
import os

# ============================================================
# Building Parameters
# ============================================================
class BuildingSpec:
    """Complete building specification for the green apartment design."""
    
    # Dimensions (meters)
    WIDTH = 36          # East-West (long axis)
    DEPTH = 14          # North-South
    FLOOR_HEIGHT = 3.0  # Per floor
    FLOORS = 4          # Residential floors (no elevator required for ≤5 in Uzbekistan)
    TOTAL_HEIGHT = FLOORS * FLOOR_HEIGHT  # 12m
    
    # Courtyard
    COURTYARD_WIDTH = 12
    COURTYARD_DEPTH = 8
    
    # Units
    ENTRANCES = 3
    UNITS_PER_FLOOR_PER_ENTRANCE = 4
    TOTAL_UNITS = ENTRANCES * UNITS_PER_FLOOR_PER_ENTRANCE * FLOORS  # 48
    
    # Wall construction
    BRICK_THICKNESS = 0.38     # 380mm fired clay brick
    INSULATION_THICKNESS = 0.12  # 120mm mineral wool
    TOTAL_WALL_THICKNESS = BRICK_THICKNESS + INSULATION_THICKNESS  # 500mm
    
    # Windows
    WINDOW_WIDTH = 1.4
    WINDOW_HEIGHT = 1.8
    WINDOW_RECESS = 0.3   # Deep recess for shading
    WWR = 0.22             # Window-to-wall ratio (22%)
    
    # Energy specs
    WALL_R_VALUE = 3.5     # m²·K/W
    ROOF_R_VALUE = 5.0     # m²·K/W
    WINDOW_U_VALUE = 1.1   # W/m²·K (double-glazed Low-E)
    
    # Solar
    SOLAR_PANEL_AREA = 150    # m²
    SOLAR_CAPACITY_KW = 30    # kW
    ANNUAL_SOLAR_OUTPUT = 45000  # kWh
    
    # Water
    CISTERN_VOLUME_L = 15000
    ANNUAL_RAINFALL_CAPTURE_L = 85000
    WATER_SAVINGS_PERCENT = 35
    
    # Green roof
    GREEN_ROOF_AREA = 200  # m²
    SUBSTRATE_DEPTH = 0.10  # m


# ============================================================
# OBJ File Generator
# ============================================================
class OBJGenerator:
    """Generates a Wavefront OBJ 3D model of the building."""
    
    def __init__(self):
        self.vertices = []
        self.normals = []
        self.faces = []
        self.materials = {}
        self.current_material = None
        self.vertex_count = 0
        self.groups = []
    
    def add_vertex(self, x, y, z):
        """Add a vertex and return its 1-based index."""
        self.vertices.append((x, y, z))
        self.vertex_count += 1
        return self.vertex_count
    
    def add_box(self, cx, cy, cz, w, h, d, group_name="default"):
        """Add a box centered at (cx, cy, cz) with width, height, depth."""
        hw, hh, hd = w/2, h/2, d/2
        
        # 8 vertices of the box
        verts = [
            (cx-hw, cy-hh, cz+hd),  # 0: front-bottom-left
            (cx+hw, cy-hh, cz+hd),  # 1: front-bottom-right
            (cx+hw, cy+hh, cz+hd),  # 2: front-top-right
            (cx-hw, cy+hh, cz+hd),  # 3: front-top-left
            (cx-hw, cy-hh, cz-hd),  # 4: back-bottom-left
            (cx+hw, cy-hh, cz-hd),  # 5: back-bottom-right
            (cx+hw, cy+hh, cz-hd),  # 6: back-top-right
            (cx-hw, cy+hh, cz-hd),  # 7: back-top-left
        ]
        
        base = self.vertex_count + 1
        for v in verts:
            self.add_vertex(*v)
        
        # 6 faces (quads)
        faces = [
            (0, 1, 2, 3),  # front
            (5, 4, 7, 6),  # back
            (4, 0, 3, 7),  # left
            (1, 5, 6, 2),  # right
            (3, 2, 6, 7),  # top
            (0, 4, 5, 1),  # bottom
        ]
        
        self.groups.append(group_name)
        for face in faces:
            self.faces.append((
                base + face[0],
                base + face[1],
                base + face[2],
                base + face[3],
                group_name
            ))
    
    def add_cylinder(self, cx, cy, cz, radius, height, segments=8, group_name="default"):
        """Add a cylinder centered at (cx, cy, cz)."""
        base = self.vertex_count + 1
        
        # Bottom center
        self.add_vertex(cx, cy - height/2, cz)
        # Top center
        self.add_vertex(cx, cy + height/2, cz)
        
        # Bottom ring
        for i in range(segments):
            angle = 2 * math.pi * i / segments
            x = cx + radius * math.cos(angle)
            z = cz + radius * math.sin(angle)
            self.add_vertex(x, cy - height/2, z)
        
        # Top ring
        for i in range(segments):
            angle = 2 * math.pi * i / segments
            x = cx + radius * math.cos(angle)
            z = cz + radius * math.sin(angle)
            self.add_vertex(x, cy + height/2, z)
        
        # Side faces (quads)
        self.groups.append(group_name)
        for i in range(segments):
            next_i = (i + 1) % segments
            # bottom ring starts at base+2, top ring at base+2+segments
            b1 = base + 2 + i
            b2 = base + 2 + next_i
            t1 = base + 2 + segments + i
            t2 = base + 2 + segments + next_i
            self.faces.append((b1, b2, t2, t1, group_name))
    
    def generate_obj(self, filename):
        """Write the OBJ file."""
        with open(filename, 'w') as f:
            f.write("# Green Apartment Building - Uzbekistan\n")
            f.write("# Circular Economy ECON330 Design Charrette\n")
            f.write(f"# Vertices: {len(self.vertices)}\n")
            f.write(f"# Faces: {len(self.faces)}\n\n")
            f.write(f"mtllib building.mtl\n\n")
            
            # Vertices
            for v in self.vertices:
                f.write(f"v {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n")
            
            f.write("\n")
            
            # Faces grouped
            current_group = None
            for face in self.faces:
                group = face[4]
                if group != current_group:
                    f.write(f"\ng {group}\n")
                    current_group = group
                f.write(f"f {face[0]} {face[1]} {face[2]} {face[3]}\n")
    
    def generate_mtl(self, filename):
        """Write a basic MTL material file."""
        materials = {
            "brick": (0.72, 0.45, 0.29),
            "concrete": (0.83, 0.79, 0.72),
            "window": (0.42, 0.64, 0.74),
            "solar_panel": (0.10, 0.14, 0.49),
            "green_roof": (0.33, 0.55, 0.18),
            "metal": (0.47, 0.57, 0.60),
            "wood": (0.49, 0.35, 0.25),
            "water": (0.31, 0.76, 0.97),
            "ground": (0.77, 0.72, 0.59),
            "tree_trunk": (0.36, 0.30, 0.25),
            "tree_canopy": (0.22, 0.56, 0.24),
        }
        
        with open(filename, 'w') as f:
            f.write("# Green Apartment Building Materials\n\n")
            for name, (r, g, b) in materials.items():
                f.write(f"newmtl {name}\n")
                f.write(f"Kd {r:.3f} {g:.3f} {b:.3f}\n")
                f.write(f"Ka {r*0.2:.3f} {g*0.2:.3f} {b*0.2:.3f}\n")
                f.write(f"Ks 0.1 0.1 0.1\n")
                f.write(f"Ns 10.0\n")
                f.write(f"d 1.0\n\n")


def generate_building():
    """Generate the complete 3D building model."""
    spec = BuildingSpec()
    gen = OBJGenerator()
    
    print("=" * 60)
    print("GREEN APARTMENT BUILDING - 3D MODEL GENERATOR")
    print("Circular Economy ECON330 - Uzbekistan Regional Cities")
    print("=" * 60)
    
    # ---- Main Building Structure ----
    print("\n📐 Generating building structure...")
    
    # Left wing
    gen.add_box(
        -spec.WIDTH/2 + spec.DEPTH/2, spec.TOTAL_HEIGHT/2, 0,
        spec.DEPTH, spec.TOTAL_HEIGHT, spec.DEPTH,
        "building_left_wing"
    )
    
    # Right wing
    gen.add_box(
        spec.WIDTH/2 - spec.DEPTH/2, spec.TOTAL_HEIGHT/2, 0,
        spec.DEPTH, spec.TOTAL_HEIGHT, spec.DEPTH,
        "building_right_wing"
    )
    
    # Back connecting block
    gen.add_box(
        0, spec.TOTAL_HEIGHT/2, -spec.DEPTH/2,
        spec.WIDTH, spec.TOTAL_HEIGHT, spec.DEPTH/2,
        "building_back_block"
    )
    
    # ---- Floor Slabs ----
    print("🏗️ Adding floor slabs...")
    for f in range(1, spec.FLOORS + 1):
        gen.add_box(
            0, f * spec.FLOOR_HEIGHT, 0,
            spec.WIDTH + 0.4, 0.15, spec.DEPTH + 0.4,
            "floor_slab"
        )
    
    # ---- Windows ----
    print("🪟 Adding windows...")
    for f in range(spec.FLOORS):
        y = f * spec.FLOOR_HEIGHT + spec.FLOOR_HEIGHT * 0.55
        
        # South facade windows
        for w in range(8):
            x = -spec.WIDTH/2 + 3 + w * 4
            gen.add_box(x, y, spec.DEPTH/2 + 0.01, 
                       spec.WINDOW_WIDTH, spec.WINDOW_HEIGHT, 0.05,
                       "windows")
        
        # North facade windows
        for w in range(8):
            x = -spec.WIDTH/2 + 3 + w * 4
            gen.add_box(x, y, -spec.DEPTH - 0.01,
                       spec.WINDOW_WIDTH, spec.WINDOW_HEIGHT, 0.05,
                       "windows")
    
    # ---- Solar Panels ----
    print("☀️ Adding solar panels...")
    roof_y = spec.TOTAL_HEIGHT + 0.3
    for row in range(5):
        for col in range(8):
            gen.add_box(
                -spec.WIDTH/2 + 3 + col * 4, roof_y + 0.5,
                -spec.DEPTH/4 + row * 2.2,
                1.7, 0.05, 1.0,
                "solar_panels"
            )
    
    # ---- Green Roof ----
    print("🌱 Adding green roof...")
    gen.add_box(
        0, spec.TOTAL_HEIGHT + 0.08, -spec.DEPTH/2,
        spec.WIDTH - 4, 0.12, spec.DEPTH/2 - 2,
        "green_roof"
    )
    
    # ---- Courtyard ----
    print("🌳 Adding courtyard...")
    gen.add_box(0, 0.04, 0, spec.COURTYARD_WIDTH, 0.08, spec.COURTYARD_DEPTH, "courtyard")
    
    # Fountain
    gen.add_cylinder(0, 0.3, 0, 1.2, 0.5, 12, "fountain")
    
    # ---- Rainwater cistern ----
    print("💧 Adding water system...")
    gen.add_cylinder(spec.WIDTH/2 + 5, -0.5, -3, 2, 2.5, 12, "water_cistern")
    
    # ---- Shading devices ----
    print("🏗️ Adding shading devices...")
    for f in range(spec.FLOORS):
        y = f * spec.FLOOR_HEIGHT + spec.FLOOR_HEIGHT * 0.55 + 1.1
        for w in range(8):
            x = -spec.WIDTH/2 + 3 + w * 4
            gen.add_box(x, y, spec.DEPTH/2 + 0.3, 1.8, 0.04, 0.5, "shading_louvers")
    
    # ---- Balconies ----
    print("🏠 Adding balconies...")
    for f in range(1, spec.FLOORS):
        y = f * spec.FLOOR_HEIGHT + 0.15
        gen.add_box(-spec.WIDTH/2 + spec.DEPTH/2, y, spec.DEPTH/2 + 1.5,
                    6, 0.18, 2, "balconies")
        gen.add_box(spec.WIDTH/2 - spec.DEPTH/2, y, spec.DEPTH/2 + 1.5,
                    6, 0.18, 2, "balconies")
    
    # ---- Entrance canopy ----
    print("🚪 Adding entrance...")
    gen.add_box(0, spec.FLOOR_HEIGHT - 0.3, spec.DEPTH/2 + 2, 8, 0.2, 4, "entrance_canopy")
    
    # ---- Trees ----
    print("🌲 Adding landscaping...")
    tree_positions = [
        (-20, 0, 16), (-14, 0, 16), (-8, 0, 15), (8, 0, 15), (14, 0, 16), (20, 0, 16),
        (22, 0, 8), (22, 0, 0), (22, 0, -8),
        (-22, 0, 8), (-22, 0, 0), (-22, 0, -8),
    ]
    for i, (tx, ty, tz) in enumerate(tree_positions):
        # Trunk
        gen.add_cylinder(tx, ty + 1.5, tz, 0.15, 3, 6, "tree_trunks")
        # Canopy
        gen.add_box(tx, ty + 4, tz, 3, 3, 3, "tree_canopies")
    
    # ---- Ground plane ----
    gen.add_box(0, -0.05, 0, 80, 0.1, 60, "ground")
    
    # ---- Road ----
    gen.add_box(0, 0.02, 25, 80, 0.04, 8, "road")
    
    # ---- Write files ----
    output_dir = os.path.dirname(os.path.abspath(__file__))
    
    obj_path = os.path.join(output_dir, "green_building.obj")
    mtl_path = os.path.join(output_dir, "building.mtl")
    
    gen.generate_obj(obj_path)
    gen.generate_mtl(mtl_path)
    
    print(f"\n✅ OBJ file generated: {obj_path}")
    print(f"✅ MTL file generated: {mtl_path}")
    print(f"   Vertices: {len(gen.vertices)}")
    print(f"   Faces: {len(gen.faces)}")
    
    return gen


def generate_specs_json():
    """Generate a JSON file with complete building specifications."""
    spec = BuildingSpec()
    
    data = {
        "project": {
            "name": "Green Apartment Building for Uzbekistan",
            "course": "Circular Economy ECON330",
            "type": "Design Charrette - Homework Assignment 2",
            "location": "Regional cities of Uzbekistan (Bukhara, Samarkand, Namangan, etc.)",
            "climate": "Continental - Hot dry summers (40°C+), cold winters (-15°C)"
        },
        "building": {
            "type": "U-shaped apartment building with central courtyard",
            "floors": spec.FLOORS,
            "total_units": spec.TOTAL_UNITS,
            "entrances": spec.ENTRANCES,
            "dimensions": {
                "width_m": spec.WIDTH,
                "depth_m": spec.DEPTH,
                "floor_height_m": spec.FLOOR_HEIGHT,
                "total_height_m": spec.TOTAL_HEIGHT,
                "gross_floor_area_m2": spec.WIDTH * spec.DEPTH * spec.FLOORS,
                "courtyard_m2": spec.COURTYARD_WIDTH * spec.COURTYARD_DEPTH
            },
            "apartment_sizes": {
                "1_room_m2": "30-35",
                "2_room_m2": "45-55",
                "3_room_m2": "60-75"
            }
        },
        "construction": {
            "structure": "Reinforced concrete frame (seismic-resistant)",
            "walls": f"{int(spec.BRICK_THICKNESS*1000)}mm fired clay brick + {int(spec.INSULATION_THICKNESS*1000)}mm mineral wool",
            "total_wall_thickness_mm": int(spec.TOTAL_WALL_THICKNESS * 1000),
            "roof": "Flat RC slab + waterproofing + 200mm insulation + green roof layers",
            "exterior_finish": "Light-colored cementitious plaster (cream/beige)",
            "courtyard_paving": "Local stone / permeable pavers"
        },
        "energy_efficiency": {
            "wall_R_value": f"R-{spec.WALL_R_VALUE} m²·K/W",
            "roof_R_value": f"R-{spec.ROOF_R_VALUE} m²·K/W",
            "window_U_value": f"{spec.WINDOW_U_VALUE} W/m²·K",
            "window_type": "Double-glazed Low-E argon-filled",
            "window_to_wall_ratio": f"{int(spec.WWR*100)}%",
            "window_recess_mm": int(spec.WINDOW_RECESS * 1000),
            "ventilation": "Cross-ventilation + stack effect via stairwell",
            "shading": {
                "south": "Horizontal louvers (600-800mm projection)",
                "east_west": "Vertical fins / perforated screens (panjara-inspired)",
                "balconies": "South-facing overhangs providing shade"
            }
        },
        "renewable_energy": {
            "solar_PV": {
                "capacity_kW": spec.SOLAR_CAPACITY_KW,
                "panel_area_m2": spec.SOLAR_PANEL_AREA,
                "annual_output_kWh": spec.ANNUAL_SOLAR_OUTPUT,
                "CO2_reduction_tonnes_year": 22,
                "payback_years": "6-8"
            },
            "solar_hot_water": {
                "type": "Evacuated tube collectors",
                "coverage": "60% of domestic hot water demand"
            }
        },
        "water_systems": {
            "rainwater_harvesting": {
                "cistern_volume_L": spec.CISTERN_VOLUME_L,
                "annual_capture_L": spec.ANNUAL_RAINFALL_CAPTURE_L,
                "uses": ["Toilet flushing", "Landscape irrigation"]
            },
            "greywater_recycling": {
                "sources": ["Sinks", "Showers"],
                "treatment": "Biofilter system",
                "reuse": "Landscape irrigation",
                "water_savings_percent": spec.WATER_SAVINGS_PERCENT
            }
        },
        "green_roof": {
            "type": "Extensive (sedum/drought-resistant plants)",
            "area_m2": spec.GREEN_ROOF_AREA,
            "substrate_depth_mm": int(spec.SUBSTRATE_DEPTH * 1000),
            "benefits": [
                "3-5°C cooling effect",
                "60-70% stormwater retention",
                "R-2.5 additional insulation",
                "Extended roof lifespan (2×)",
                "Urban heat island reduction"
            ]
        },
        "landscaping": {
            "courtyard": {
                "trees": "4 deciduous shade trees",
                "water_feature": "Recirculating fountain",
                "community_gardens": "8 raised beds",
                "seating": "Shaded benches"
            },
            "perimeter": {
                "native_plants_percent": 85,
                "fruit_trees": ["Pomegranate", "Apricot", "Grape vines"],
                "permeable_paving": "All walkways",
                "bioswale_length_m": 25
            }
        },
        "circular_economy_principles": [
            "Local materials (fired brick, local stone) — minimizes transport emissions",
            "Modular design — components can be disassembled and reused",
            "Durable construction — 80+ year building lifespan",
            "Rainwater & greywater recycling — closed water loop",
            "Community gardens — local food production",
            "Solar energy — renewable power generation",
            "Green roof — biodiversity and microclimate benefits",
            "Natural ventilation — reduces mechanical system dependence",
            "Replicable design — can be reproduced across Uzbekistan's cities"
        ],
        "estimated_costs": {
            "note": "Approximate costs in USD for Uzbekistan context",
            "construction_per_m2_USD": "350-500",
            "solar_PV_system_USD": "25,000-35,000",
            "rainwater_system_USD": "5,000-8,000",
            "green_roof_per_m2_USD": "30-50",
            "total_estimated_USD": "800,000-1,200,000",
            "annual_energy_savings_USD": "8,000-12,000",
            "annual_water_savings_USD": "3,000-5,000",
            "simple_payback_years": "8-12 (for green premium)"
        }
    }
    
    output_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(output_dir, "building_specs.json")
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n📋 Specifications JSON: {json_path}")
    return data


def print_summary(specs):
    """Print a human-readable summary of the building."""
    print("\n" + "=" * 60)
    print("BUILDING SUMMARY")
    print("=" * 60)
    
    b = specs["building"]
    d = b["dimensions"]
    print(f"\n🏢 {specs['project']['name']}")
    print(f"   Location: {specs['project']['location']}")
    print(f"   Type: {b['type']}")
    print(f"   Floors: {b['floors']} | Units: {b['total_units']}")
    print(f"   Dimensions: {d['width_m']}m × {d['depth_m']}m × {d['total_height_m']}m")
    print(f"   Gross Floor Area: {d['gross_floor_area_m2']} m²")
    print(f"   Courtyard: {d['courtyard_m2']} m²")
    
    e = specs["energy_efficiency"]
    print(f"\n⚡ Energy Efficiency:")
    print(f"   Wall: {e['wall_R_value']} | Roof: {e['roof_R_value']}")
    print(f"   Windows: {e['window_type']}, U={e['window_U_value']}")
    print(f"   Ventilation: {e['ventilation']}")
    
    s = specs["renewable_energy"]["solar_PV"]
    print(f"\n☀️ Solar Power:")
    print(f"   Capacity: {s['capacity_kW']} kW | Output: {s['annual_output_kWh']:,} kWh/yr")
    print(f"   CO₂ Reduction: {s['CO2_reduction_tonnes_year']} tonnes/year")
    
    w = specs["water_systems"]
    print(f"\n💧 Water Systems:")
    print(f"   Cistern: {w['rainwater_harvesting']['cistern_volume_L']:,} L")
    print(f"   Annual Capture: {w['rainwater_harvesting']['annual_capture_L']:,} L")
    print(f"   Water Savings: {w['greywater_recycling']['water_savings_percent']}%")
    
    g = specs["green_roof"]
    print(f"\n🌱 Green Roof: {g['area_m2']} m² ({g['type']})")
    
    c = specs["estimated_costs"]
    print(f"\n💰 Estimated Cost: ${c['total_estimated_USD']}")
    print(f"   Annual Energy Savings: ${c['annual_energy_savings_USD']}")
    print(f"   Annual Water Savings: ${c['annual_water_savings_USD']}")
    print(f"   Green Premium Payback: {c['simple_payback_years']} years")
    
    print(f"\n♻️ Circular Economy Principles:")
    for i, p in enumerate(specs["circular_economy_principles"], 1):
        print(f"   {i}. {p}")
    
    print("\n" + "=" * 60)


if __name__ == "__main__":
    # Generate 3D model
    generator = generate_building()
    
    # Generate specifications
    specs = generate_specs_json()
    
    # Print summary
    print_summary(specs)
    
    print("\n🌐 To view the interactive 3D model:")
    print("   Open index.html in a web browser (with a local server)")
    print("   Or use: python -m http.server 8080")
    print("   Then navigate to http://localhost:8080")
