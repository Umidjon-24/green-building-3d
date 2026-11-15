// ============================================================
// Green Apartment Building — 3D Model for Uzbekistan
// Circular Economy ECON330 — Design Charrette
// Built with Three.js
// ============================================================

// ---- Scene Setup ----
let scene, camera, renderer, controls;
let buildingGroup, solarPanels, greenRoofGroup, courtyardGroup;
let waterSystemGroup, insulationGroup, ventilationGroup, shadingGroup, landscapeGroup;
let sun, ambientLight, directionalLight, hemisphereLight;
let animationId;
let currentHighlight = null;

// Building dimensions (meters, scaled 1:1 in scene units)
const BUILDING = {
    width: 36,        // East-West (m)
    depth: 14,        // North-South (m)
    floorHeight: 3.2, // per floor
    floors: 5,
    courtyardWidth: 10,
    courtyardDepth: 8,
};
BUILDING.totalHeight = BUILDING.floors * BUILDING.floorHeight;

// Feature information database
const featureData = {
    solar: {
        title: "☀️ Rooftop Solar Panels",
        desc: "30 kW photovoltaic array on south-facing roof slope. Generates ~45,000 kWh/year in Uzbekistan's high solar irradiance (5.5 kWh/m²/day). Covers ~60% of common area electricity and reduces CO₂ by 22 tonnes/year.",
        stats: [
            ["Capacity", "30 kW"],
            ["Annual Output", "~45,000 kWh"],
            ["Panel Area", "180 m²"],
            ["CO₂ Reduction", "22 t/year"],
            ["Payback Period", "6-8 years"]
        ]
    },
    greenroof: {
        title: "🌱 Extensive Green Roof",
        desc: "Sedum and drought-resistant local plant cover over waterproof membrane. Reduces urban heat island effect, provides insulation (R-2.5 added), manages stormwater, and extends roof lifespan by 2×.",
        stats: [
            ["Coverage", "~250 m²"],
            ["Substrate Depth", "80-120 mm"],
            ["Cooling Effect", "3-5°C reduction"],
            ["Stormwater Retained", "60-70%"],
            ["Added Insulation", "R-2.5"]
        ]
    },
    courtyard: {
        title: "🌳 Central Courtyard",
        desc: "Traditional Uzbek 'hovli'-inspired courtyard with deciduous trees for summer shade and winter solar gain. Includes community garden plots, seating areas, and children's play space. Natural cooling via evapotranspiration.",
        stats: [
            ["Area", "80 m²"],
            ["Trees", "4 deciduous shade trees"],
            ["Cooling Effect", "2-4°C ambient"],
            ["Community Plots", "8 garden beds"],
            ["Water Feature", "Recirculating fountain"]
        ]
    },
    water: {
        title: "💧 Rainwater Harvesting & Greywater Recycling",
        desc: "Roof-collected rainwater stored in underground cistern for irrigation and toilet flushing. Greywater from sinks/showers treated via biofilter for landscape irrigation. Reduces municipal water use by 35%.",
        stats: [
            ["Cistern Volume", "15,000 L"],
            ["Annual Rainfall Captured", "~85,000 L"],
            ["Greywater Recycled", "~40%"],
            ["Water Savings", "35% reduction"],
            ["Irrigation Coverage", "100% of landscape"]
        ]
    },
    insulation: {
        title: "🧱 Thermal Mass & Insulation",
        desc: "400mm fired clay brick walls with 100mm mineral wool insulation (R-3.5). High thermal mass stores daytime heat for cold nights and keeps interiors cool during summer days. Triple-glazed windows on north face.",
        stats: [
            ["Wall R-Value", "R-3.5 (m²·K/W)"],
            ["Brick Thickness", "400 mm"],
            ["Insulation", "100 mm mineral wool"],
            ["Windows", "Double/Triple glazed"],
            ["U-Value (windows)", "1.1 W/m²·K"]
        ]
    },
    ventilation: {
        title: "💨 Natural Cross-Ventilation",
        desc: "Stack-effect ventilation through central stairwell with operable roof vents. Cross-ventilation via opposed windows on N/S facades. Reduces cooling energy by 40% during spring/autumn shoulder seasons.",
        stats: [
            ["Strategy", "Cross + Stack ventilation"],
            ["Cooling Savings", "~40% reduction"],
            ["Vent Area", "5% of floor area"],
            ["Night Purge", "Automated louvers"],
            ["Air Changes", "4-6 ACH (natural)"]
        ]
    },
    shading: {
        title: "🏗️ External Sun Shading",
        desc: "Horizontal louvers on south facade, vertical fins on east/west. Deep window recesses (300mm) in brick walls. Balconies provide additional overhang shading. Blocks 80%+ of direct summer sun while admitting winter light.",
        stats: [
            ["South Facade", "Horizontal louvers"],
            ["East/West", "Vertical fins"],
            ["Window Recess", "300 mm"],
            ["Summer Shading", ">80% blocked"],
            ["Winter Solar Gain", "65% admitted"]
        ]
    },
    landscape: {
        title: "🌿 Sustainable Landscaping",
        desc: "Xeriscaping with native drought-resistant plants (junipers, ornamental grasses, pomegranate). Permeable paving reduces runoff by 70%. Bioswales along parking area filter stormwater. Fruit trees provide food and shade.",
        stats: [
            ["Native Plants", "85% of species"],
            ["Permeable Paving", "All walkways"],
            ["Runoff Reduction", "70%"],
            ["Bioswale Length", "25 m"],
            ["Fruit Trees", "8 (pomegranate, apricot)"]
        ]
    }
};

init();
animate();

function init() {
    // ---- Renderer ----
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // ---- Scene ----
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x87CEEB, 0.003);

    // ---- Camera ----
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(55, 35, 50);
    camera.lookAt(0, 8, 0);

    // ---- Controls ----
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 20;
    controls.maxDistance = 120;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.target.set(0, 8, 0);
    controls.update();

    // ---- Lighting ----
    setupLighting('day');

    // ---- Build the scene ----
    createGround();
    createBuilding();
    createSolarPanels();
    createGreenRoof();
    createCourtyard();
    createWaterSystem();
    createShadingDevices();
    createVentilationIndicators();
    createLandscaping();
    createSurroundings();

    // ---- Events ----
    window.addEventListener('resize', onWindowResize, false);

    // ---- Hide loading ----
    setTimeout(() => {
        document.getElementById('loading').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 800);
    }, 1500);
}

