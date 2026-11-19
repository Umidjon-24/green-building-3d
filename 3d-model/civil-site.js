// Civil / Landscape concept layer. Metres; north = -Z, east = +X.
// Schematic for the design charrette, not a surveyed or engineered site plan.
const SITE = { width: 72, depth: 58, centerZ: 7, north: -22, south: 36 };
const siteGroups = {};
let planCamera, perspectiveCamera, planMode = false, planLabels;
let cameraAnimationFrame = null;
const savedMaterials = new Map();

const civilFeatures = {
    site: { title: 'Site Plan', desc: 'A compact 72 × 58 m concept plot keeps shared outdoor space close to all 40 homes. Short paths and a single edge parking court reduce the amount of paving and infrastructure to build.', stats: [['Plot', '4,176 m² (concept)'], ['Orientation', 'North up in plan'], ['Building', '5 storeys · 40 homes']] },
    community: { title: 'Courtyard Community Space', desc: 'A car-free courtyard beside the entrance combines play, shaded benches and shared planting. Durable, simple equipment and communal space provide everyday amenities at low cost per household.', stats: [['Location', 'South of entrance'], ['Play area', '8 × 7 m'], ['Seating', '4 benches']] },
    trees: { title: 'Shade Trees', desc: 'Deciduous trees on the south and west shade paths and lower façades in summer, then admit more sunlight after leaf fall. Locally suitable species and mulched tree pits reduce maintenance and irrigation demand.', stats: [['Strategy', 'South + west shade'], ['Planting', 'Deciduous canopy'], ['Ground layer', 'Low shrubs + mulch']] },
    paving: { title: 'Permeable Paving', desc: 'Open-jointed pavers over a draining aggregate base allow rain to soak into paths and parking rather than run straight to drains. Modular units can be lifted and reused for repairs, reducing replacement costs.', stats: [['Surfaces', 'Paths, plaza, parking'], ['Finish', 'Open-jointed pavers'], ['Design check', 'Soil / infiltration test']] },
    raingarden: { title: 'Rain Garden', desc: 'A shallow planted swale beside parking receives surface runoff and cistern overflow, while a separate greywater treatment tank feeds courtyard drip irrigation. Simple planted drainage reduces demand on pipes and potable water; sizing depends on rainfall and soil tests.', stats: [['Swale', '18 m planted strip'], ['Green route', 'Greywater tank → drip beds'], ['Teal arrows', 'Runoff → rain garden']] },
    access: { title: 'Pedestrian & Bike Access', desc: 'A continuous 2 m path links the street-side bus stop, bicycle racks, entrance plaza and courtyard without passing through parking. Step-free routes and simple cycle stands support inexpensive everyday travel.', stats: [['Main path', '2 m clear width'], ['Bike parking', '6 stands / up to 12 bikes'], ['Street link', 'Bus stop + sidewalk']] },
    parking: { title: 'Parking', desc: 'Six compact parking bays sit at the east edge, separated from play by planting and paths. Shared access and permeable paving limit hard surfaces and construction costs while keeping cars out of the courtyard.', stats: [['Spaces', '6 incl. 1 wider bay'], ['Access', 'East-edge drive'], ['Surface', 'Permeable block paving']] },
    waste: { title: 'Waste & Composting', desc: 'A small screened sorting point at the courtyard edge separates recyclables and residual waste, with a covered compost bin for suitable organic material. Shared collection and using mature compost in planting beds can reduce waste and soil-improvement costs.', stats: [['Sorting', 'Paper · containers · residual'], ['Organics', 'Covered compost bin'], ['Location', 'Courtyard service edge']] }
};

