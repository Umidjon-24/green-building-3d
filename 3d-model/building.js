// ============================================================
// Green Apartment Building — 3D Model for Uzbekistan
// Circular Economy ECON330 — Design Charrette
// Built with Three.js
// ============================================================

// ---- Scene Setup ----
let scene, camera, renderer, controls;
let buildingGroup, solarPanels, greenRoofGroup, courtyardGroup;
let waterSystemGroup, insulationGroup, ventilationGroup, shadingGroup, landscapeGroup;
let ambientLight, directionalLight, hemisphereLight;
const windowLights = [];
// Use the current calendar day at the site, independent of the viewer's timezone.
const siteDate = new Date(Date.now() + 5 * 3600000);
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
        desc: "Blue electricity panels face south on the two roof wings. The separate bronze-framed collectors on the rear roof heat water for taps and showers. Annual output assumes 1,500 kWh per installed kWp. Self-use depends on the electricity demand at the meter.",
        stats: [
            ["Concept PV layout", "60 × 500 W = 30 kWp"],
            ["PV orientation", "Due south · 15° tilt"],
            ["Solar hot water", "20 m² of collectors"],
            ["Estimated annual output", "45,000 kWh"],
            ["Assumed on-site use", "70% of output"]
        ]
    },
    greenroof: {
        title: "Insulated Roof — No Rooftop Planting",
        desc: "An insulated, waterproof flat roof retains the passive thermal envelope and space for solar PV. Rooftop soil and vegetation have been removed from the revised design. Coordinate drainage, maintenance routes and the elevator overrun.",
        stats: [["Planting", "Removed"], ["Roof", "Insulated + waterproofed"], ["Solar", "30 kW concept array"], ["Elevator", "One five-stop lift budgeted"]]
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
        desc: "Two separate tanks serve different uses. The blue route carries roof runoff to the rain tank and treated rainwater back to toilets. The green route carries shower and basin water to a treatment tank, then to garden drip lines. The cost model assumes the following annual reuse volumes.",
        stats: [
            ["Rain tank capacity", "15,000 L"],
            ["Rainwater used", "85 m³/year"],
            ["Greywater used", "250 m³/year"]
        ]
    },
    insulation: {
        title: "🧱 Thermal Mass & Insulation",
        desc: "The cost plan assumes aerated concrete block walls with external insulation and double glazing. The concrete floors provide thermal mass.",
        stats: [
            ["Block thickness", "300 mm"],
            ["Facade insulation", "100 mm"],
            ["Glazing", "Double-glazed PVC"]
        ]
    },
    ventilation: {
        title: "💨 Natural Cross-Ventilation",
        desc: "Stack-effect ventilation through central stairwell with operable roof vents. Cross-ventilation via opposed windows on N/S facades. Cooler night air can remove heat stored during the day.",
        stats: [
            ["Strategy", "Cross + Stack ventilation"],
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
    scene.fog = new THREE.FogExp2(0xc8d9de, 0.003);

    // ---- Camera ----
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(65, 48, 72);
    camera.lookAt(0, 8, 0);

    // ---- Controls ----
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 20;
    controls.maxDistance = 150;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.target.set(0, 5, 8);
    controls.update();

    // ---- Lighting ----
    setupLighting();

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
    createCivilSite();
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
function setupLighting() {
    scene.background = new THREE.Color();
    ambientLight = new THREE.AmbientLight(0xf3eee5);
    hemisphereLight = new THREE.HemisphereLight(0xc8d9de, 0x827766);
    directionalLight = new THREE.DirectionalLight();
    directionalLight.shadow.mapSize.set(2048, 2048);
    Object.assign(directionalLight.shadow.camera, {left:-55, right:55, top:55, bottom:-55, near:1, far:180});
    directionalLight.shadow.camera.updateProjectionMatrix();
    directionalLight.shadow.bias = -0.0005;
    scene.add(ambientLight, hemisphereLight, directionalLight);
    for (const [x,y,z] of [[0,8,8],[0,12,-8]]) {
        const light = new THREE.PointLight(0xffe4b5, 0, 30);
        light.position.set(x,y,z);
        windowLights.push(light);
        scene.add(light);
    }
    setTimeOfDay(720);
}

// Approximate solar declination and equation of time (NOAA fractional-year equations).
// Samarkand: 39.65° N, 66.96° E, UTC+5. Model axes: east +X, up +Y, south +Z.
function sunDirection(minutes, date) {
    const year = date.getUTCFullYear();
    const start = Date.UTC(year, 0, 1);
    const yearDays = (Date.UTC(year + 1, 0, 1) - start) / 86400000;
    const dayIndex = (Date.UTC(year, date.getUTCMonth(), date.getUTCDate()) - start) / 86400000;
    const g = 2 * Math.PI * (dayIndex + minutes / 1440 - 0.5) / yearDays;
    const correction = 229.18 * (0.000075 + 0.001868*Math.cos(g) - 0.032077*Math.sin(g)
        - 0.014615*Math.cos(2*g) - 0.040849*Math.sin(2*g));
    const decl = 0.006918 - 0.399912*Math.cos(g) + 0.070257*Math.sin(g)
        - 0.006758*Math.cos(2*g) + 0.000907*Math.sin(2*g)
        - 0.002697*Math.cos(3*g) + 0.00148*Math.sin(3*g);
    const rad = Math.PI / 180;
    const hour = ((minutes + correction + 4*66.96 - 300) / 4 - 180) * rad;
    const lat = 39.65 * rad;
    const meridian = Math.cos(decl) * Math.cos(hour);
    return new THREE.Vector3(-Math.cos(decl) * Math.sin(hour),
        Math.sin(lat)*Math.sin(decl) + Math.cos(lat)*meridian,
        Math.sin(lat)*meridian - Math.cos(lat)*Math.sin(decl));
}

// ============================================================
// GROUND & TERRAIN
// ============================================================
function createGround() { const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xc4b896,roughness:0.95})); ground.rotation.x=-Math.PI/2;ground.position.y=-0.1;ground.receiveShadow=true;scene.add(ground); }