// ============================================================
// LIGHTING
// ============================================================
function setupLighting(mode) {
    // Remove existing lights
    scene.children.filter(c => c.isLight).forEach(l => scene.remove(l));

    if (mode === 'day') {
        scene.background = new THREE.Color(0x87CEEB);
        scene.fog = new THREE.FogExp2(0x87CEEB, 0.003);

        ambientLight = new THREE.AmbientLight(0x7ec8e3, 0.5);
        scene.add(ambientLight);

        hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x556B2F, 0.6);
        scene.add(hemisphereLight);

        directionalLight = new THREE.DirectionalLight(0xFFF8E1, 1.2);
        directionalLight.position.set(30, 50, 20);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.set(2048, 2048);
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        directionalLight.shadow.camera.far = 120;
        directionalLight.shadow.bias = -0.001;
        scene.add(directionalLight);

        renderer.toneMappingExposure = 1.0;

    } else if (mode === 'sunset') {
        scene.background = new THREE.Color(0xFF6B35);
        scene.fog = new THREE.FogExp2(0xFF8C42, 0.004);

        ambientLight = new THREE.AmbientLight(0xFFB347, 0.3);
        scene.add(ambientLight);

        hemisphereLight = new THREE.HemisphereLight(0xFF6347, 0x2F4F2F, 0.5);
        scene.add(hemisphereLight);

        directionalLight = new THREE.DirectionalLight(0xFF7F50, 1.5);
        directionalLight.position.set(-40, 12, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.set(2048, 2048);
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        directionalLight.shadow.camera.far = 120;
        scene.add(directionalLight);

        renderer.toneMappingExposure = 0.8;

    } else if (mode === 'night') {
        scene.background = new THREE.Color(0x0a0a2e);
        scene.fog = new THREE.FogExp2(0x0a0a2e, 0.006);

        ambientLight = new THREE.AmbientLight(0x1a1a4e, 0.3);
        scene.add(ambientLight);

        hemisphereLight = new THREE.HemisphereLight(0x0a0a4e, 0x000000, 0.2);
        scene.add(hemisphereLight);

        directionalLight = new THREE.DirectionalLight(0x4466AA, 0.3);
        directionalLight.position.set(-20, 40, -30);
        scene.add(directionalLight);

        // Window glow lights
        const windowLight1 = new THREE.PointLight(0xFFE4B5, 0.8, 30);
        windowLight1.position.set(0, 8, 8);
        scene.add(windowLight1);
        const windowLight2 = new THREE.PointLight(0xFFE4B5, 0.6, 25);
        windowLight2.position.set(0, 12, -8);
        scene.add(windowLight2);

        renderer.toneMappingExposure = 0.5;
    }
}

// ============================================================
// GROUND & TERRAIN
// ============================================================
function createGround() {
    // Main ground plane
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0xC4B896,  // Sandy Uzbek soil
        roughness: 0.95,
        metalness: 0.0
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Property boundary — permeable paving
    const pavingGeo = new THREE.PlaneGeometry(60, 40);
    const pavingMat = new THREE.MeshStandardMaterial({
        color: 0xA89070,
        roughness: 0.85,
        metalness: 0.05
    });
    const paving = new THREE.Mesh(pavingGeo, pavingMat);
    paving.rotation.x = -Math.PI / 2;
    paving.position.y = 0.01;
    paving.receiveShadow = true;
    scene.add(paving);

    // Walkways (permeable pavers)
    createPermWalkways();
}

function createPermWalkways() {
    const walkMat = new THREE.MeshStandardMaterial({
        color: 0x8B7355,
        roughness: 0.8,
    });
    
    // Front walkway
    const w1 = new THREE.Mesh(new THREE.BoxGeometry(20, 0.12, 2.5), walkMat);
    w1.position.set(0, 0.06, BUILDING.depth / 2 + 4);
    w1.receiveShadow = true;
    scene.add(w1);

    // Side walkways
    const w2 = new THREE.Mesh(new THREE.BoxGeometry(2, 0.12, BUILDING.depth + 8), walkMat);
    w2.position.set(BUILDING.width / 2 + 3, 0.06, 0);
    w2.receiveShadow = true;
    scene.add(w2);

    const w3 = new THREE.Mesh(new THREE.BoxGeometry(2, 0.12, BUILDING.depth + 8), walkMat);
    w3.position.set(-BUILDING.width / 2 - 3, 0.06, 0);
    w3.receiveShadow = true;
    scene.add(w3);
}