function siteMaterial(color) { return new THREE.MeshStandardMaterial({ color, roughness: 0.88 }); }
function siteBox(group, x, y, z, w, h, d, color) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), siteMaterial(color));
    mesh.position.set(x, y, z); mesh.castShadow = h > 0.2; mesh.receiveShadow = true;
    group.add(mesh); return mesh;
}
function siteGroup(name) {
    const group = new THREE.Group(); group.name = name;
    siteGroups[name] = group; scene.add(group); return group;
}
function siteLine(group, points, color, radius = 0.055) {
    for (let i = 1; i < points.length; i++) {
        const a = new THREE.Vector3(...points[i - 1]), b = new THREE.Vector3(...points[i]);
        const delta = b.clone().sub(a);
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), 6), siteMaterial(color));
        mesh.position.copy(a.add(b).multiplyScalar(0.5));
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
        group.add(mesh);
    }
}
function groundLabel(group, text, x, z, width, y = 0.24, primary = false) {
    const canvas = document.createElement('canvas'); canvas.width = Math.max(100, text.length * 45 + 48); canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = primary ? '#23483e' : '#fffdf4'; ctx.fillRect(0, 0, canvas.width, 96);
    ctx.fillStyle = primary ? '#fffdf4' : '#233c34'; ctx.font = 'bold 64px Segoe UI, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, canvas.width / 2, 46, canvas.width - 22);
    const texture = new THREE.CanvasTexture(canvas); texture.encoding = THREE.sRGBEncoding;
    const annotation = group === planLabels;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, width * 96 / canvas.width), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, depthTest: !annotation, depthWrite: !annotation }));
    if (annotation) mesh.renderOrder = 10;
    mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, y, z); group.add(mesh); return mesh;
}
let paverTexture;
function pavers(group, x, z, w, d, color = 0xc4b89e) {
    if (!paverTexture) {
        const tile = document.createElement('canvas'); tile.width = tile.height = 256;
        const ctx = tile.getContext('2d');
        ctx.fillStyle = '#bcb7aa'; ctx.fillRect(0, 0, 256, 256);
        const tones = ['#fffefa','#f5f3ec','#eae8e1','#faf9f5'];
        for (let row = 0; row < 4; row++) {
            for (let col = -1; col < 2; col++) {
                ctx.fillStyle = tones[(row * 3 + (col + 2) % 2) % 4];
                ctx.fillRect(128 * col + 64 * (row % 2) + 2, 64 * row + 2, 124, 60);
            }
        }
        paverTexture = new THREE.CanvasTexture(tile);
        paverTexture.wrapS = paverTexture.wrapT = THREE.RepeatWrapping;
        paverTexture.encoding = THREE.sRGBEncoding;
    }
    const surface = new THREE.PlaneGeometry(w, d);
    surface.rotateX(-Math.PI / 2);
    const vertices = surface.attributes.position, uv = surface.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (vertices.getX(i) + x) / 2, (vertices.getZ(i) + z) / 2);
    const material = siteMaterial(color); material.map = paverTexture;
    const mesh = new THREE.Mesh(surface, material);
    // Keep the dedicated pedestrian route continuous across the courtyard.
    mesh.position.set(x, group === siteGroups.access ? 0.15 : 0.14, z);
    mesh.receiveShadow = true; group.add(mesh);
}
function planting(group, x, z, w, d) {
    siteBox(group, x, 0.07, z, w, 0.12, d, 0x86735a);
    const rows = Math.max(1, Math.floor(d / 0.95)), cols = Math.max(1, Math.floor(w / 0.95));
    const shrubs = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), siteMaterial(0xffffff), rows * cols);
    const pose = new THREE.Object3D(), color = new THREE.Color();
    const palette = [0x6d8451,0x84965e,0x60784e,0xa0ab72];
    let index = 0;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const phase = row * 1.7 + col * 2.8;
            const size = 0.47 + 0.08 * Math.sin(phase);
            pose.position.set((col + 0.5) * w / cols - w / 2 + 0.12 * Math.sin(phase), 0.34,
                (row + 0.5) * d / rows - d / 2 + 0.1 * Math.cos(phase));
            pose.scale.set(size, size * 0.74, size * 0.9);
            pose.rotation.y = phase; pose.updateMatrix();
            shrubs.setMatrixAt(index, pose.matrix);
            shrubs.setColorAt(index++, color.setHex(palette[(Math.floor(row / 3) + col) % palette.length]));
        }
    }
    shrubs.position.set(x, 0, z); shrubs.receiveShadow = true; group.add(shrubs);
}
function bench(group, x, z, rotation = 0) {
    const g = new THREE.Group(); group.add(g); g.position.set(x, 0.15, z); g.rotation.y = rotation;
    siteBox(g, 0, 0.45, 0, 2.4, 0.12, 0.6, 0x876347);
    siteBox(g, 0, 0.82, -0.27, 2.4, 0.6, 0.09, 0x876347);
    [-0.9, 0.9].forEach(px => siteBox(g, px, 0.22, 0, 0.12, 0.45, 0.55, 0x455a64));
}