function createBuilding() {
    buildingGroup = new THREE.Group();
    buildingGroup.name = 'building';

    // A staggered fired-brick bond. Each texture tile spans two metres of wall.
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#b99b81';
    ctx.fillRect(0, 0, 256, 256);
    const brickTones = ['#af7658', '#b78061', '#be8968', '#b57c5c', '#b98164'];
    for (let row = 0; row < 16; row++) {
        for (let col = -1; col < 8; col++) {
            ctx.fillStyle = brickTones[(row * 7 + (col + 1) * 3 + row * (col + 1)) % brickTones.length];
            ctx.fillRect(col * 32 + (row % 2) * 16, row * 16, 31, 15);
        }
    }
    const bond = new THREE.CanvasTexture(canvas);
    bond.wrapS = bond.wrapT = THREE.RepeatWrapping;
    bond.encoding = THREE.sRGBEncoding;
    const brick = new THREE.MeshStandardMaterial({map: bond, roughness: 0.92});
    const limestone = new THREE.MeshStandardMaterial({color: 0xe1d6be, roughness: 0.78});
    const bronze = new THREE.MeshStandardMaterial({color: 0x584d42, roughness: 0.54, metalness: 0.22});
    const glazing = new THREE.MeshStandardMaterial({color: 0x456c75, roughness: 0.25, metalness: 0.18});
    const halfWidth = BUILDING.width / 2;
    const wingDepth = BUILDING.depth;
    const wingX = halfWidth - wingDepth / 2;
    const rearDepth = wingDepth / 4;
    const recessWidth = BUILDING.width - 2 * wingDepth;
    const rearZ = -wingDepth / 2 - rearDepth / 2;
    const eaves = BUILDING.totalHeight;

    function block(width, height, depth, x, y, z, material) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        if (material === brick) {
            const {uv, normal, position} = geometry.attributes;
            for (let i = 0; i < uv.count; i++) {
                const u = Math.abs(normal.getX(i)) > 0.5 ? position.getZ(i) : position.getX(i);
                uv.setXY(i, u / 2, position.getY(i) / 2);
            }
        }
        const part = new THREE.Mesh(geometry, material);
        part.position.set(x, y, z);
        part.castShadow = part.receiveShadow = true;
        buildingGroup.add(part);
    }

    // Split the rear volume at the wing corners to avoid overlapping facades.
    block(BUILDING.width, eaves, rearDepth, 0, eaves / 2, rearZ, brick);
    block(recessWidth, eaves, rearDepth, 0, eaves / 2, -wingDepth * 3 / 8, brick);
    for (const x of [-wingX, wingX]) {
        block(wingDepth, eaves, wingDepth, x, eaves / 2, 0, brick);
        block(wingDepth + 0.14, 0.48, wingDepth + 0.14, x, 0.24, 0, limestone);
        for (let floor = 1; floor <= BUILDING.floors; floor++) {
            block(wingDepth + 0.32, 0.15, wingDepth + 0.3, x, floor * BUILDING.floorHeight, 0, limestone);
        }
        block(wingDepth + 0.24, 0.22, wingDepth + 0.24, x, eaves + 0.15, 0, limestone);
    }
    // A glazed ground-floor vestibule connects the canopy to the recessed rear lobby.
    block(4.2, 2.95, wingDepth * 0.75, 0, 1.475, wingDepth / 8, glazing);
    block(4.5, 0.16, wingDepth * 0.75, 0, 2.99, wingDepth / 8, limestone);
    addWindows(glazing, bronze, limestone);
    addBalconies(bronze, limestone);

    // Entrance canopy
    const canopyGeo = new THREE.BoxGeometry(8, 0.2, 4);
    const canopy = new THREE.Mesh(canopyGeo, limestone);
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
    const archMat = new THREE.MeshStandardMaterial({ color: 0x26766d, roughness: 0.4, metalness: 0.3 });
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.position.set(0, 2.8, BUILDING.depth / 2 + 0.15);
    buildingGroup.add(arch);

    buildingGroup.castShadow = true;
    scene.add(buildingGroup);
}

