/* Engineering exhibits for the five-storey Samarkand charrette. Distances in the
   detail exhibits are illustrative; the construction plates use the viewer footprint. */
const engineering = {
    full: ['Full Building', 'Five storeys around a south-facing courtyard.', '40 apartments · 30 kWp rooftop PV'],
    architecture: ['Architecture', 'The two wings frame the entrance and shade the courtyard.', 'Cream · building fabric | Blue · glazing'],
    envelope: ['Energy Envelope', 'A cutaway through one south-facing bay reveals the wall, window, roof and slab edge.', 'Ivory · AAC | Ochre · insulation | Rust · possible heat-loss path'],
    heating: ['Heating & Cooling', 'Shared gas boilers supply apartment radiators. Opposing windows and local extract fans provide summer ventilation.', 'Red / blue · heating supply / return | Gold · solar hot water'],
    solar: ['Solar', 'South-facing PV modules supply daytime loads. The separate collectors heat a shared water tank.', 'Blue · 60 PV modules, 30 kWp | Bronze · 20 m² thermal collectors'],
    water: ['Water', 'Roof water supplies toilets. Showers and basins drain to a separate treatment unit for garden irrigation.', 'Cyan · potable | Blue · rainwater | Green · greywater'],
    circular: ['Circular Materials', 'The concrete frame stays in place. The exploded bay shows which window, finish and service parts can be reached for repair.', 'Grey · structure | Ivory · infill | Ochre · insulation'],
    construction: ['Construction', 'Follow the five-storey frame, enclosure and fit-out in sequence.', 'Construction sequence and frame spacing are illustrative.']
};
let engineeringMode = 'full', engineeringLayer, engineeringSky;
const previousVisibility = new Map();
const palette = {concrete:0xb2aca1, aac:0xe4d8bf, wool:0xdba447, finish:0xf1ede0, dark:0x334742,
    glass:0x77afb9, hot:0xb95340, cold:0x537a90, rain:0x27689d, grey:0x4e844d, potable:0x00a7b0};