function createCommunityCourtyard() {
    courtyardGroup = siteGroup('community'); courtyardGroup.name = 'courtyard';
    pavers(courtyardGroup, 0, 21, 22, 16, 0xcbbd9d);
    // Children's play surface and simple, durable timber equipment.
    siteBox(courtyardGroup, -5.5, 0.18, 21, 8, 0.12, 7, 0xd1a877);
    siteBox(courtyardGroup, -7.3, 0.28, 22.4, 2.7, 0.18, 2.3, 0xe4c99a);
    [[-7.6, 18.4], [-4.4, 18.4]].forEach(([x, z]) => siteBox(courtyardGroup, x, 1.3, z, 0.15, 2.4, 0.15, 0x72533e));
    siteBox(courtyardGroup, -6, 2.5, 18.4, 3.5, 0.18, 0.18, 0x72533e);
    [-6.8, -5.2].forEach(x => {
        siteLine(courtyardGroup, [[x - 0.3, 2.45, 18.4], [x - 0.3, 0.7, 18.4]], 0x455a64, 0.025);
        siteLine(courtyardGroup, [[x + 0.3, 2.45, 18.4], [x + 0.3, 0.7, 18.4]], 0x455a64, 0.025);
        siteBox(courtyardGroup, x, 0.65, 18.4, 0.8, 0.1, 0.4, 0x526f7b);
    });
    [[-8, 26, Math.PI], [6, 17, 0], [6, 25, Math.PI], [9, 21, -Math.PI / 2]].forEach(p => bench(courtyardGroup, ...p));
    planting(courtyardGroup, 5.8, 21, 4, 3);
    // Retain small shared beds in the original inner court without altering the building.
    planting(courtyardGroup, 0, 0, 5, 4);
}

function createSiteLandscape() {
    landscapeGroup = siteGroup('landscape');
    const trees = siteGroup('trees');
    // No evergreen row on the solar-facing edges: all of these are deciduous.
    [[-27,-13],[-27,-5],[-27,3],[-27,11],[-27,21],[-25,32],[-17,32],[-9,32],[8,32],[16,32],[-13,17],[12,24],[8,15]].forEach(([x,z], i) => {
        const tree = createDeciduousTree(i < 10 ? 6.5 : 4.8); tree.position.set(x, 0.15, z); trees.add(tree);
        siteBox(landscapeGroup, x, 0.08, z, 2.8, 0.12, 2.8, 0x958367);
    });
    planting(landscapeGroup, -31, 4, 5, 44);
    planting(landscapeGroup, -17, 32.5, 23, 4);
    planting(landscapeGroup, 12, 32.5, 16, 4);
    planting(landscapeGroup, 0, -18, 38, 3);
    planting(landscapeGroup, -16, 22, 4, 12);
}