function addWindows(glazing, frame, limestone) {
    // Batch repeated glazing, reveals, mullions and projecting sills by material.
    const pieces = new Map([[glazing, []], [frame, []], [limestone, []]]);
    const transform = new THREE.Object3D();
    function windowAt(x, y, z, angle, balconyDoor = false) {
        function piece(material, width, height, depth, u, v, offset) {
            transform.position.set(x + Math.cos(angle) * u + Math.sin(angle) * offset,
                y + v, z - Math.sin(angle) * u + Math.cos(angle) * offset);
            transform.rotation.y = angle;
            transform.scale.set(width, height, depth);
            transform.updateMatrix();
            pieces.get(material).push(transform.matrix.clone());
        }
        const h = balconyDoor ? 2.5 : 1.72;
        const center = balconyDoor ? -0.37 : 0;
        piece(frame, 1.92, h + 0.18, 0.16, 0, center, 0.08);
        piece(glazing, 1.73, h, 0.035, 0, center, 0.17);
        piece(frame, 0.055, h, 0.05, -0.24, center, 0.20);
        piece(frame, 1.73, 0.055, 0.05, 0, center + h * 0.27, 0.20);
        piece(limestone, 2.08, 0.10, 0.35, 0, center - h / 2 - 0.12, 0.13);
    }

    const front = BUILDING.depth / 2;
    const side = BUILDING.width / 2;
    for (let floor = 0; floor < BUILDING.floors; floor++) {
        const y = floor * BUILDING.floorHeight + BUILDING.floorHeight * 0.55;
        for (const sign of [-1, 1]) {
            const wing = sign * (side - front);
            for (let bay = 0; bay < 3; bay++) {
                windowAt(wing - 4 + bay * 3, y, front, 0, floor > 0 && bay === 1);
                windowAt(sign * side, y, -front + 2.5 + bay * 4, sign * Math.PI / 2);
            }
            for (const z of [0, 4.2]) {
                windowAt(sign * (side - BUILDING.depth), y, z, -sign * Math.PI / 2);
            }
            if (floor > 0) windowAt(sign * 2, y, -front / 2, 0);
        }
        for (let bay = 0; bay < 10; bay++) windowAt(-side + 2 + bay * 3.5, y, -front * 1.5, Math.PI);
    }
    const unitBox = new THREE.BoxGeometry(1, 1, 1);
    pieces.forEach((matrices, material) => {
        const batch = new THREE.InstancedMesh(unitBox, material, matrices.length);
        matrices.forEach((matrix, index) => batch.setMatrixAt(index, matrix));
        batch.castShadow = batch.receiveShadow = true;
        buildingGroup.add(batch);
    });
}