// ============================================================
// MAIN BUILDING
// ============================================================
function createBuilding() {
    buildingGroup = new THREE.Group();
    buildingGroup.name = 'building';

    // Materials
    const brickMat = new THREE.MeshStandardMaterial({
        color: 0xB8734A,   // Uzbek fired brick
        roughness: 0.85,
        metalness: 0.02
    });
    const brickMat2 = new THREE.MeshStandardMaterial({
        color: 0xC4804F,  // lighter accent brick
        roughness: 0.82,
        metalness: 0.02
    });
    const concreteMat = new THREE.MeshStandardMaterial({
        color: 0xD4C9B8,
        roughness: 0.7,
        metalness: 0.05
    });
    const windowMat = new THREE.MeshStandardMaterial({
        color: 0x6BA3BE,
        roughness: 0.1,
        metalness: 0.6,
        transparent: true,
        opacity: 0.7
    });
    const frameMat = new THREE.MeshStandardMaterial({
        color: 0xF5F0E8,
        roughness: 0.5,
        metalness: 0.3
    });
    const balconyMat = new THREE.MeshStandardMaterial({
        color: 0xD4C4A8,
        roughness: 0.65,
        metalness: 0.1
    });

    // U-Shape Building (two wings + connecting block)
    // Left wing
    const leftWing = createWing(brickMat, -BUILDING.width / 2 + BUILDING.depth / 2, 0, 0,
        BUILDING.depth, BUILDING.totalHeight, BUILDING.depth);
    buildingGroup.add(leftWing);

    // Right wing  
    const rightWing = createWing(brickMat, BUILDING.width / 2 - BUILDING.depth / 2, 0, 0,
        BUILDING.depth, BUILDING.totalHeight, BUILDING.depth);
    buildingGroup.add(rightWing);

    // Back connecting block
    const backBlock = createWing(brickMat2, 0, 0, -BUILDING.depth / 2,
        BUILDING.width, BUILDING.totalHeight, BUILDING.depth / 2);
    buildingGroup.add(backBlock);

    // Add windows to all facades
    addWindows(windowMat, frameMat);

    // Add balconies on south facade
    addBalconies(balconyMat, concreteMat);

    // Floor slabs visible between floors (concrete bands)
    for (let f = 1; f <= BUILDING.floors; f++) {
        const slabGeo = new THREE.BoxGeometry(BUILDING.width + 0.6, 0.15, BUILDING.depth + 0.6);
        const slab = new THREE.Mesh(slabGeo, concreteMat);
        slab.position.y = f * BUILDING.floorHeight;
        slab.castShadow = true;
        buildingGroup.add(slab);
    }

    // Entrance canopy
    const canopyGeo = new THREE.BoxGeometry(8, 0.2, 4);
    const canopy = new THREE.Mesh(canopyGeo, concreteMat);
    canopy.position.set(0, BUILDING.floorHeight - 0.3, BUILDING.depth / 2 + 2);
    canopy.castShadow = true;
    canopy.receiveShadow = true;
    buildingGroup.add(canopy);

    // Entrance pillars
    const pillarGeo = new THREE.CylinderGeometry(0.2, 0.2, BUILDING.floorHeight - 0.3, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xE8DCC8, roughness: 0.5 });
    [[-3.5, BUILDING.depth / 2 + 3.5], [3.5, BUILDING.depth / 2 + 3.5]].forEach(([x, z]) => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(x, (BUILDING.floorHeight - 0.3) / 2, z);
        pillar.castShadow = true;
        buildingGroup.add(pillar);
    });

    // Entrance door
    const doorGeo = new THREE.BoxGeometry(3, 2.8, 0.15);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x3E2723, roughness: 0.6 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 1.4, BUILDING.depth / 2 + 0.1);
    buildingGroup.add(door);

    // Decorative Uzbek-style arched entrance detail
    const archGeo = new THREE.TorusGeometry(1.5, 0.15, 8, 16, Math.PI);
    const archMat = new THREE.MeshStandardMaterial({ color: 0x1565C0, roughness: 0.4, metalness: 0.3 });
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.position.set(0, 2.8, BUILDING.depth / 2 + 0.15);
    buildingGroup.add(arch);

    buildingGroup.castShadow = true;
    scene.add(buildingGroup);
}

function createWing(material, x, y, z, width, height, depth) {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, height / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return group;
}

function addWindows(windowMat, frameMat) {
    const windowW = 1.4;
    const windowH = 1.8;
    const windowGeo = new THREE.PlaneGeometry(windowW, windowH);
    const frameGeo = new THREE.BoxGeometry(windowW + 0.2, windowH + 0.2, 0.08);

    // South facade windows (front - both wings)
    for (let f = 0; f < BUILDING.floors; f++) {
        const yPos = f * BUILDING.floorHeight + BUILDING.floorHeight * 0.55;
        
        // Left wing - south face
        for (let w = 0; w < 3; w++) {
            const xPos = -BUILDING.width / 2 + BUILDING.depth / 2 - 4 + w * 3;
            addWindowPair(xPos, yPos, BUILDING.depth / 2 + 0.01, windowGeo, frameGeo, windowMat, frameMat, 0);
        }
        // Right wing - south face
        for (let w = 0; w < 3; w++) {
            const xPos = BUILDING.width / 2 - BUILDING.depth / 2 - 4 + w * 3;
            addWindowPair(xPos, yPos, BUILDING.depth / 2 + 0.01, windowGeo, frameGeo, windowMat, frameMat, 0);
        }
        // Center windows above entrance (floors 1+)
        if (f >= 1) {
            for (let w = -1; w <= 1; w++) {
                addWindowPair(w * 3, yPos, BUILDING.depth / 2 + 0.01, windowGeo, frameGeo, windowMat, frameMat, 0);
            }
        }
        
        // North facade (back)
        for (let w = 0; w < 10; w++) {
            const xPos = -BUILDING.width / 2 + 2 + w * 3.5;
            addWindowPair(xPos, yPos, -BUILDING.depth / 2 - BUILDING.depth / 4 - 0.01, windowGeo, frameGeo, windowMat, frameMat, Math.PI);
        }

        // East facade
        for (let w = 0; w < 3; w++) {
            const zPos = -BUILDING.depth / 2 + 2.5 + w * 4;
            addWindowSide(BUILDING.width / 2 + 0.01, yPos, zPos, windowGeo, frameGeo, windowMat, frameMat, -Math.PI / 2);
        }

        // West facade
        for (let w = 0; w < 3; w++) {
            const zPos = -BUILDING.depth / 2 + 2.5 + w * 4;
            addWindowSide(-BUILDING.width / 2 - 0.01, yPos, zPos, windowGeo, frameGeo, windowMat, frameMat, Math.PI / 2);
        }
    }
}

function addWindowPair(x, y, z, windowGeo, frameGeo, windowMat, frameMat, rotY) {
    const win = new THREE.Mesh(windowGeo, windowMat);
    win.position.set(x, y, z);
    win.rotation.y = rotY;
    buildingGroup.add(win);

    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(x, y, z + (rotY === 0 ? 0.04 : -0.04));
    frame.rotation.y = rotY;
    buildingGroup.add(frame);
}

function addWindowSide(x, y, z, windowGeo, frameGeo, windowMat, frameMat, rotY) {
    const win = new THREE.Mesh(windowGeo, windowMat);
    win.position.set(x, y, z);
    win.rotation.y = rotY;
    buildingGroup.add(win);

    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(x + (rotY < 0 ? 0.04 : -0.04), y, z);
    frame.rotation.y = rotY;
    buildingGroup.add(frame);
}

