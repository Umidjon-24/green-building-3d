// Run from the repo root with Playwright, Chromium and cached viewer dependencies.
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const root = path.resolve('3d-model');
const captures = [
 ['energy-envelope-cutaway','envelope','winter','Winter sun and the insulated envelope','A low ray reaches the recessed window. Red arrows mark qualitative heat paths.'],
 ['wall-assembly','circular','detail','Layers of a repairable facade','An enlarged section separates the finish, 100 mm insulation, 300 mm AAC and window unit.'],
 ['summer-shading','envelope','summer','Summer shade at a south window','The projecting horizontal shade intercepts a high summer ray before it reaches the glass.'],
 ['heating-cooling-traditional','heating','traditional','Traditional heating and ventilation','Gas boilers feed radiators and a shared hot-water tank. Apartment extract fans remove moisture.'],
 ['heating-cooling-green','heating','green','Heating and hot water in the green design','Boilers feed radiators. A separate roof collector loop supplies heat to domestic hot-water storage.'],
 ['water-system','water','','Two tanks and three water networks','Blue: 15 m³ rain tank. Green: 12.8 m³ greywater unit exterior (working capacity pending). Cyan: potable supply.'],
 ['circular-materials-exploded','circular','building','The structure stays while facade parts are repaired','The five-storey frame retains its footprint. Facade layers and window units are offset for illustration.'],
 ['construction-process','construction','3','Concrete frame, enclosure and rooftop services','The cutaway leaves part of the frame exposed. Individual bays and installation sequence are illustrative.'],
 ['solar-roof-layout','solar','','Two solar systems on one roof','Sixty south-facing PV modules supply electricity. Five separate collectors heat water.'],
 ['green-building-full-view','full','','Green apartments for Samarkand','Five storeys, 40 homes, two rooftop solar systems and a shared courtyard.']
];
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH, headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
   const url=new URL(route.request().url());const file=path.basename(url.pathname);
   if(url.hostname==='viewer.local')return route.fulfill({path:path.join(root,file||'index.html')});
   if(['three.min.js','OrbitControls.js'].includes(file))return route.fulfill({path:path.join(process.env.THREE_CACHE,file),contentType:'application/javascript'});
   return route.abort();
 });
 await page.goto('http://viewer.local/index.html');await page.waitForFunction(()=>typeof renderer!=='undefined' && !!scene && !!controls);
 await page.addStyleTag({content:'.viewer-tools,#feature-panel,#feature-detail,#loading,#system-notes{display:none!important} #caption{position:fixed;left:0;right:0;top:0;z-index:50;background:#fcfbf4ed;padding:14px 32px 12px;border-bottom:2px solid #879e86;color:#203f33;pointer-events:none} #caption h1{font:600 31px Segoe UI,Arial} #caption p{font:19px Segoe UI,Arial;margin-top:3px}'}); 
 for(const [file,mode,variant,title,subtitle] of captures){
  await page.evaluate(({mode,variant,title,subtitle})=>{
    setEngineeringMode(mode,variant);
    if(mode==='solar'||mode==='full')setTimeOfDay(690);
    let cap=document.getElementById('caption');
    if(!cap){cap=document.createElement('header');cap.id='caption';cap.innerHTML='<h1></h1><p></p>';document.body.appendChild(cap);}
    cap.children[0].textContent=title;cap.children[1].textContent=subtitle;
    renderer.render(scene,camera);
  },{mode,variant,title,subtitle});
  if(mode==='construction'){
   // Three live scene renders side by side, with the same camera and scale.
   await page.evaluate(()=>{
    const board=document.createElement('section');board.id='sequence';
    board.style.cssText='position:fixed;inset:90px 0 0;display:flex;align-items:center;background:#f0eee6;z-index:40';
    const labels=['1   Concrete frame','2   AAC enclosure','3   Windows and roof systems'];
    for(let i=1;i<=3;i++){
     setEngineeringMode('construction',String(i));renderer.render(scene,camera);
     const frame=document.createElement('figure');frame.style.cssText='width:33.333%;text-align:center;overflow:hidden';
     const image=document.createElement('canvas');image.width=720;image.height=740;
     const canvas=renderer.domElement,w=canvas.width,h=canvas.height;
     image.getContext('2d').drawImage(canvas,w*.227,h*.04,w*.546,h*.935,0,0,720,740);
     image.style.width='100%';const label=document.createElement('figcaption');label.textContent=labels[i-1];
     label.style.cssText='font:600 23px Segoe UI;color:#23443c';frame.append(image,label);board.append(frame);
    }
    document.body.appendChild(board);
   });
  }
  await page.screenshot({path:path.join(root,'presentation',file+'.png'),timeout:60000});console.log(file);
  if(mode==='construction')await page.locator('#sequence').evaluate(e=>e.remove());
 }
 if(errors.length)throw Error(errors.join('\n'));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