function addBalconies(balconyMat, concreteMat) {
    // Balconies on south facade for floors 1-4
    for (let f = 1; f < BUILDING.floors; f++) {
        const yPos = f * BUILDING.floorHeight + 0.15;
        
        // Left wing balconies
        const b1 = createBalcony(balconyMat, concreteMat);
        b1.position.set(-BUILDING.width / 2 + BUILDING.depth / 2, yPos, BUILDING.depth / 2 + 1);
        buildingGroup.add(b1);

        // Right wing balconies
        const b2 = createBalcony(balconyMat, concreteMat);
        b2.position.set(BUILDING.width / 2 - BUILDING.depth / 2, yPos, BUILDING.depth / 2 + 1);
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
    const railMat = balconyMat;
    // Front rail
    const frontRail = new THREE.Mesh(new THREE.BoxGeometry(6, 0.06, 0.06), railMat);
    frontRail.position.set(0, 1.1, 1);
    group.add(frontRail);
    // Railing posts
    for (let i = -3; i <= 3; i += 0.375) {
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

    const frame = new THREE.MeshStandardMaterial({color:0x9ba7ad, roughness:0.55, metalness:0.45});
    const pv = new THREE.MeshStandardMaterial({color:0x253e7d, roughness:0.34, metalness:0.32});
    const absorber = new THREE.MeshStandardMaterial({color:0x494037, roughness:0.55});
    const bronze = new THREE.MeshStandardMaterial({color:0xa67648, roughness:0.5});
    // +Z is south. Raising the north edge turns the upper surface toward +Z.
    const tilt = THREE.MathUtils.degToRad(15);
    function addRack(name, x, roofY, z, width, depth, faceMaterial, rimMaterial) {
        const rack = new THREE.Group();
        rack.name = name;
        rack.position.set(x, roofY, z);
        const deck = new THREE.Group();
        deck.rotation.x = tilt;
        deck.position.y = 0.24 + depth * Math.sin(tilt) / 2;
        const rim = new THREE.Mesh(new THREE.BoxGeometry(width+0.06,0.06,depth+0.06),rimMaterial);
        const face = new THREE.Mesh(new THREE.BoxGeometry(width,0.025,depth),faceMaterial);
        face.position.y = 0.04;
        face.castShadow = face.receiveShadow = rim.castShadow = true;
        deck.add(rim,face);
        rack.add(deck);
        for (const side of [-1,1]) {
            const offset = side * depth * 0.36;
            const height = deck.position.y - offset * Math.sin(tilt) - 0.03;
            const support = new THREE.Mesh(new THREE.BoxGeometry(width*0.72,height,0.065),frame);
            support.position.set(0,height/2,offset*Math.cos(tilt));
            rack.add(support);
        }
        solarPanels.add(rack);
    }

    const wingX = (BUILDING.width - BUILDING.depth) / 2;
    const wingRoof = BUILDING.totalHeight + 0.26;
    for (const center of [-wingX,wingX]) {
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 5; col++) {
                addRack('PV module',center+(col-2)*2.24,wingRoof,(row-2.5)*1.96,
                    2.04,1.13,pv,frame);
            }
        }
    }
    // Separate 20 m² of thermal aperture on the rear strip, away from the lift and stair vent.
    for (let col = 0; col < 5; col++) {
        addRack('Hot-water collector',-15+col*2.25,BUILDING.totalHeight+0.16,
            -8.85,2,2,absorber,bronze);
    }
    scene.add(solarPanels);
}

