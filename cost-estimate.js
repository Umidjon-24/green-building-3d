'use strict';
const names=['Low','Expected','High'];
const fmt=(n,d=0)=>Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const usd=n=>(n<0?'−$':'$')+fmt(Math.abs(n));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cell=(v,n=false)=>`<td${n?' class="num"':''}>${v}</td>`;
const head=cols=>'<thead><tr>'+cols.map(c=>`<th scope="col">${c}</th>`).join('')+'</tr></thead>';
const links=ids=>ids.map(id=>`<a href="#source-${id}">[${id}]</a>`).join(' ');
const catTotal=(e,c)=>e.items.filter(r=>r.cat===c).reduce((s,r)=>s+r.total,0);
const base=()=>estimate(1);
function interiors(e){
  const rate=id=>e.items.find(r=>r.id===id).rate;
  const shared=e.items.filter(r=>r.cat==='D'&&Number(r.id.slice(1))>=14).reduce((a,r)=>a+r.total,0);
  return [[40,10,3],[60,20,4],[80,10,5]].map(([area,count,doors],index)=>{
    const variable=area*(rate('D01')+.75*rate('D02')+.25*rate('D03')+3*rate('D05')+rate('D07'));
    const each=variable+8*rate('D04')+(area*3-20)*rate('D06')+rate('D08')+doors*rate('D09')+rate('D10')+rate('D11')+20*rate('D12')+8*rate('D13');
    return {name:`${index+1}-bed`,area,count,each,shared:shared/40,total:(each+shared/40)*count};
  });
}
function render(){
  const s=Number(document.getElementById('scenario').value), e=estimate(s), all=[0,1,2].map(x=>estimate(x));
  const delta=e.total-COST.target;
  document.getElementById('metrics').innerHTML=[
    [`${names[s]} development cost`,usd(e.total),`${fmt(e.total*COST.fx/1e9,2)} billion UZS`],
    ['Cost per m² GFA',usd(e.total/COST.gfa),`Target ${usd(550)} / m²`],
    ['Average cost per home',usd(e.total/40),'40 apartments · includes shared costs'],
    [delta>=0?'Above target':'Below target',`${delta>=0?'+':'−'}${fmt(Math.abs(delta)/COST.target*100,1)}%`,`${usd(Math.abs(delta))} ${delta>=0?'overrun':'headroom'}`]
  ].map((c,i)=>`<div class="card ${i===3?'warn':''}"><small>${c[0]}</small><div class="metric">${c[1]}</div><small>${c[2]}</small></div>`).join('');
  document.getElementById('verdict').innerHTML=`<strong>${names[s]} scenario: ${delta>=0?'above':'below'} the USD 1.595m target.</strong> ${s===0?'This is a favourable procurement/funding case, not the recommended budget commitment.':s===2?'This stress case combines adverse rates, land cost, risk and borrowing assumptions; it is not a forecast.':'Plan around the expected total until drawings and written quotations support reductions.'} One elevator is included; rooftop planting is removed.`;
  document.getElementById('summary-table').innerHTML=head(['Category','Total USD','Total UZS million','% total','USD/m² GFA','USD/home'])+'<tbody>'+Object.entries(COST.categories).map(([c,n])=>{const t=catTotal(e,c);return '<tr>'+cell(`${c}. ${n}`)+cell(usd(t),true)+cell(fmt(t*COST.fx/1e6,1),true)+cell(fmt(t/e.total*100,1)+'%',true)+cell(usd(t/2900),true)+cell(usd(t/40),true)+'</tr>';}).join('')+'</tbody><tfoot><tr>'+cell('TOTAL DEVELOPMENT')+cell(usd(e.total),true)+cell(fmt(e.total*COST.fx/1e6,1),true)+cell('100%',true)+cell(usd(e.total/2900),true)+cell(usd(e.total/40),true)+'</tr></tfoot>';
  document.getElementById('range-table').innerHTML=head(['Full scope','Low','Expected','High'])+'<tbody>'+[
    ['Development USD',...all.map(x=>usd(x.total))],['USD/m² GFA',...all.map(x=>usd(x.total/2900))],['USD/apartment',...all.map(x=>usd(x.total/40))],['Difference from target',...all.map(x=>(x.total>=COST.target?'+':'−')+usd(Math.abs(x.total-COST.target)))]]
    .map(r=>'<tr>'+r.map((v,i)=>cell(v,i>0)).join('')+'</tr>').join('')+'</tbody>';
  const traditional=estimate(s,{traditional:true});
  const comparison=document.getElementById('comparison-table');
  comparison.innerHTML=`<caption>${names[s]} scenario · estimated costs in USD</caption>`+
    head(['Cost category','Our Green building','Traditional building'])+
    '<tbody>'+Object.entries(COST.categories).map(([key,label])=>
      `<tr><th scope="row">${label}</th>${cell(usd(catTotal(e,key)),true)}${cell(usd(catTotal(traditional,key)),true)}</tr>`
    ).join('')+'</tbody><tfoot><tr><th scope="row">Total development</th>'+
    cell(usd(e.total),true)+cell(usd(traditional.total),true)+'</tr></tfoot>';
  const construction=e.works+e.items.find(r=>r.id==='F01').total;
  document.getElementById('scope-bridge').innerHTML=`<p><strong>Scope bridge (${names[s].toLowerCase()}):</strong> direct A–E ${usd(e.direct)} → works excluding land/permits ${usd(e.works)} → works plus site management ${usd(construction)} (${usd(construction/2900)}/m², before design/risk/VAT/finance) → complete development ${usd(e.total)}. Construction-only pricing and total development funding are different comparisons.</p>`;
  document.getElementById('detail-tables').innerHTML=Object.entries(COST.categories).map(([c,n])=>{
    const rows=e.items.filter(r=>r.cat===c);
    return `<h3>${c}. ${n}</h3><div class="table-wrap"><table class="detail-table">${head(['ID','Item','Quantity / unit','Unit USD net','Unit UZS net','Total USD','Total UZS million','Low / expected / high USD totals','Evidence / confidence','Basis and calculation'])}<tbody>`+rows.map(r=>'<tr>'+cell(r.id)+cell(esc(r.name))+cell(fmt(r.qty,Number.isInteger(r.qty)?0:1)+' '+esc(r.unit))+cell(fmt(r.rate,2),true)+cell(fmt(r.rate*COST.fx),true)+cell(usd(r.total),true)+cell(fmt(r.total*COST.fx/1e6,2),true)+cell(all.map(x=>usd(x.items.find(y=>y.id===r.id).total)).join(' / '),true)+cell(`<span class="tag ${r.confidence.toLowerCase()}">${r.basis==='A'?'Source-informed estimate':'Estimator assumption'} · ${r.confidence}</span><br>${links(r.sources)}`)+cell(esc(r.note))+'</tr>').join('')+`</tbody><tfoot><tr><td colspan="5">${c} subtotal</td>${cell(usd(catTotal(e,c)),true)}${cell(fmt(catTotal(e,c)*COST.fx/1e6,2),true)}<td colspan="3"></td></tr></tfoot></table></div>`;
  }).join('');
  const units=interiors(e);
  document.getElementById('unit-table').innerHTML=head(['Type','Units × net area','D interior / home','Shared D / home','D total / home','All type units total'])+'<tbody>'+units.map(u=>'<tr>'+cell(u.name)+cell(`${u.count} × ${u.area} m²`)+cell(usd(u.each),true)+cell(usd(u.shared),true)+cell(usd(u.each+u.shared),true)+cell(usd(u.total),true)+'</tr>').join('')+'</tbody><tfoot><tr><td colspan="5">Reconciles to D total (net of VAT)</td>'+cell(usd(units.reduce((a,u)=>a+u.total,0)),true)+'</tr></tfoot>';
}