function createPlanAnnotations() {
    const ink = 0x304d44;
    planLabels = new THREE.Group(); scene.add(planLabels); planLabels.visible = false;
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(900,900), new THREE.MeshBasicMaterial({color:0xefeee6, toneMapped:false}));
    paper.rotation.x = -Math.PI / 2; paper.position.y = -0.07; planLabels.add(paper);

    // Dimension lines align with the plot corners; gaps keep the figures legible.
    const marks = [
        [-36,-25,-3,-25], [3,-25,36,-25], [-36,-26,-36,-22.5], [36,-26,36,-22.5],
        [-39,-22,-39,5], [-39,9,-39,36], [-40,-22,-36.5,-22], [-40,36,-36.5,36],
        [39,-16,39,-21], [39,-21,38,-18.8], [39,-21,40,-18.8],
    ];
    const points = marks.flatMap(([x1,z1,x2,z2]) => [new THREE.Vector3(x1,0.22,z1),new THREE.Vector3(x2,0.22,z2)]);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    planLabels.add(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color:ink})));
    groundLabel(planLabels, 'N', 39,-23,1.8);
    groundLabel(planLabels, '72 m', 0,-25,4.8);
    groundLabel(planLabels, '58 m', -39,7,4.8);
    [
        ['5 STOREYS / 40 HOMES',0,-6,23,19,true], ['Entrance',0,10.8,7],
        ['Bikes',-11,10.8,4.5], ['Play',-5.5,23,4.3], ['Community courtyard',0,28,16,0.24,true],
        ['Shade trees',-28,28,9], ['Parking · 6 bays',28,6,12], ['Rain garden',23,30.8,9],
        ['Sort + compost',-20,26.5,10], ['Drip irrigation',10,24.6,9], ['Bus stop',-6,36,6.5]
    ].forEach(a => groundLabel(planLabels,...a));
    // Alternating five-metre segments stay to scale at every zoom.
    siteBox(planLabels,-24,0.2,39,5,0.05,0.45,ink);
    siteBox(planLabels,-19,0.2,39,5,0.05,0.45,0xf4eee0);
    groundLabel(planLabels,'0',-26.5,40.6,1.3);
    groundLabel(planLabels,'5',-21.5,40.6,1.3);
    groundLabel(planLabels,'10 m',-16.5,40.6,3.4);
}

function createCivilSite() {
    Object.assign(featureData, civilFeatures);
    // The courtyard's original menu item follows the new, visible community space.
    featureData.courtyard = { ...civilFeatures.community, title: 'Central Courtyard' };
    featureData.landscape = { ...civilFeatures.trees, title: 'Sustainable Landscaping' };
    const plot = siteGroup('site');
    siteBox(plot, 0, -0.015, SITE.centerZ, SITE.width, 0.05, SITE.depth, 0xb5be90);
    siteLine(plot, [[-36,0.2,-22],[36,0.2,-22],[36,0.2,36],[33,0.2,36]], 0x315f54, 0.10);
    siteLine(plot, [[27,0.2,36],[1,0.2,36]], 0x315f54, 0.10);
    siteLine(plot, [[-1,0.2,36],[-36,0.2,36],[-36,0.2,-22]], 0x315f54, 0.10);

    const paths = siteGroup('access');
    pavers(paths, 0, 23, 2, 30); // Sidewalk to entrance: clear, direct, step-free.
    pavers(paths, 0, 11.7, 10, 3.4); // entrance plaza below retained canopy
    pavers(paths, -21, 1, 2, 28); pavers(paths, 20, 2, 2, 30);
    pavers(paths, -10.5, 14, 23, 2); pavers(paths, 10, 14, 22, 2);
    pavers(paths, 0, -13, 44, 2);
    pavers(paths, 13.5, 29, 29, 2); // accessible bay transfer strip to courtyard
    pavers(paths, -16, 28, 12, 2); // sorting point service path
    pavers(paths, -20, 26.5, 2, 3); // connects collection pad to service path
    pavers(paths, -10, 12, 7, 3); // bike pad
    for (let i = 0; i < 6; i++) {
        const x = -12.5 + i;
        siteLine(paths, [[x,0.2,11.3],[x,1.1,11.3],[x,1.1,12.7],[x,0.2,12.7]], 0x455a64, 0.055);
    }
    // Two parked bikes make the cycle stands legible in the perspective model.
    [-12, -10].forEach(x => {
        [11.4,12.6].forEach(z => {
            const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.32,0.045,6,12),siteMaterial(0x37474f));
            wheel.rotation.y = Math.PI / 2; wheel.position.set(x,0.48,z); paths.add(wheel);
        });
        siteLine(paths, [[x,0.48,11.4],[x,1,11.9],[x,0.48,12.6],[x,0.48,11.4],[x,0.95,12.3],[x,1.15,12.6]], 0x387d8c, 0.045);
    });
    const parking = siteGroup('parking');
    pavers(parking, 26, 18, 5.5, 20, 0xa4aa9c);
    pavers(parking, 31.5, 22, 5.5, 28, 0xb2b4a7);
    for (let i=0; i<6; i++) {
        const z = 9 + i*3;
        siteBox(parking, 26, 0.17, z, 5.2, 0.025, 0.08, 0xf4eee0);
        if (i<3) {
            siteBox(parking,26,0.65,z+1.4,4.1,0.9,1.8,[0x718a97,0xb48a6b,0xe0ddd0][i]);
            siteBox(parking,26,1.23,z+1.4,2.1,0.45,1.65,0x58717a);
        }
    }
    siteBox(parking,26,0.17,28,5.2,0.025,0.08,0xf4eee0);
    groundLabel(parking, 'ACCESS', 26, 26, 3.5);
    // Hatched transfer strip next to the wider end bay, connected to the path.
    for(let x=23.5;x<28.5;x+=0.6) siteBox(parking,x,0.18,28.4,0.08,0.03,0.7,0xf4eee0);

    const rain = siteGroup('raingarden');
    planting(rain, 21.9, 18, 1.6, 18);
    siteBox(rain,21.9,0.16,18,0.4,0.06,18,0x6d9290);
    // Surface runoff to planted swale, distinct from the blue irrigation pipe.
    [12,18,23].forEach(z => {
        const arrow = new THREE.ArrowHelper(new THREE.Vector3(-1,0,0),new THREE.Vector3(24,0.3,z),2,0x167c80,0.5,0.35); rain.add(arrow);
    });
    // Excess roof runoff bypasses the reuse pipes and drains to the swale.
    siteLine(rain, [[23,0.6,-3],[27,0.6,-3],[27,0.6,7],[21.9,0.6,7],[21.9,0.6,9]],0x167c80,0.07);

    const waste = siteGroup('waste');
    pavers(waste,-20,24,5,4);
    [-21.7,-20.6,-19.5,-18.4].forEach((x,i) => {
        siteBox(waste,x,0.7,24,0.85,1.1,0.9,[0x4477a5,0xc3a44f,0x65716c,0x78563e][i]);
        siteBox(waste,x,1.3,24,0.95,0.1,1,[0x315b7b,0x9a8136,0x45544e,0x62442f][i]);
    });
    siteBox(waste,-20,0.85,22.1,5.2,1.5,0.12,0x8a7555);
    siteBox(waste,-22.6,0.85,24,0.12,1.5,3.8,0x8a7555);

    createPlanAnnotations();
    setupSiteInteraction();
}