// ============================================================
// GREEN ROOF
// ============================================================
function createGreenRoof() {
    // Legacy feature key retained for existing menu/test compatibility; no vegetation.
    greenRoofGroup = new THREE.Group();
    greenRoofGroup.name = 'roof';
    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(BUILDING.width, 0.16, BUILDING.depth / 2),
        new THREE.MeshStandardMaterial({ color: 0xd4c9b8, roughness: 0.85 })
    );
    roof.position.set(0, BUILDING.totalHeight + 0.08, -BUILDING.depth / 2);
    roof.receiveShadow = true;
    greenRoofGroup.add(roof);
    // Schematic MRL lift overrun; final shaft/headroom dimensions require supplier design.
    const overrun = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 2.6),
        new THREE.MeshStandardMaterial({color: 0xd4c9b8, roughness: 0.85}));
    overrun.position.set(6, BUILDING.totalHeight + 0.9, -7);
    overrun.castShadow = true;
    greenRoofGroup.add(overrun);
    scene.add(greenRoofGroup);
}

// ============================================================
// CENTRAL COURTYARD
// ============================================================
function createCourtyard() { createCommunityCourtyard(); }

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

    groundLabel(waterSystemGroup, 'Rain tank · 15 m³', 23,-3,4.5,0.90);

    // The treatment unit is a separate vessel. Its model dimensions are schematic.
    const greyTank = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 2.5), siteMaterial(0x507b53));
    greyTank.position.set(23, -0.22, 3);
    greyTank.name = 'Greywater treatment tank';
    waterSystemGroup.add(greyTank);
    groundLabel(waterSystemGroup, 'Greywater treatment', 23,3,4.5,0.64);

    const blue = 0x2196f3;
    const green = 0x438347;
    // Blue: corner downpipe to cistern, then a dedicated toilet supply back into the building.
    siteLine(waterSystemGroup, [[18.15,0.28,7],[19,0.28,7],[19,0.28,-4],[23,0.28,-4]],blue,0.08);
    siteLine(waterSystemGroup, [[23,0.45,-2],[17.8,0.45,-2]],blue,0.09);
    // Green: separate bathroom drains to treatment, then drip lines in the courtyard.
    siteLine(waterSystemGroup, [[17.8,0.5,3],[23,0.5,3]],green,0.09);
    siteLine(waterSystemGroup, [[23,0.4,3],[23,0.4,6],[20,0.4,6],[20,0.4,12],[14,0.4,12],[14,0.4,27],[5.8,0.4,27],[5.8,0.4,22.3]],green,0.09);
    siteLine(waterSystemGroup, [[5,0.4,22.3],[6.6,0.4,22.3]],green,0.04);
    [-0.8,0,0.8].forEach(dx => siteLine(waterSystemGroup,[[5.8+dx,0.4,22.3],[5.8+dx,0.4,19.7]],green,0.035));

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
                    new THREE.BoxGeometry(0.46, 2, 0.09),
                    finMat
                );
                fin.position.set(BUILDING.width / 2 + 0.2, yPos, zPos + offset);
                fin.castShadow = true;
                shadingGroup.add(fin);
            });
            // West fins
            [-0.9, 0.9].forEach(offset => {
                const fin = new THREE.Mesh(
                    new THREE.BoxGeometry(0.46, 2, 0.09),
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
    const ventZ = -BUILDING.depth / 4 - 1.5;
    tower.position.set(0, BUILDING.totalHeight + 1.25, ventZ);
    tower.castShadow = true;
    ventilationGroup.add(tower);

    // Vent slats on tower
    const slatMat = new THREE.MeshStandardMaterial({ color: 0x546E7A, roughness: 0.3, metalness: 0.6 });
    for (let i = 0; i < 4; i++) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.01), slatMat);
        slat.position.set(0, BUILDING.totalHeight + 0.5 + i * 0.5, ventZ + 1.01);
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
function createLandscaping() { createSiteLandscape(); }

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
function createSurroundings() { createSiteStreet(); }



function highlightFeature(featureName) {
    // Reset previous highlight
    resetHighlight();

    currentHighlight = featureName;

    // Update button states
    document.querySelectorAll('.feature-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.feature-btn').forEach(btn => { if(btn.dataset.feature === featureName) btn.classList.add('active'); });

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

    applyFeatureHighlight(featureName);

    // Camera focus on feature
    const targets = {
        solar: { pos: [30, 30, 20], target: [0, BUILDING.totalHeight, 0] },
        greenroof: { pos: [25, 28, -15], target: [0, BUILDING.totalHeight, -BUILDING.depth / 2] },
        courtyard: { pos: [35, 30, 48], target: [0, 1, 21] },
        water: { pos: [30, 15, -5], target: [BUILDING.width / 2 + 3, 2, -3] },
        insulation: { pos: [35, 20, 25], target: [0, 8, 0] },
        ventilation: { pos: [15, 25, 10], target: [0, BUILDING.totalHeight / 2, 0] },
        shading: { pos: [25, 15, 25], target: [0, 8, BUILDING.depth / 2] },
        landscape: { pos: [-46, 28, 48], target: [-12, 2, 18] },
        community: { pos: [35, 30, 48], target: [0, 1, 21] },
        trees: { pos: [-46, 28, 48], target: [-15, 2, 18] },
        paving: { pos: [46, 40, 53], target: [10, 0, 20] },
        raingarden: { pos: [49, 28, 40], target: [19, 1, 15] },
        access: { pos: [36, 35, 55], target: [0, 1, 24] },
        parking: { pos: [53, 26, 40], target: [28, 0, 20] },
        waste: { pos: [-38, 20, 41], target: [-20, 1, 24] },
    };

    if (featureName === 'site') { setSitePlan(true); return; }
    if (planMode) return;
    if (targets[featureName]) {
        const t = targets[featureName];
        animateCamera(
            new THREE.Vector3(...t.pos),
            new THREE.Vector3(...t.target)
        );
    }
}

function resetHighlight() { restoreFeatureMaterials(); currentHighlight=null; }

function closeDetail() {
    document.getElementById('feature-detail').style.display = 'none';
    resetHighlight();
    document.querySelectorAll('.feature-btn').forEach(btn => btn.classList.remove('active'));
    if (planMode) return;
    animateCamera(
        new THREE.Vector3(65, 48, 72),
        new THREE.Vector3(0, 5, 8)
    );
}

// ============================================================
// CAMERA ANIMATION
// ============================================================
function animateCamera(targetPos, targetLookAt) {
    cancelAnimationFrame(cameraAnimationFrame);
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
            cameraAnimationFrame = requestAnimationFrame(update);
        }
    }
    update();
}