function addBalconies(balconyMat, concreteMat) {
    // Balconies on south facade for floors 1-4
    for (let f = 1; f < BUILDING.floors; f++) {
        const yPos = f * BUILDING.floorHeight + 0.15;
        
        // Left wing balconies
        const b1 = createBalcony(balconyMat, concreteMat);
        b1.position.set(-BUILDING.width / 2 + BUILDING.depth / 2, yPos, BUILDING.depth / 2 + 1.5);
        buildingGroup.add(b1);

        // Right wing balconies
        const b2 = createBalcony(balconyMat, concreteMat);
        b2.position.set(BUILDING.width / 2 - BUILDING.depth / 2, yPos, BUILDING.depth / 2 + 1.5);
        buildingGroup.add(b2);
    }
}

function createBalcony(balconyMat, concreteMat) {
    const group = new THREE.Group();
    
    // Balcony slab
    const slabGeo = new THREE.BoxGeometry(6, 0.18, 2);
    const slab = new THREE.Mesh(slabGeo, concreteMat);
    slab.castShadow = true;
    slab.receiveShadow = true;
    group.add(slab);

    // Railing
    const railMat = new THREE.MeshStandardMaterial({ color: 0x5D4037, roughness: 0.5, metalness: 0.4 });
    // Front rail
    const frontRail = new THREE.Mesh(new THREE.BoxGeometry(6, 0.06, 0.06), railMat);
    frontRail.position.set(0, 1.1, 1);
    group.add(frontRail);
    // Railing posts
    for (let i = -2.5; i <= 2.5; i += 1) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.1, 0.05), railMat);
        post.position.set(i, 0.55, 1);
        group.add(post);
    }
    // Side rails
    const sideRailL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 2), railMat);
    sideRailL.position.set(-3, 0.55, 0);
    group.add(sideRailL);
    const sideRailR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 2), railMat);
    sideRailR.position.set(3, 0.55, 0);
    group.add(sideRailR);

    return group;
}

// ============================================================
// SOLAR PANELS
// ============================================================
function createSolarPanels() {
    solarPanels = new THREE.Group();
    solarPanels.name = 'solar';

    const panelMat = new THREE.MeshStandardMaterial({
        color: 0x1A237E,
        roughness: 0.15,
        metalness: 0.8,
    });
    const framePanelMat = new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.3,
        metalness: 0.7
    });

    const roofY = BUILDING.totalHeight + 0.2;
    const panelW = 1.7;
    const panelH = 1.0;
    const tiltAngle = -15 * Math.PI / 180; // Tilted south

    // Panels on left wing roof
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 6; col++) {
            const panel = createSinglePanel(panelMat, framePanelMat, panelW, panelH);
            panel.position.set(
                -BUILDING.width / 2 + BUILDING.depth / 2 - 5 + col * (panelW + 0.3),
                roofY + 0.5 + Math.sin(-tiltAngle) * (panelH / 2),
                -2 + row * (panelH + 0.5)
            );
            panel.rotation.x = tiltAngle;
            solarPanels.add(panel);
        }
    }

    // Panels on right wing roof
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 6; col++) {
            const panel = createSinglePanel(panelMat, framePanelMat, panelW, panelH);
            panel.position.set(
                BUILDING.width / 2 - BUILDING.depth / 2 - 5 + col * (panelW + 0.3),
                roofY + 0.5 + Math.sin(-tiltAngle) * (panelH / 2),
                -2 + row * (panelH + 0.5)
            );
            panel.rotation.x = tiltAngle;
            solarPanels.add(panel);
        }
    }

    scene.add(solarPanels);
}

function createSinglePanel(panelMat, frameMat, w, h) {
    const group = new THREE.Group();
    
    // Panel surface
    const panelGeo = new THREE.BoxGeometry(w, 0.04, h);
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.castShadow = true;
    group.add(panel);

    // Frame
    const frameGeo = new THREE.BoxGeometry(w + 0.06, 0.06, h + 0.06);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = -0.01;
    group.add(frame);

    // Support leg
    const legGeo = new THREE.BoxGeometry(0.05, 0.6, 0.05);
    const leg = new THREE.Mesh(legGeo, frameMat);
    leg.position.set(0, -0.3, h / 3);
    group.add(leg);

    return group;
}

// ============================================================
// GREEN ROOF
// ============================================================
function createGreenRoof() {
    greenRoofGroup = new THREE.Group();
    greenRoofGroup.name = 'greenroof';

    const roofY = BUILDING.totalHeight;

    // Green roof on back connecting block
    const greenMat = new THREE.MeshStandardMaterial({
        color: 0x558B2F,
        roughness: 0.95,
        metalness: 0.0
    });
    const substrateMat = new THREE.MeshStandardMaterial({
        color: 0x5D4037,
        roughness: 0.9
    });

    // Substrate layer
    const subGeo = new THREE.BoxGeometry(BUILDING.width - 2, 0.12, BUILDING.depth / 2 - 1);
    const substrate = new THREE.Mesh(subGeo, substrateMat);
    substrate.position.set(0, roofY + 0.06, -BUILDING.depth / 2);
    greenRoofGroup.add(substrate);

    // Vegetation patches (varied greens)
    const greens = [0x558B2F, 0x689F38, 0x7CB342, 0x4CAF50, 0x66BB6A];
    for (let i = 0; i < 25; i++) {
        const patchSize = 1.5 + Math.random() * 3;
        const patchGeo = new THREE.BoxGeometry(patchSize, 0.08 + Math.random() * 0.06, patchSize);
        const patchMat = new THREE.MeshStandardMaterial({
            color: greens[Math.floor(Math.random() * greens.length)],
            roughness: 0.95
        });
        const patch = new THREE.Mesh(patchGeo, patchMat);
        patch.position.set(
            -BUILDING.width / 2 + 2 + Math.random() * (BUILDING.width - 4),
            roofY + 0.15 + Math.random() * 0.05,
            -BUILDING.depth / 2 - BUILDING.depth / 8 + Math.random() * (BUILDING.depth / 2 - 2)
        );
        patch.castShadow = true;
        greenRoofGroup.add(patch);
    }

    // Small roof plants (spheres)
    for (let i = 0; i < 15; i++) {
        const plantGeo = new THREE.SphereGeometry(0.2 + Math.random() * 0.3, 6, 5);
        const plantMat = new THREE.MeshStandardMaterial({
            color: greens[Math.floor(Math.random() * greens.length)],
            roughness: 0.9
        });
        const plant = new THREE.Mesh(plantGeo, plantMat);
        plant.position.set(
            -BUILDING.width / 2 + 3 + Math.random() * (BUILDING.width - 6),
            roofY + 0.25,
            -BUILDING.depth / 2 - 1 + Math.random() * (BUILDING.depth / 3)
        );
        greenRoofGroup.add(plant);
    }

    scene.add(greenRoofGroup);
}