function createSiteStreet() {
    const street = new THREE.Group(); scene.add(street);
    siteBox(street,0,0.02,42,160,0.05,8,0x424242);
    siteBox(street,0,0.06,37,160,0.08,2,0x9e9e9e);
    for(let x=-75;x<80;x+=5) siteBox(street,x,0.06,42,2,0.025,0.15,0xeeeeee);
    // Drive opening over sidewalk, at the plot's east edge only.
    siteBox(street,31.5,0.12,37,5.5,0.08,2,0xb2b4a7);
    const bus = siteGroups.access;
    siteBox(bus,-6,2.5,37,5,0.15,1.8,0x527366);
    [-8,-4].forEach(x => siteBox(bus,x,1.3,37.7,0.12,2.5,0.12,0x455a64));
    bench(bus,-6,37.4);
    siteBox(bus,-2.5,1.5,37.6,0.08,3,0.08,0x455a64);
    siteBox(bus,-2.5,2.8,37.6,0.8,0.7,0.12,0x2874a0);
}

function featureGroups() {
    return { solar:solarPanels, greenroof:greenRoofGroup, courtyard:courtyardGroup,
        water:waterSystemGroup, insulation:buildingGroup, ventilation:ventilationGroup,
        shading:shadingGroup, landscape:landscapeGroup, ...siteGroups };
}
function applyFeatureHighlight(name) {
    const groups = featureGroups();
    const selectedKeys = name === 'site' ? Object.keys(siteGroups) :
        name === 'paving' ? ['access','parking','community'] :
        name === 'landscape' ? ['landscape','trees','raingarden'] :
        name === 'water' ? ['water','raingarden'] : [name];
    const selected = new Set(selectedKeys.map(key => groups[key]).filter(Boolean));
    const selectedMaterials = new Set();
    selected.forEach(g => g.traverse(c => { if(c.isMesh) selectedMaterials.add(c.material); }));
    const materials = new Set();
    Object.values(groups).forEach(g => g && g.traverse(c => { if(c.isMesh) materials.add(c.material); }));
    materials.forEach(m => {
        savedMaterials.set(m, {opacity:m.opacity, transparent:m.transparent, emissive:m.emissive && m.emissive.getHex(), intensity:m.emissiveIntensity});
        if(selectedMaterials.has(m)) { if(m.emissive) {m.emissive.setHex(0x2e7d32);m.emissiveIntensity=0.3;} }
        else {m.transparent=true;m.opacity=Math.min(m.opacity,0.35);}
    });
}
function restoreFeatureMaterials() {
    savedMaterials.forEach((v,m) => { m.opacity=v.opacity; m.transparent=v.transparent;
        if(m.emissive) {m.emissive.setHex(v.emissive);m.emissiveIntensity=v.intensity;}
    }); savedMaterials.clear();
}