function part(g,x,y,z,w,h,d,color) { return siteBox(g,x,y,z,w,h,d,color); }
function vessel(g,x,y,z,r,h,c) {
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32),siteMaterial(c));
    mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);return mesh;
}
function path3(g,pts,c,r=0.055) { siteLine(g,pts,c,r); }
function flow(g,start,end,color) {
    const a=new THREE.Vector3(...start), d=new THREE.Vector3(...end).sub(a);
    const unit=d.clone().normalize();
    const head=a.clone().addScaledVector(unit,d.length()-.22);
    path3(g,[start,head.toArray()],color,.031);
    const cone=new THREE.Mesh(new THREE.ConeGeometry(.10,.28,10),siteMaterial(color));
    cone.position.copy(head).addScaledVector(unit,.09);
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),unit);g.add(cone);
}
function tag(g,text,x,y,z,width=3) {
    const c=document.createElement('canvas');c.width=768;c.height=90;
    const ctx=c.getContext('2d');ctx.fillStyle='#f8f7ef';ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle='#253c33';ctx.font='600 54px Segoe UI, Arial';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(text,c.width/2,44,c.width-32);
    const map=new THREE.CanvasTexture(c);map.encoding=THREE.sRGBEncoding;
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map,depthTest:false,toneMapped:false}));
    s.position.set(x,y,z);s.scale.set(width,width*90/768,1);s.renderOrder=5;g.add(s);
}
function windowUnit(g,x,y,z,detailGlazing=true) {
    for (const dx of [-1,0,1]) part(g,x+dx,y,z,.085,1.65,.14,palette.dark);
    for (const dy of [-.8,.8]) part(g,x,y+dy,z,2.08,.085,.14,palette.dark);
    // The comparator uses a schematic glazing surface; its glazing specification is open.
    for(const dz of (detailGlazing?[-.035,.035]:[0])) {
        const pane=part(g,x,y,z+dz,1.96,1.52,.012,palette.glass);
        pane.material.transparent=true;pane.material.opacity=.38;
    }
}
function envelopeDetail(g,spread,season) {
    const P=palette;
    part(g,0,-.1,0,6.6,.2,4.1,P.concrete);
    part(g,-2.85,1.5,-1.55,.34,3.2,.34,P.concrete);
    part(g,2.85,1.5,-1.55,.34,3.2,.34,P.concrete);
    const basic=season==='traditional';
    const assembly=basic?[[.30,P.aac,0],[.035,P.finish,.22]]:[[.30,P.aac,0],[.10,P.wool,.2+spread],[.035,P.finish,.275+2*spread]];
    for(const [depth,c,offset] of assembly) {
        const z=.72+offset;
        part(g,-1.92,1.56,z,1.76,3.12,depth,c);
        part(g,1.92,1.56,z,1.76,3.12,depth,c);
        part(g,0,.43,z,2.08,.86,depth,c);
        part(g,0,2.82,z,2.08,.6,depth,c);
    }
    // Exposed cut edges show the AAC courses and roof-board joints.
    for(let i=1;i<8;i++) {
        for(const x of [-2.805,2.805])part(g,x,.39*i,.72,.012,.012,.30,0xb4ad9b);
    }
    for(const x of [-2.45,-1.55,-.65,.25,1.15])part(g,x,3.42+spread*.5,1.315,.014,.14,.018,0xa37932);
    windowUnit(g,0,1.68,.79+spread*3.4,!basic);
    if(!basic)part(g,0,2.65,1.19+spread*3.4,2.35,.085,.68,P.dark);
    part(g,-.55,3.20,-.1,5.1,.20,3.2,P.concrete);
    part(g,-.65,3.42+spread*.5,-.19,4.9,.15,3,P.wool);
    part(g,-.8,3.52+spread*.9,-.32,4.6,.035,2.75,P.dark);
    part(g,2.05,.02,1.58,2.0,.18,1.15,P.concrete);
    if(spread>.3) {
        part(g,-2.6,1.24,-.8,.15,2.48,1.6,P.aac);
        path3(g,[[2.7,.18,-1.1],[2.7,2.95,-1.1]],P.hot,.07);
        part(g,3.5,1.5,-1.1,.06,1.5,.7,P.dark);
        tag(g,'Service access',3.6,2.9,-1.3,2.7);
        tag(g,'Window unit',-.1,1.06,3.48,2.65);
        tag(g,'Masonry partition',-3.65,2.9,-1.3,2.65);
    } else {
        flow(g,[2.0,.16,.65],[2.0,.16,2.52],P.hot);
        flow(g,[-1.7,2.85,-.8],[-1.7,3.92,-.8],P.hot);
        if(basic){tag(g,'Standard window',0,2.5,1.25,2.7);return;}
        const start=season==='winter'?[0,2.5,4.5]:[0,5.2,2.9];
        flow(g,start,season==='winter'?[0,1.65,.71]:[0,2.74,1.28],0xd39926);
        tag(g,season==='winter'?'Low winter sun':'High summer sun',0,start[1]+.32,start[2],2.8);
        tag(g,'Slab-edge heat path',2.25,-.16,2.65,3.0);
    }
    tag(g,'Insulated roof',-1.65,4.05,-1.25,2.8);
}
function plantDetail(g,traditional) {
    const P=palette;
    part(g,0,-.13,0,12.7,.24,5.8,P.concrete);
    part(g,-.1,1.6,-2.78,12.5,3.2,.15,P.aac);
    part(g,-6.15,1.6,-.7,.15,3.2,4.2,P.aac);
    for(const x of [-4.5,-2.85]){
        part(g,x,.16,-.8,1.34,.26,1.38,P.concrete);
        part(g,x,1.02,-.8,1.16,1.58,1.12,0x536d69);
        part(g,x,1.08,-.214,.98,1.35,.06,0xe5e4d6);
        part(g,x,1.45,-.17,.58,.18,.04,0x29453f);
        for(let i=0;i<5;i++)part(g,x,.58+i*.095,-.16,.68,.025,.03,P.dark);
        path3(g,[[x,1.8,-.96],[x,2.63,-.96],[x,2.63,-2.25],[x,3.65,-2.25]],0x777f7c,.115);
        path3(g,[[x,1.0,-.18],[x,1.0,.45],[x,.56,.45]],P.hot);
        path3(g,[[x,.73,-.18],[x,.73,.82],[x,.32,.82]],P.cold);
    }
    // The incoming gas header branches to both boiler cabinets.
    path3(g,[[-6.2,.53,-1.84],[-2.85,.53,-1.84]],0xa58342,.055);
    for(const x of [-4.5,-2.85])path3(g,[[x,.53,-1.84],[x,.53,-1.15]],0xa58342);
    for(const [y,z,c] of [[.56,.45,P.hot],[.32,.82,P.cold]]){
        path3(g,[[-4.5,y,z],[2.8,y,z],[2.8,y+1.29,z],[4.1,y+1.29,z]],c,.075);
    }
    for(let i=0;i<12;i++)part(g,4.15+i*.105,1.82,.64,.08,.80,.34,0xd6d9cc);
    vessel(g,.0,1.12,-1.35,.67,2.22,0xa9bcb5);
    for(const y of [.3,1.9])vessel(g,0,y,-1.35,.69,.07,P.dark);
    path3(g,[[-2.85,1.75,-1.28],[-2.85,2.15,-1.28],[0,2.15,-1.28]],P.hot);
    if(!traditional) {
        path3(g,[[0,2.26,-1.35],[0,2.88,-1.35],[1.38,2.88,-1.35],[1.38,3.72,-1.35]],0xc39540,.07);
        tag(g,'From roof collectors',1.55,4.05,-1.4,3.25);
    }
    windowUnit(g,3.5,2.10,-2.60);
    if(!traditional) {
        flow(g,[3.1,2.25,-2.39],[3.1,2.25,-.52],0x398f95);
        part(g,2.3,3.03,-2.52,.65,.08,.23,0xeedfb0);
        tag(g,'Air from open window',3.0,3.68,-2.3,3.05);
    }
    const fan=new THREE.Mesh(new THREE.TorusGeometry(.32,.065,8,24),siteMaterial(P.dark));
    fan.position.set(5.45,2.53,-2.60);g.add(fan);
    for(let i=0;i<3;i++){const blade=part(g,5.45,2.53,-2.53,.10,.52,.05,P.cold);blade.rotation.z=i*Math.PI/3;}
    part(g,-5.5,1.08,-2.64,.91,2.16,.09,0x667b71);
    tag(g,'Shared gas boilers',-3.8,2.15,.6,3.5);
    tag(g,'Hot-water tank',.1,1.35,.4,2.8);
    tag(g,'Apartment radiator',4.9,1.15,1.35,3.05);
    tag(g,'Wet-room extract',5.3,3.17,-2.3,2.7);
}
function waterDetail(g) {
    const P=palette;
    // Open earth face exposes the normally buried vessels and their separate networks.
    part(g,0,-1.57,0,15.0,.24,5.6,0xb3a486);
    part(g,0,-.38,-2.72,15,2.42,.22,0xc5b49a);
    part(g,-5.8,2.0,-1.4,.22,4,2.4,P.aac);
    part(g,-5.55,4.05,-.85,2.0,.16,3.75,P.dark);
    vessel(g,-2.85,-.55,.1,1.18,1.72,P.rain);
    vessel(g,-2.85,.36,.1,1.21,.12,0x7995a0);
    part(g,2.75,-.56,.1,3.2,1.6,2.5,P.grey);
    part(g,2.75,.28,.1,3.2,.08,2.5,0x739a72);
    path3(g,[[-4.66,4.12,.88],[-4.66,-.76,.88],[-2.85,-.76,.88]],P.rain,.09);
    path3(g,[[-2.85,-.40,.65],[-1.22,-.40,.65],[-1.22,.85,.65]],P.rain,.08);
    // WC, washbasin and tap shown above the cut.
    part(g,-1.22,.98,.68,.58,.65,.24,0xf1efe4);
    const bowl=vessel(g,-1.22,.66,1.04,.34,.29,0xf1efe4);bowl.scale.z=1.3;
    part(g,.72,1.25,-.38,1.0,.19,.57,0xf1efe4);
    path3(g,[[-6.85,-1.16,-1.55],[.72,-1.16,-1.55],[.72,1.62,-1.55],[.72,1.62,-.45],[.72,1.49,-.45]],P.potable,.07);
    path3(g,[[.72,1.14,-.38],[.72,-.84,-.38],[2.76,-.84,-.38]],P.grey,.07);
    part(g,5.8,.10,.1,2.2,.24,2.4,0x89744e);
    path3(g,[[2.75,-.48,.7],[4.33,-.48,.7],[4.33,.34,.7],[6.77,.34,.7]],P.grey,.075);
    for(let i=0;i<5;i++){
        const plant=new THREE.Mesh(new THREE.IcosahedronGeometry(.31,0),siteMaterial(0x698456));
        plant.position.set(4.98+i*.39,.47,.07);g.add(plant);
    }
    tag(g,'Roof runoff',-5.55,4.5,-.5,2.9);
    tag(g,'Rain tank · 15 m³',-3.0,-.67,1.65,3.25);
    tag(g,'Toilet',-1.35,1.64,1.0,1.65);
    tag(g,'Low-flow tap',.74,2.00,-.45,2.6);
    tag(g,'Greywater treatment',2.85,-.75,1.65,3.5);
    tag(g,'Drip irrigation',5.85,1.0,.6,2.65);
    tag(g,'City water',-6.33,-.95,-1.5,2.3);
}
function frameStudy(g,stage) {
    const P=palette, d=BUILDING.depth,w=BUILDING.width, floor=BUILDING.floorHeight;
    const wings=[-(w-d)/2,(w-d)/2];
    for(let i=0;i<=BUILDING.floors;i++) {
        const y=i*floor;
        for(const x of wings)part(g,x,y,0,d,.20,d,P.concrete);
        part(g,0,y,-d*.625,w,.2,d*.25,P.concrete);
        part(g,0,y,-d*.375,w-2*d,.2,d*.25,P.concrete);
        if(i===BUILDING.floors)break;
        for(const x of [-17.65,-11,-4.35,4.35,11,17.65]){
            for(const z of [-10.15,-5.9,.0,6.65])part(g,x,y+floor/2,z,.42,floor,.42,P.concrete);
        }
        if(stage>=2)for(const center of wings){
            for(const dx of [-5.15,0,5.15])part(g,center+dx,y+1.4,6.63,2.4,2.8,.30,P.aac);
            part(g,center,y+.42,6.63,d-.65,.84,.30,P.aac);
            part(g,center,y+2.83,6.63,d-.65,.52,.30,P.aac);
            part(g,center+Math.sign(center)*6.66,y+1.47,0,.30,2.94,13.4,P.aac);
            if(stage>=3)for(const dx of [-2.6,2.6])windowUnit(g,center+dx,y+1.7,6.86);
        }
    }
    if(stage>=3){const array=solarPanels.clone(true);array.visible=true;g.add(array);}
}
const exhibits = new Map();
const detailViews = {
    envelope:[[8,5.5,11],[0,1.65,.65],13],
    heating:[[7.2,5.8,14.8],[0,1.65,-.15],18],
    water:[[5.3,4.8,16.8],[0,1.1,0],19],
    circular:[[8,5.6,13.7],[0,1.9,1.0],15],
    construction:[[46,34,55],[0,7,0],54],
    exploded:[[47,36,62],[0,11,0],64],
    solar:[[25,46,28],[0,15,-1],51],
    architecture:[[46,24,52],[0,7,2],57],
    full:[[65,48,72],[0,5,8],80]
};
const optionSets = {
    envelope:[['summer','Summer sun'],['winter','Winter sun'],['traditional','Traditional facade']],
    heating:[['green','Green design'],['traditional','Traditional comparator']],
    circular:[['detail','Exploded bay'],['building','Exploded building']],
    construction:[['1','1 · Concrete frame'],['2','2 · AAC enclosure'],['3','3 · Windows and roof systems']]
};
let engineeringOption='';
function explodedBuilding(g) {
    frameStudy(g,1);
    // Show a five-storey facade strip at its original bay spacing, pulled forward
    // in the section direction. Exploded offsets are illustrative.
    for(let i=0;i<BUILDING.floors;i++) {
        const y=i*BUILDING.floorHeight;
        for(const x of [-11,11]) {
            for(const [z,t,c] of [[9,.3,palette.aac],[12,.1,palette.wool],[15,.04,palette.finish]]){
                part(g,x,y+.45,z,13,.9,t,c);
                part(g,x,y+2.87,z,13,.63,t,c);
                for(const dx of [-5,0,5])part(g,x+dx,y+1.72,z,2.8,1.66,t,c);
            }
            for(const dx of [-2.5,2.5])windowUnit(g,x+dx,y+1.75,18);
        }
    }
    tag(g,'Retained concrete frame',-1,18,-6,12);
    tag(g,'AAC · insulation · finish',-8,17,13,12);
    tag(g,'Window units',11,17,18,8);
}
function cleanEngineeringView() {
    if(engineeringLayer)engineeringLayer.visible=false;
    previousVisibility.forEach((vis,obj)=>{obj.visible=vis;});previousVisibility.clear();
    if(engineeringSky) {
        scene.background=engineeringSky.background;scene.fog=engineeringSky.fog;
        engineeringSky=null;
    }
    engineeringLayer=null;
}
function mountEngineeringView(key,build) {
    scene.children.forEach(o=>{previousVisibility.set(o,o.visible);o.visible=false;});
    engineeringSky={background:scene.background,fog:scene.fog};
    scene.background=new THREE.Color(0xf0eee6);scene.fog=null;
    if(!exhibits.has(key)) {
        const g=new THREE.Group();g.name=key;
        const hemi=new THREE.HemisphereLight(0xfff9e9,0x9aafa9,.75);
        const keyLight=new THREE.DirectionalLight(0xfff4df,.95);
        keyLight.position.set(-12,20,14);
        g.add(hemi,keyLight);build(g);
        // Legacy Three.js r128 takes material hex values as linear. Apply the
        // exhibit palette in sRGB while leaving cloned building materials alone.
        const originalMaterials=new Set();
        solarPanels.traverse(o=>{if(o.isMesh)originalMaterials.add(o.material);});
        const corrected=new Set();
        g.traverse(o=>{
            if(!o.isMesh || !o.material.color || corrected.has(o.material) || originalMaterials.has(o.material))return;
            o.material.color.convertSRGBToLinear();corrected.add(o.material);
        });
        exhibits.set(key,g);scene.add(g);
    }
    engineeringLayer=exhibits.get(key);engineeringLayer.visible=true;
}
function positionExhibit(view) {
    const [eye,look,width]=detailViews[view];
    const target=new THREE.Vector3(...look),offset=new THREE.Vector3(...eye).sub(target);
    const horizontalDistance=width/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect);
    const detailScale=engineeringLayer?0.72:1;
    offset.setLength(Math.max(offset.length()*detailScale,horizontalDistance));
    camera.position.copy(target).add(offset);controls.target.copy(target);
    controls.minDistance=engineeringLayer?3:12;controls.maxDistance=Math.max(150,offset.length()*1.5);
    controls.update();
}
function setEngineeringMode(mode,option) {
    if(!engineering[mode])return;
    cleanEngineeringView();resetHighlight();
    document.getElementById('feature-detail').style.display='none';
    document.querySelectorAll('.feature-btn').forEach(b=>b.classList.remove('active'));
    setSitePlan(false);cancelAnimationFrame(cameraAnimationFrame);
    engineeringMode=mode;
    const choices=optionSets[mode]||[];
    engineeringOption=choices.some(pair=>pair[0]===option)?option:choices[0]?.[0]||'';
    const choice=document.getElementById('system-option');
    choice.innerHTML=choices.map(([v,label])=>'<option value="'+v+'">'+label+'</option>').join('');
    choice.value=engineeringOption;choice.hidden=choices.length===0;
    document.getElementById('system-mode').value=mode;
    document.body.classList.toggle('engineering-active',mode!=='full');
    const info=engineering[mode];let explanation=info[1],legend=info[2], view=mode;
    const variant=engineeringOption;
    switch(mode){
    case 'architecture':
        [waterSystemGroup,ventilationGroup].forEach(o=>{previousVisibility.set(o,o.visible);o.visible=false;});break;
    case 'envelope':
        mountEngineeringView(mode+variant,g=>envelopeDetail(g,0.12,variant));
        if(variant==='traditional'){explanation='Traditional cost comparator: standard windows and a basic facade allowance. The cost comparison omits the external solar shades. Baseline insulation thickness and glazing performance are unspecified.';legend='Ivory · infill | Grey · structure | Red · qualitative heat paths';break;}
        explanation='300 mm AAC and 100 mm external insulation meet the double-glazed window. The roof carries 150 mm insulation. Arrows illustrate sun and heat paths.';break;
    case 'heating':
        mountEngineeringView(mode+variant,g=>plantDetail(g,variant==='traditional'));
        explanation=variant==='traditional'?'Traditional comparator: gas boilers feed radiators and the hot-water tank. Kitchens and bathrooms retain extract fans.':
            'Gas → two 100 kW concept boilers → heating pipes → apartment radiators. Roof collectors also heat the shared hot-water tank. Summer cooling uses open windows and shade.';
        if(variant==='traditional')legend='Red / blue · heating supply / return | Equipment positions are illustrative.';
        break;
    case 'water':
        mountEngineeringView(mode,waterDetail);
        explanation='The rain tank stores 15 m³ for toilets. The greywater unit measures 3.2 × 2.5 × 1.6 m externally in the model (12.8 m³). Its working capacity still needs sizing. Estimated reuse is 85 m³/year for toilets and 250 m³/year for irrigation.';break;
    case 'circular':
        if(variant==='building'){view='exploded';mountEngineeringView(view,explodedBuilding);}
        else mountEngineeringView(mode,g=>envelopeDetail(g,.66,'summer'));break;
    case 'construction':
        mountEngineeringView(mode+variant,g=>frameStudy(g,Number(variant)));break;
    }
    document.body.classList.toggle('section-view',Boolean(engineeringLayer));
    document.getElementById('system-title').textContent=info[0];
    document.getElementById('system-explanation').textContent=explanation;
    document.getElementById('system-legend').textContent=legend;
    positionExhibit(view);
}
function resetEngineering() {
    setEngineeringMode('full');
    setTimeOfDay(720);
}