// ============================================================
// CENTRAL COURTYARD
// ============================================================
function createCourtyard() {
    courtyardGroup = new THREE.Group();
    courtyardGroup.name = 'courtyard';

    // Courtyard ground (grass/paving)
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x7CB342, roughness: 0.9 });
    const grassGeo = new THREE.BoxGeometry(BUILDING.courtyardWidth, 0.08, BUILDING.courtyardDepth);
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.position.set(0, 0.04, 0);
    grass.receiveShadow = true;
    courtyardGroup.add(grass);

    // Central water feature / fountain
    const fountainBaseMat = new THREE.MeshStandardMaterial({ color: 0x90A4AE, roughness: 0.3, metalness: 0.4 });
    const fountainBase = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.4, 0.4, 16),
        fountainBaseMat
    );
    fountainBase.position.set(0, 0.2, 0);
    fountainBase.castShadow = true;
    courtyardGroup.add(fountainBase);

    // Water surface
    const waterMat = new THREE.MeshStandardMaterial({
        color: 0x4FC3F7,
        roughness: 0.05,
        metalness: 0.3,
        transparent: true,
        opacity: 0.7
    });
    const water = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.05, 16), waterMat);
    water.position.set(0, 0.38, 0);
    courtyardGroup.add(water);

    // Fountain center piece
    const centerPiece = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, 0.8, 8),
        fountainBaseMat
    );
    centerPiece.position.set(0, 0.7, 0);
    courtyardGroup.add(centerPiece);

    // Trees in courtyard (4 deciduous trees)
    const treePositions = [
        [-3, 0, -2.5], [3, 0, -2.5],
        [-3, 0, 2.5], [3, 0, 2.5]
    ];
    treePositions.forEach(pos => {
        const tree = createDeciduousTree(2.5 + Math.random() * 1);
        tree.position.set(pos[0], pos[1], pos[2]);
        courtyardGroup.add(tree);
    });

    // Garden beds (community plots)
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x5D4037, roughness: 0.95 });
    const plantMat = new THREE.MeshStandardMaterial({ color: 0x4CAF50, roughness: 0.9 });
    for (let i = 0; i < 4; i++) {
        const bed = new THREE.Group();
        const soil = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 0.8), bedMat);
        soil.position.y = 0.12;
        bed.add(soil);
        
        // Plants in bed
        for (let p = 0; p < 4; p++) {
            const plant = new THREE.Mesh(
                new THREE.SphereGeometry(0.15 + Math.random() * 0.1, 6, 5),
                plantMat
            );
            plant.position.set(-0.6 + p * 0.4, 0.35, 0);
            bed.add(plant);
        }
        
        bed.position.set(-2.5 + i * 1.8, 0, i < 2 ? -3.5 : 3.5);
        if (i >= 2) bed.position.x = -2.5 + (i - 2) * 1.8 + 3;
        courtyardGroup.add(bed);
    }

    // Bench seating
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x795548, roughness: 0.7 });
    [[2, 0.3, 0], [-2, 0.3, 0]].forEach(pos => {
        const bench = new THREE.Group();
        const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.4), benchMat);
        seat.position.y = 0.45;
        bench.add(seat);
        const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.06), benchMat);
        backrest.position.set(0, 0.7, -0.18);
        bench.add(backrest);
        // Legs
        [[-0.8, 0], [0.8, 0]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.35), benchMat);
            leg.position.set(lx, 0.22, lz);
            bench.add(leg);
        });
        bench.position.set(pos[0], pos[1], pos[2]);
        bench.rotation.y = pos[0] > 0 ? Math.PI / 2 : -Math.PI / 2;
        courtyardGroup.add(bench);
    });

    scene.add(courtyardGroup);
}

// ============================================================
// TREES (reusable)
// ============================================================
function createDeciduousTree(height) {
    const tree = new THREE.Group();
    
    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, height * 0.45, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5D4037, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = height * 0.22;
    trunk.castShadow = true;
    tree.add(trunk);

    // Canopy (multiple spheres)
    const canopyMat = new THREE.MeshStandardMaterial({
        color: 0x388E3C,
        roughness: 0.85,
        metalness: 0.0
    });
    const canopyPositions = [
        [0, height * 0.65, 0, height * 0.35],
        [-height * 0.15, height * 0.55, height * 0.1, height * 0.25],
        [height * 0.12, height * 0.58, -height * 0.08, height * 0.28],
    ];
    canopyPositions.forEach(([x, y, z, r]) => {
        const canopy = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), canopyMat);
        canopy.position.set(x, y, z);
        canopy.castShadow = true;
        tree.add(canopy);
    });

    return tree;
}

function createConiferTree(height) {
    const tree = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, height * 0.35, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5D4037, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = height * 0.17;
    trunk.castShadow = true;
    tree.add(trunk);

    // Conical foliage layers
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2E7D32, roughness: 0.85 });
    for (let i = 0; i < 3; i++) {
        const coneGeo = new THREE.ConeGeometry(height * (0.3 - i * 0.06), height * 0.3, 6);
        const cone = new THREE.Mesh(coneGeo, foliageMat);
        cone.position.y = height * (0.35 + i * 0.2);
        cone.castShadow = true;
        tree.add(cone);
    }
    return tree;
}