function setupSiteInteraction() {
    perspectiveCamera = camera;
    planCamera = new THREE.OrthographicCamera(-50,50,45,-45,0.1,500);
    planCamera.position.set(0,110,9); planCamera.up.set(0,0,-1); planCamera.lookAt(0,0,9);
    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
    let down = null;
    renderer.domElement.addEventListener('pointerdown', e => {down=[e.clientX,e.clientY];});
    renderer.domElement.addEventListener('pointerup', e => {
        const origin=down; down=null;
        if(e.button!==0 || !origin || Math.hypot(e.clientX-origin[0],e.clientY-origin[1])>5) return;
        const rect=renderer.domElement.getBoundingClientRect();
        pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
        raycaster.setFromCamera(pointer,camera);
        const hits=raycaster.intersectObjects(scene.children,true);
        for(const hit of hits) {
            let visible=hit.object;
            while(visible && visible.visible) visible=visible.parent;
            if(visible || hit.object.parent===planLabels) continue;
            let obj=hit.object;
            while(obj && !obj.userData.feature) obj=obj.parent;
            if(obj) {highlightFeature(obj.userData.feature);return;}
            // Opaque building/context occludes features behind it.
            if(hit.object.isMesh && hit.object.material.opacity>0.5) return;
        }
    });
    Object.entries(featureGroups()).forEach(([key,g]) => {if(g)g.userData.feature=key;});
    courtyardGroup.userData.feature='community';
    window.addEventListener('keydown',e=>{if(e.key==='Escape') closeDetail();});
}
function fitSitePlan() {
    if(!planCamera) return;
    const aspect=window.innerWidth/window.innerHeight;
    const halfHeight=Math.max(45,47/aspect);
    planCamera.left=-halfHeight*aspect; planCamera.right=halfHeight*aspect;
    planCamera.top=halfHeight; planCamera.bottom=-halfHeight; planCamera.updateProjectionMatrix();
}
function setSitePlan(enabled) {
    cancelAnimationFrame(cameraAnimationFrame);
    if(enabled===planMode) {if(enabled)fitSitePlan();return;}
    planMode=enabled; document.body.classList.toggle('site-plan',enabled);
    document.getElementById('site-view').setAttribute('aria-pressed',String(enabled));
    document.getElementById('perspective-view').setAttribute('aria-pressed',String(!enabled));
    planLabels.visible=enabled;
    controls.dispose(); camera=enabled?planCamera:perspectiveCamera;
    controls=new THREE.OrbitControls(camera,renderer.domElement);
    controls.enableDamping=true;controls.dampingFactor=0.08;
    if(enabled) {
        camera.zoom=1;camera.position.set(0,110,9);camera.up.set(0,0,-1);
        controls.target.set(0,0,9);controls.enableRotate=false;
        controls.minZoom=0.65;controls.maxZoom=4;fitSitePlan();
    } else {
        camera.position.set(65,48,72);controls.target.set(0,5,8);
        controls.minDistance=20;controls.maxDistance=150;controls.maxPolarAngle=Math.PI/2.05;
    }
    controls.update();
}
function showSitePlan() {
    if(engineeringMode!=='full')setEngineeringMode('full');
    resetHighlight();document.getElementById('feature-detail').style.display='none';
    document.querySelectorAll('.feature-btn').forEach(b=>b.classList.remove('active'));
    setSitePlan(true);
}
function showPerspective() { if(engineeringMode!=='full')setEngineeringMode('full'); closeDetail();setSitePlan(false); }