// ============================================================
// TIME OF DAY
// ============================================================
function setTimeOfDay(minutes) {
    const direction = sunDirection(minutes, siteDate);
    const daylight = THREE.MathUtils.smoothstep(direction.y, -0.10, 0.20);
    const highSun = THREE.MathUtils.smoothstep(direction.y, 0, 0.45);
    directionalLight.position.copy(direction).multiplyScalar(90);
    directionalLight.visible = directionalLight.castShadow = direction.y > 0;
    directionalLight.intensity = 1.2 * THREE.MathUtils.smoothstep(direction.y, 0, 0.18);
    directionalLight.color.setHex(0xff9d64).lerp(new THREE.Color(0xfff8e1), highSun);
    scene.background.setHex(0x17233b).lerp(new THREE.Color(0xdbad98), daylight)
        .lerp(new THREE.Color(0xc8d9de), highSun);
    scene.fog.color.copy(scene.background);
    ambientLight.intensity = 0.16 + 0.24 * daylight;
    hemisphereLight.intensity = 0.15 + 0.5 * daylight;
    windowLights.forEach(light => { light.intensity = 0.8 * (1 - daylight); });
    const label = [Math.floor(minutes / 60), minutes % 60].map(n => String(n).padStart(2,'0')).join(':');
    const slider = document.getElementById('site-time');
    slider.value = minutes;
    slider.setAttribute('aria-valuetext', label + ' Samarkand time');
    document.getElementById('time-readout').textContent = label;
}

// ============================================================
// ANIMATION LOOP
// ============================================================
function animate() {
    animationId = requestAnimationFrame(animate);
    controls.update();

    renderer.render(scene, camera);
}

// ============================================================
// RESIZE HANDLER
// ============================================================
function onWindowResize() {
    perspectiveCamera.aspect = window.innerWidth / window.innerHeight;
    perspectiveCamera.updateProjectionMatrix();
    fitSitePlan();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