// ============================================================
// WATER HARVESTING SYSTEM
// ============================================================
function createWaterSystem() {
    waterSystemGroup = new THREE.Group();
    waterSystemGroup.name = 'water';

    const pipeMat = new THREE.MeshStandardMaterial({
        color: 0x2196F3,
        roughness: 0.3,
        metalness: 0.5,
        transparent: true,
        opacity: 0.7
    });
    const tankMat = new THREE.MeshStandardMaterial({
        color: 0x37474F,
        roughness: 0.4,
        metalness: 0.3
    });

    // Downspout pipes (visible on building corners)
    const pipeGeo = new THREE.CylinderGeometry(0.08, 0.08, BUILDING.totalHeight, 8);
    const pipePositions = [
        [BUILDING.width / 2 + 0.15, BUILDING.totalHeight / 2, BUILDING.depth / 2],
        [-BUILDING.width / 2 - 0.15, BUILDING.totalHeight / 2, BUILDING.depth / 2],
        [BUILDING.width / 2 + 0.15, BUILDING.totalHeight / 2, -BUILDING.depth / 2 - BUILDING.depth / 4],
        [-BUILDING.width / 2 - 0.15, BUILDING.totalHeight / 2, -BUILDING.depth / 2 - BUILDING.depth / 4],
    ];
    pipePositions.forEach(pos => {
        const pipe = new THREE.Mesh(pipeGeo, pipeMat);
        pipe.position.set(pos[0], pos[1], pos[2]);
        waterSystemGroup.add(pipe);
    });

    // Underground cistern (partially visible)
    const cisternGeo = new THREE.CylinderGeometry(2, 2, 2.5, 12);
    const cistern = new THREE.Mesh(cisternGeo, tankMat);
    cistern.position.set(BUILDING.width / 2 + 5, -0.5, -3);
    cistern.castShadow = true;
    waterSystemGroup.add(cistern);

    // Cistern lid
    const lidGeo = new THREE.CylinderGeometry(2.1, 2.1, 0.15, 12);
    const lidMat = new THREE.MeshStandardMaterial({ color: 0x546E7A, roughness: 0.5, metalness: 0.3 });
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.set(BUILDING.width / 2 + 5, 0.8, -3);
    waterSystemGroup.add(lid);

    // Label
    // Horizontal pipe from building to cistern
    const hPipeGeo = new THREE.CylinderGeometry(0.06, 0.06, 6, 8);
    const hPipe = new THREE.Mesh(hPipeGeo, pipeMat);
    hPipe.position.set(BUILDING.width / 2 + 2.5, 0, -3);
    hPipe.rotation.z = Math.PI / 2;
    waterSystemGroup.add(hPipe);

    // Bioswale (gravel trench with plants)
    const bioswaleGeo = new THREE.BoxGeometry(25, 0.3, 1.5);
    const bioswaleMat = new THREE.MeshStandardMaterial({ color: 0x7E8C6A, roughness: 0.9 });
    const bioswale = new THREE.Mesh(bioswaleGeo, bioswaleMat);
    bioswale.position.set(0, 0.05, BUILDING.depth / 2 + 8);
    bioswale.receiveShadow = true;
    waterSystemGroup.add(bioswale);

    // Bioswale plants
    for (let i = 0; i < 12; i++) {
        const reed = new THREE.Mesh(
            new THREE.ConeGeometry(0.1, 0.5, 4),
            new THREE.MeshStandardMaterial({ color: 0x558B2F })
        );
        reed.position.set(-11 + i * 2, 0.4, BUILDING.depth / 2 + 8);
        waterSystemGroup.add(reed);
    }

    scene.add(waterSystemGroup);
}

// ============================================================
// SHADING DEVICES
// ============================================================
function createShadingDevices() {
    shadingGroup = new THREE.Group();
    shadingGroup.name = 'shading';

    const louverMat = new THREE.MeshStandardMaterial({
        color: 0xBCAAA4,
        roughness: 0.5,
        metalness: 0.2
    });

    // South facade horizontal louvers (above each window row)
    for (let f = 0; f < BUILDING.floors; f++) {
        const yPos = f * BUILDING.floorHeight + BUILDING.floorHeight * 0.55 + 1.1;
        
        // Left wing louvers
        for (let w = 0; w < 3; w++) {
            const xPos = -BUILDING.width / 2 + BUILDING.depth / 2 - 4 + w * 3;
            const louver = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.04, 0.5),
                louverMat
            );
            louver.position.set(xPos, yPos, BUILDING.depth / 2 + 0.3);
            louver.castShadow = true;
            shadingGroup.add(louver);
        }
        // Right wing louvers
        for (let w = 0; w < 3; w++) {
            const xPos = BUILDING.width / 2 - BUILDING.depth / 2 - 4 + w * 3;
            const louver = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.04, 0.5),
                louverMat
            );
            louver.position.set(xPos, yPos, BUILDING.depth / 2 + 0.3);
            louver.castShadow = true;
            shadingGroup.add(louver);
        }
    }

    // East/West vertical fins
    const finMat = new THREE.MeshStandardMaterial({
        color: 0xA1887F,
        roughness: 0.55,
        metalness: 0.15
    });
    for (let f = 0; f < BUILDING.floors; f++) {
        const yPos = f * BUILDING.floorHeight + BUILDING.floorHeight * 0.55;
        for (let w = 0; w < 3; w++) {
            const zPos = -BUILDING.depth / 2 + 2.5 + w * 4;
            // East fins
            [-0.9, 0.9].forEach(offset => {
                const fin = new THREE.Mesh(
                    new THREE.BoxGeometry(0.04, 2, 0.4),
                    finMat
                );
                fin.position.set(BUILDING.width / 2 + 0.2, yPos, zPos + offset);
                fin.castShadow = true;
                shadingGroup.add(fin);
            });
            // West fins
            [-0.9, 0.9].forEach(offset => {
                const fin = new THREE.Mesh(
                    new THREE.BoxGeometry(0.04, 2, 0.4),
                    finMat
                );
                fin.position.set(-BUILDING.width / 2 - 0.2, yPos, zPos + offset);
                fin.castShadow = true;
                shadingGroup.add(fin);
            });
        }
    }

    scene.add(shadingGroup);
}

