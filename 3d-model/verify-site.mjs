// Run with Node 18+: node verify-site.mjs [path-to-three-r128.js]
// Uses real Three.js geometry/math; DOM, renderer and orbit input are stubbed.
// This is a scene/interaction regression check, not a WebGL visual test.
import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root = new URL('./', import.meta.url);
const threePath = typeof process === 'undefined' ? null : process.argv[2];
const three = threePath ? await fs.readFile(threePath, 'utf8') :
    await fetch('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js').then(r => {assert(r.ok);return r.text();});
const html = await fs.readFile(new URL('index.html', root), 'utf8');
function node() {
    return { style:{}, dataset:{}, textContent:'', innerHTML:'', attributes:{},
        classList:{add(){},remove(){},toggle(){}}, appendChild(){},
        setAttribute(k,v){this.attributes[k]=v;}, addEventListener(){},
        getBoundingClientRect(){return {left:0,top:0,width:1280,height:800};},
        getContext(){return {fillRect(){},fillText(){}}} };
}
const nodes = new Map();
const buttons = [...html.matchAll(/highlightFeature\('([^']+)'\)/g)].map(m=>({...node(),dataset:{feature:m[1]}}));
const timeButtons = ['day','sunset','night'].map(time=>({...node(),dataset:{time}}));
const context = vm.createContext({console,assert,window:{innerWidth:1280,innerHeight:800,devicePixelRatio:1,addEventListener(){}},
    document:{body:node(),createElement:node,getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);},
        querySelectorAll(s){return s==='.feature-btn'?buttons:timeButtons;}},
    requestAnimationFrame(){return 1;},cancelAnimationFrame(){},setTimeout(){}});
vm.runInContext(three,context);
vm.runInContext(`
    THREE.WebGLRenderer = class {constructor(){this.domElement=document.createElement('canvas');this.shadowMap={};}setSize(){}setPixelRatio(){}render(){}};
    THREE.OrbitControls = class {constructor(camera){this.object=camera;this.target=new THREE.Vector3();}update(){this.object.lookAt(this.target);}dispose(){}};
`,context);
for(const name of ['civil-site.js','building.js']) vm.runInContext(await fs.readFile(new URL(name,root),'utf8'),context,{filename:name});
vm.runInContext(`
    assert.equal(BUILDING.floors,5);
    assert.equal(greenRoofGroup.children.length,2); // waterproof roof and schematic lift overrun, no plants
    assert(greenRoofGroup.children.every(o=>o.geometry.type==='BoxGeometry'));
    assert(featureData.greenroof.desc.includes('removed'));
    assert.equal(Object.keys(civilFeatures).length,8);
    assert.equal(Object.keys(featureData).length,16);
    assert.equal(siteGroups.trees.children.length,13);
    scene.updateMatrixWorld(true);
    let meshes=0;
    scene.traverse(o=>{if(o.isMesh){meshes++;assert(o.geometry);assert(Number.isFinite(o.position.x));}});
    assert(meshes>500);
    const baseline=new Map();
    scene.traverse(o=>{if(o.isMesh)baseline.set(o.material,{opacity:o.material.opacity,transparent:o.material.transparent,emissive:o.material.emissive?.getHex(),intensity:o.material.emissiveIntensity});});
    for(let round=0;round<2;round++) for(const key of Object.keys(featureData)) {
        highlightFeature(key);
        assert.equal(document.getElementById('detail-title').textContent,featureData[key].title);
        closeDetail();
        baseline.forEach((v,m)=>{assert.equal(m.opacity,v.opacity);assert.equal(m.transparent,v.transparent);assert.equal(m.emissive?.getHex(),v.emissive);assert.equal(m.emissiveIntensity,v.intensity);});
    }
    showSitePlan();assert(camera.isOrthographicCamera);assert.equal(controls.enableRotate,false);assert(planLabels.visible);
    assert.equal(camera.up.z,-1);
    for(const [w,h] of [[1280,800],[390,844],[844,390]]) {
        window.innerWidth=w;window.innerHeight=h;onWindowResize();
        assert(planCamera.right>=47);assert(planCamera.top>=45);
        scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
        for(const x of [-36,36])for(const z of [-22,36]){
            const p=new THREE.Vector3(x,0,z).project(camera);assert(Math.abs(p.x)<1);assert(Math.abs(p.y)<1);
        }
    }
    for(const mode of ['day','sunset','night']) {setTimeOfDay(mode);assert(scene.children.some(o=>o.isLight));}
    showPerspective();assert(camera.isPerspectiveCamera);assert(!planLabels.visible);assert.equal(planMode,false);
    highlightFeature('solar');highlightFeature('parking');closeDetail();
    assert.equal(savedMaterials.size,0);
    console.log('PASS: scene geometry, 16 highlights twice, material restoration, camera round trip, 3 viewport ratios, 3 lighting modes');
`,context);
assert(html.indexOf('civil-site.js')<html.indexOf('src="building.js"'));
assert.equal(buttons.length,16);