function greenRows(){
  const e=base(), traditional=estimate(1,{traditional:true});
  const sum=(ids,model=e)=>model.items.filter(r=>ids.includes(r.id)).reduce((a,r)=>a+r.total,0);
  const baseline=(...ids)=>sum(ids,traditional);
  return [
    ['30 kW PV',sum(['B26','B27','B28']),0,'B26–28; no PV in comparator.','Load-dependent. Expected 70% self-use: about 5.2 years simple payback incl. capex VAT. See calculation below.'],
    ['Rooftop planting — removed',0,0,'B24–25 excluded at zero quantity.','No planted roof, extra structural load or roof-garden maintenance. Insulated weatherproof roof retained.'],
    ['100 mm external insulation',sum(['B17']),baseline('B17'),'Comparator 50 mm/basic system allowance at USD 10/m²; confirm minimum legal specification.','Passive package, assessed jointly below.'],
    ['Improved double glazing',sum(['B18']),baseline('B18'),'Comparator basic double glazing at USD 70/m²; upgrade allowance USD 15/m².','Passive package; no separate additive saving claimed.'],
    ['External sun shading',sum(['B23']),0,'Incremental external louvers; base balconies unchanged.','Passive package; reduce overheating first.'],
    ['Cross/stack ventilation detailing',sum(['C05']),baseline('C05'),'Comparator basic ventilation USD 180/home; wet-room fans retained in both.','Passive package; no guaranteed 40% saving.'],
    ['Thermal mass / orientation',0,0,'RC structure already in B; orientation addressed in F02 design fee.','No extra material premium; savings depend on shading and night cooling.'],
    ['Rainwater collection + toilet reuse',sum(['C19','C20','C21','C22']),0,'Base roof drainage B22 remains in comparator.','USD ~22/year water avoided less USD 150 O&M: no positive utility payback.'],
    ['Greywater treatment + reuse',sum(['C23','C24']),0,'Full incremental system; irrigation demand capped.','250 m³ × 3,136 UZS ÷ FX ≈ USD 65/year, less USD 600 O&M: no positive payback.'],
    ['Solar hot-water loop',sum(['C11']),0,'Backup storage/boiler retained in both; no duplicated DHW plant.','~65 years simple payback at assumed general gas tariff; weak affordability case.'],
    ['Permeable parking / paths / courtyard',sum(['A13','E01','E02']),baseline('A13','E01','E02'),'Comparator 200 m² parking at USD 28 and 550 m² paving at USD 25.','Drainage and repair benefits; no monetized lifecycle saving without runoff design.'],
    ['Drought planting + drip',sum(['E03','E06']),baseline('E03','E06'),'Comparator irrigated lawn/planting at USD 10/m² plus irrigation USD 4.5/m².','USD 2,700 assumed initial saving; no further water savings added to reuse claims.'],
    ['Shade / fruit trees',sum(['E04','E05']),baseline('E04','E05'),'Comparator modest landscaping allowance USD 2,400.','Comfort and shade; no separate cooling saving added to passive package.'],
    ['Waste sorting + compost',sum(['E12']),baseline('E12'),'Comparator ordinary bin point USD 600.','No verified collection-charge saving; shared amenity and circularity value.'],
    ['Courtyard / community equipment',0,0,'Same common space in comparator; full cost remains E01, E07–09 and E13–15.','Shared space avoids a facility in every apartment; no unsupported cash saving.'],
    ['Local/recycled materials',0,0,'Local AAC/tiles already priced; no assumed discount for uncertified recycled structural materials.','Repairability and reduced transport are qualitative benefits until procurement confirms savings.']
  ];
}
function renderGreen(){
  const rows=greenRows();
  document.getElementById('green-table').innerHTML=head(['Feature','Green cost USD','Comparator USD','Extra USD','Incremental basis','Payback / lifecycle'])+'<tbody>'+rows.map(r=>'<tr>'+cell(r[0])+cell(usd(r[1]),true)+cell(usd(r[2]),true)+cell(usd(r[1]-r[2]),true)+cell(r[3])+cell(r[4])+'</tr>').join('')+'</tbody>';
  const premium=rows.reduce((s,r)=>s+r[1]-r[2],0), passive=rows.slice(2,6).reduce((s,r)=>s+r[1]-r[2],0);
  document.getElementById('green-total').innerHTML=`<p><strong>Net direct green premium: ${usd(premium)}</strong> (${usd(premium/40)}/home; ${fmt(premium/base().direct*100,1)}% of expected direct A–E). This is the sum of the incremental comparisons, including the planting saving. Passive package premium ${usd(passive)} net / ${usd(passive*1.12)} incl. VAT implies approximately ${fmt(passive*1.12/3365,1)}–${fmt(passive*1.12/1340,1)} years simple payback on the stated joint energy sensitivity, before maintenance.</p>`;
  const cap=rows[0][1], gross=cap*1.12, om=cap*.015;
  const pv=[.25,.7,.9].map(self=>{
    const benefit=45000*self*1100/COST.fx, net=benefit-om;
    let npv=-gross;
    for(let y=1;y<=20;y++) npv+=(benefit*Math.pow(.995,y-1)-om-(y===12?2240:0))/Math.pow(1.05,y);
    return {self,benefit,net,payback:gross/net,npv};
  });
  document.getElementById('pv-calculation').innerHTML=`<p class="formula">30 kWp × 1,500 kWh/kWp/year = 45,000 kWh/year assumed.<br>Annual avoided bill = 45,000 × self-use × 1,100 UZS ÷ 12,023.61.<br>Net saving = avoided bill − ${usd(om)} O&M/year.<br>Simple payback = ${usd(gross)} capex incl. VAT ÷ net saving.</p><p>Tariff: illustrative I/II/IV account, not confirmed for this building. <a href="#source-ELEC">[ELEC]</a> Export earns zero in this model. Common-area demand alone may not absorb 30 kW.</p><div class="table-wrap"><table>${head(['Self-use','Net USD/year','Payback years','20-year NPV USD'])}<tbody>${pv.map(p=>'<tr>'+cell(fmt(p.self*100)+'%')+cell(usd(p.net),true)+cell(fmt(p.payback,1),true)+cell(usd(p.npv),true)+'</tr>').join('')}</tbody></table></div><p class="note">Low/expected/high yield sensitivity 1,350/1,500/1,650 kWh/kWp/year is unmodeled; the table isolates self-use. NPV is a scenario illustration, not a guaranteed investment return.</p>`;
}
function options(){return Object.fromEntries([...document.querySelectorAll('#options input')].map(x=>[x.value,x.checked]));}
function renderOptions(){
  const e=estimate(1,options()), original=base(), saving=original.total-e.total, gap=e.total-COST.target;
  const all=estimate(1,{land:true,grey:true,solarhot:true,rain:true,equity:true});
  document.getElementById('option-result').innerHTML=`<small>EXPECTED COST WITH SELECTED OPTIONS</small><div class="metric">${usd(e.total)}</div><p>${usd(e.total/2900)}/m² · ${usd(e.total/40)}/home</p><p><strong>${usd(saving)} cash reduction</strong> from full expected scope.</p><div class="bar ${gap>0?'over':''}"><span style="width:${Math.min(100,e.total/original.total*100)}%"></span></div><p><strong>${gap>0?'Still '+usd(gap)+' above target':usd(-gap)+' below target'}</strong> (${fmt(Math.abs(gap)/COST.target*100,1)}%). One elevator, solar PV, insulated roof and passive measures remain.</p><p class="note">With all five options: ${usd(all.total)} (${usd(all.total/2900)}/m²). ${all.total>COST.target?'Even this package does not meet USD 550/m²; additional scope, procurement or funding decisions are needed.':'This package reaches the target under the stated funding assumptions.'} Contributed land and equity are cash scenarios, not construction efficiencies.</p>`;
}
function csvRows(opts={}){
  const scenarios=[0,1,2].map(s=>estimate(s,opts));
  const active=Object.entries(opts).filter(([,v])=>v).map(([k])=>k).join('; ')||'base scope';
  const header=['ID','Category','Item','Quantity','Unit','Rate_low_USD','Rate_expected_USD','Rate_high_USD','Rate_low_UZS','Rate_expected_UZS','Rate_high_UZS','Total_low_USD','Total_expected_USD','Total_high_USD','Total_low_UZS','Total_expected_UZS','Total_high_UZS','Evidence_basis','Confidence','Source_URLs','Formula_low','Formula_expected','Formula_high','FX_UZS_per_USD','Valuation_date','Scope_options'];
  return [header,...scenarios[1].items.map((r,i)=>{
    const three=scenarios.map(s=>s.items[i]);
    return [r.id,r.cat,r.name,r.qty,r.unit,...three.map(t=>+t.rate.toFixed(4)),...three.map(t=>+(t.rate*COST.fx).toFixed(2)),...three.map(t=>+t.total.toFixed(2)),...three.map(t=>+(t.total*COST.fx).toFixed(2)),r.basis,r.confidence,r.sources.map(id=>COST.sources[id].url||'Estimator assumption (no published quote)').join(' | '),...three.map(t=>t.note),COST.fx,COST.date,active];
  })];
}
function serialize(rows,delimiter=','){return rows.map(r=>r.map(v=>delimiter===','?'"'+String(v).replace(/"/g,'""')+'"':String(v).replace(/[\t\r\n]/g,' ')).join(delimiter)).join('\r\n');}
function download(rows,name){
  const url=URL.createObjectURL(new Blob(['\uFEFF'+serialize(rows)],{type:'text/csv;charset=utf-8;'}));
  const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  document.getElementById('status').textContent='CSV download prepared. Import as UTF-8 in Excel; numeric fields use a decimal point.';
}
function boot(){
  document.getElementById('source-register').innerHTML=Object.entries(COST.sources).map(([id,s])=>`<div class="source" id="source-${id}"><strong>${id} · ${s.url?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)}</a>`:esc(s.name)}</strong><p>${esc(s.note)}</p></div>`).join('');
  document.getElementById('scenario').addEventListener('change',render);
  document.getElementById('export').addEventListener('click',()=>download(csvRows(),'Samarkand_cost_detail_all_scenarios.csv'));
  document.getElementById('option-export').addEventListener('click',()=>download(csvRows(options()),'Samarkand_cost_selected_options.csv'));
  document.getElementById('summary-export').addEventListener('click',()=>download([['Scenario','Category','USD','UZS','Percent','USD_per_m2','USD_per_home'],...[0,1,2].flatMap(s=>{const e=estimate(s);return [...Object.entries(COST.categories).map(([c,n])=>{const t=catTotal(e,c);return [names[s],c+' '+n,+t.toFixed(2),+(t*COST.fx).toFixed(2),+(t/e.total*100).toFixed(2),+(t/2900).toFixed(2),+(t/40).toFixed(2)];}),[names[s],'TOTAL',+e.total.toFixed(2),+(e.total*COST.fx).toFixed(2),100,+(e.total/2900).toFixed(2),+(e.total/40).toFixed(2)]];})],'Samarkand_cost_summary.csv'));
  document.getElementById('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(serialize(csvRows(),'\t'));document.getElementById('status').textContent='Copied all scenarios. Paste into Excel cell A1.';}catch{document.getElementById('status').textContent='Clipboard unavailable. Use Download detailed CSV instead.';}});
  document.getElementById('print').addEventListener('click',()=>window.print());
  document.querySelectorAll('#options input').forEach(x=>x.addEventListener('change',renderOptions));
  document.getElementById('reset-options').addEventListener('click',()=>{document.querySelectorAll('#options input').forEach(x=>x.checked=false);renderOptions();});
  render();renderGreen();renderOptions();
}
if(typeof document!=='undefined') boot();