// ============================================================
// VENTILATION INDICATORS
// ============================================================
function createVentilationIndicators() {
    ventilationGroup = new THREE.Group();
    ventilationGroup.name = 'ventilation';

    // Roof ventilation louvers/vents
    const ventMat = new THREE.MeshStandardMaterial({
        color: 0x78909C,
        roughness: 0.4,
        metalness: 0.5
    });

    // Stack ventilation tower on roof (stairwell)
    const towerGeo = new THREE.BoxGeometry(2, 2.5, 2);
    const tower = new THREE.Mesh(towerGeo, ventMat);
    tower.position.set(0, BUILDING.totalHeight + 1.25, -BUILDING.depth / 4);
    tower.castShadow = true;
    ventilationGroup.add(tower);

    // Vent slats on tower
    const slatMat = new THREE.MeshStandardMaterial({ color: 0x546E7A, roughness: 0.3, metalness: 0.6 });
    for (let i = 0; i < 4; i++) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.01), slatMat);
        slat.position.set(0, BUILDING.totalHeight + 0.5 + i * 0.5, -BUILDING.depth / 4 + 1.01);
        slat.rotation.x = 0.3;
        ventilationGroup.add(slat);
    }

    // Airflow arrows (simple cone indicators — visible when highlighted)
    const arrowMat = new THREE.MeshStandardMaterial({
        color: 0x4FC3F7,
        transparent: true,
        opacity: 0.6,
        roughness: 0.2
    });
    // Cross-ventilation arrows (N to S through building)
    for (let f = 0; f < BUILDING.floors; f++) {
        const y = f * BUILDING.floorHeight + BUILDING.floorHeight * 0.5;
        // Arrow from north
        const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1, 6), arrowMat);
        arrow.position.set(0, y, 0);
        arrow.rotation.x = -Math.PI / 2;
        ventilationGroup.add(arrow);
    }

    scene.add(ventilationGroup);
}

// ============================================================
// LANDSCAPING
// ============================================================
function createLandscaping() {
    landscapeGroup = new THREE.Group();
    landscapeGroup.name = 'landscape';

    // Perimeter trees
    const treeLinePositions = [
        // Front (south)
        [-20, 0, 16], [-14, 0, 16], [-8, 0, 15], [8, 0, 15], [14, 0, 16], [20, 0, 16],
        // East side
        [22, 0, 8], [22, 0, 0], [22, 0, -8],
        // West side
        [-22, 0, 8], [-22, 0, 0], [-22, 0, -8],
        // Back (north)
        [-14, 0, -16], [0, 0, -16], [14, 0, -16],
    ];

    treeLinePositions.forEach((pos, i) => {
        let tree;
        if (i % 3 === 0) {
            tree = createConiferTree(4 + Math.random() * 2);
        } else {
            tree = createDeciduousTree(3 + Math.random() * 2);
        }
        tree.position.set(pos[0], pos[1], pos[2]);
        landscapeGroup.add(tree);
    });

    // Fruit trees (pomegranate/apricot) — represented with colorful canopies
    const fruitTreePositions = [
        [-6, 0, 12], [6, 0, 12], [-10, 0, 12], [10, 0, 12]
    ];
    fruitTreePositions.forEach(pos => {
        const tree = createFruitTree(2.5);
        tree.position.set(pos[0], pos[1], pos[2]);
        landscapeGroup.add(tree);
    });

    // Shrub hedges along walkways
    const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x4CAF50, roughness: 0.9 });
    [
        [0, 0.4, BUILDING.depth / 2 + 2, 18, 0.8, 0.6],
        [BUILDING.width / 2 + 1.5, 0.35, 0, 0.6, 0.7, 10],
        [-BUILDING.width / 2 - 1.5, 0.35, 0, 0.6, 0.7, 10],
    ].forEach(([x, y, z, w, h, d]) => {
        const hedge = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), hedgeMat);
        hedge.position.set(x, y, z);
        hedge.castShadow = true;
        hedge.receiveShadow = true;
        landscapeGroup.add(hedge);
    });

    // Ground cover / lawn patches
    const lawnMat = new THREE.MeshStandardMaterial({ color: 0x7CB342, roughness: 0.95 });
    [
        [0, 0.02, 13, 22, 0.04, 5],
        [20, 0.02, 0, 5, 0.04, 15],
        [-20, 0.02, 0, 5, 0.04, 15],
    ].forEach(([x, y, z, w, h, d]) => {
        const lawn = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lawnMat);
        lawn.position.set(x, y, z);
        lawn.receiveShadow = true;
        landscapeGroup.add(lawn);
    });

    scene.add(landscapeGroup);
}

function createFruitTree(height) {
    const tree = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.1, 0.14, height * 0.4, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6D4C41, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = height * 0.2;
    trunk.castShadow = true;
    tree.add(trunk);

    // Fruiting canopy (lighter green with orange dots)
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x66BB6A, roughness: 0.85 });
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(height * 0.35, 8, 6), canopyMat);
    canopy.position.y = height * 0.6;
    canopy.castShadow = true;
    tree.add(canopy);

    // Fruits (small spheres)
    const fruitMat = new THREE.MeshStandardMaterial({ color: 0xFF7043, roughness: 0.5 });
    for (let i = 0; i < 6; i++) {
        const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 4), fruitMat);
        const angle = (i / 6) * Math.PI * 2;
        fruit.position.set(
            Math.cos(angle) * height * 0.25,
            height * 0.55 + Math.random() * 0.3,
            Math.sin(angle) * height * 0.25
        );
        tree.add(fruit);
    }
    return tree;
}

// ============================================================
// INSULATION (visual indicator — wall section)
// ============================================================
function createInsulationVisual() {
    insulationGroup = new THREE.Group();
    insulationGroup.name = 'insulation';
    // Insulation is part of the building walls; we create a
    // glow effect when highlighted
    scene.add(insulationGroup);
}
createInsulationVisual();

// ============================================================
// SURROUNDING CONTEXT
// ============================================================
function createSurroundings() {
    // Road
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x424242, roughness: 0.9 });
    const road = new THREE.Mesh(new THREE.BoxGeometry(200, 0.05, 8), roadMat);
    road.position.set(0, 0.02, 25);
    road.receiveShadow = true;
    scene.add(road);

    // Road markings
    const markMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 });
    for (let i = -20; i <= 20; i++) {
        const mark = new THREE.Mesh(new THREE.BoxGeometry(2, 0.06, 0.15), markMat);
        mark.position.set(i * 5, 0.06, 25);
        scene.add(mark);
    }

    // Sidewalk
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x9E9E9E, roughness: 0.8 });
    const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(200, 0.08, 2.5), sidewalkMat);
    sidewalk.position.set(0, 0.04, 20.5);
    sidewalk.receiveShadow = true;
    scene.add(sidewalk);

    // Compass rose indicator (N/S/E/W)
    addCompassLabels();
}

function addCompassLabels() {
    // Simple directional markers on ground
    const markerMat = new THREE.MeshStandardMaterial({ color: 0xE53935, roughness: 0.5 });
    
    // North arrow
    const nArrow = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2, 4), markerMat);
    nArrow.position.set(-25, 0.5, -18);
    nArrow.rotation.x = 0;
    scene.add(nArrow);

    // N label base
    const nBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 1.5), markerMat);
    nBase.position.set(-25, 0.05, -18);
    scene.add(nBase);
}

// ============================================================
// FEATURE HIGHLIGHTING
// ============================================================
function highlightFeature(featureName) {
    // Reset previous highlight
    resetHighlight();

    currentHighlight = featureName;

    // Update button states
    document.querySelectorAll('.feature-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.feature-btn').classList.add('active');

    // Show detail panel
    const data = featureData[featureName];
    document.getElementById('detail-title').textContent = data.title;
    document.getElementById('detail-desc').textContent = data.desc;
    
    let statsHtml = '';
    data.stats.forEach(([label, value]) => {
        statsHtml += `<div class="stat"><span class="stat-label">${label}</span><span class="stat-value">${value}</span></div>`;
    });
    document.getElementById('detail-stats').innerHTML = statsHtml;
    document.getElementById('feature-detail').style.display = 'block';

    // Highlight effect — make targeted group glow, dim others
    const groups = {
        solar: solarPanels,
        greenroof: greenRoofGroup,
        courtyard: courtyardGroup,
        water: waterSystemGroup,
        insulation: buildingGroup,
        ventilation: ventilationGroup,
        shading: shadingGroup,
        landscape: landscapeGroup
    };

    // Dim non-highlighted groups
    Object.entries(groups).forEach(([key, group]) => {
        if (!group) return;
        if (key === featureName) {
            // Pulse/highlight effect
            group.traverse(child => {
                if (child.isMesh && child.material) {
                    child.userData.origEmissive = child.material.emissive ? child.material.emissive.getHex() : 0;
                    if (child.material.emissive) {
                        child.material.emissive.setHex(0x2E7D32);
                        child.material.emissiveIntensity = 0.3;
                    }
                }
            });
        } else if (key !== 'insulation' || featureName !== 'insulation') {
            group.traverse(child => {
                if (child.isMesh && child.material) {
                    child.userData.origOpacity = child.material.opacity;
                    child.userData.origTransparent = child.material.transparent;
                    child.material.transparent = true;
                    child.material.opacity = Math.min(child.material.opacity, 0.35);
                }
            });
        }
    });

    // Camera focus on feature
    const targets = {
        solar: { pos: [30, 30, 20], target: [0, BUILDING.totalHeight, 0] },
        greenroof: { pos: [25, 28, -15], target: [0, BUILDING.totalHeight, -BUILDING.depth / 2] },
        courtyard: { pos: [20, 12, 15], target: [0, 1, 0] },
        water: { pos: [30, 15, -5], target: [BUILDING.width / 2 + 3, 2, -3] },
        insulation: { pos: [35, 20, 25], target: [0, 8, 0] },
        ventilation: { pos: [15, 25, 10], target: [0, BUILDING.totalHeight / 2, 0] },
        shading: { pos: [25, 15, 25], target: [0, 8, BUILDING.depth / 2] },
        landscape: { pos: [45, 18, 30], target: [0, 2, 10] },
    };

    if (targets[featureName]) {
        const t = targets[featureName];
        animateCamera(
            new THREE.Vector3(...t.pos),
            new THREE.Vector3(...t.target)
        );
    }
}

function resetHighlight() {
    const allGroups = [solarPanels, greenRoofGroup, courtyardGroup, waterSystemGroup, 
                       buildingGroup, ventilationGroup, shadingGroup, landscapeGroup];
    allGroups.forEach(group => {
        if (!group) return;
        group.traverse(child => {
            if (child.isMesh && child.material) {
                if (child.userData.origEmissive !== undefined && child.material.emissive) {
                    child.material.emissive.setHex(child.userData.origEmissive);
                    child.material.emissiveIntensity = 0;
                }
                if (child.userData.origOpacity !== undefined) {
                    child.material.opacity = child.userData.origOpacity;
                    child.material.transparent = child.userData.origTransparent;
                }
            }
        });
    });
    currentHighlight = null;
}

function closeDetail() {
    document.getElementById('feature-detail').style.display = 'none';
    resetHighlight();
    document.querySelectorAll('.feature-btn').forEach(btn => btn.classList.remove('active'));
    // Reset camera
    animateCamera(
        new THREE.Vector3(55, 35, 50),
        new THREE.Vector3(0, 8, 0)
    );
}

// ============================================================
// CAMERA ANIMATION
// ============================================================
function animateCamera(targetPos, targetLookAt) {
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const duration = 1200;
    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        // Ease in-out
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        camera.position.lerpVectors(startPos, targetPos, ease);
        controls.target.lerpVectors(startTarget, targetLookAt, ease);
        controls.update();

        if (t < 1) {
            requestAnimationFrame(update);
        }
    }
    update();
}

// ============================================================
// TIME OF DAY
// ============================================================
function setTimeOfDay(mode) {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    setupLighting(mode);
}

// ============================================================
// ANIMATION LOOP
// ============================================================
function animate() {
    animationId = requestAnimationFrame(animate);
    controls.update();

    // Subtle building idle animation — gentle rotation
    const time = Date.now() * 0.0001;

    // Solar panel shimmer
    if (solarPanels) {
        solarPanels.children.forEach((panel, i) => {
            // Subtle metallic reflection shimmer
        });
    }

    renderer.render(scene, camera);
}

// ============================================================
// RESIZE HANDLER
// ============================================================
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
