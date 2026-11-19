// Independent arithmetic, scope and export regression checks. Run: node verify-cost.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ctx=vm.createContext({console,assert});
vm.runInContext(fs.readFileSync('cost-data.js','utf8')+'\n'+fs.readFileSync('cost-estimate.js','utf8'),ctx);
vm.runInContext(`
const near=(a,b)=>assert(Math.abs(a-b)<0.005, a+' != '+b);
const scenarios=[0,1,2].map(s=>estimate(s));
assert.equal(new Set(COST.rows.map(r=>r[0])).size,COST.rows.length);
for(const e of scenarios){
  for(const r of e.items){assert(Number.isFinite(r.total)&&r.total>=0);near(r.total,r.qty*r.rate);r.sources.forEach(id=>assert(COST.sources[id]));}
  near(Object.keys(COST.categories).reduce((s,c)=>s+catTotal(e,c),0),e.total);
  near(interiors(e).reduce((s,u)=>s+u.total,0),catTotal(e,'D'));
  assert.equal(e.items.find(r=>r.id==='B24').total,0);
  assert.equal(e.items.find(r=>r.id==='B25').total,0);
  assert.equal(e.items.find(r=>r.id==='C26').qty,1);
}
// Independently tabulated expected category amounts and indirect formulas.
const expected=estimate(1);
const direct=193850+681750+269650+307360+48350;
near(expected.direct,direct);
const works=direct-100000-5000;
const management=works*.05, design=works*.035, insurance=works*.005;
const risk=(works+management+design)*.15, escalation=(works+management)*.04;
const vat=(works+management+design+risk+escalation)*.12;
near(expected.vat,vat);
const before=direct+management+design+insurance+risk+escalation+vat+2000;
near(expected.total,before*(1+.6*.5*.24*1.25+.6*.01));
for(let mask=0;mask<32;mask++){
  const opts=Object.fromEntries(['land','grey','solarhot','rain','equity'].map((key,i)=>[key,Boolean(mask&(1<<i))]));
  const e=estimate(1,opts);assert(e.total<=expected.total+.001);
  assert.equal(e.items.find(r=>r.id==='C26').qty,1);
  if(opts.equity) assert.equal(e.finance,0);
  if(opts.land) assert.equal(e.land,0);
  if(opts.grey) near(e.items.filter(r=>['C23','C24'].includes(r.id)).reduce((a,r)=>a+r.total,0),0);
}
// Reconcile the overview comparator to the detailed expected green premium.
const traditional=estimate(1,{traditional:true});
near(expected.direct-traditional.direct,greenRows().reduce((total,row)=>total+row[1]-row[2],0));
for (const [scenario,green] of scenarios.entries()) {
  const other=estimate(scenario,{traditional:true});
  near(catTotal(green,'D'),catTotal(other,'D'));
  near(other.land,green.land);
  assert(other.vat<green.vat && other.finance<green.finance);
  assert(other.total<green.total);
  near(Object.keys(COST.categories).reduce((sum,c)=>sum+catTotal(other,c),0),other.total);
}
const csv=csvRows();assert.equal(csv.length,116);
csv.forEach(row=>assert.equal(row.length,csv[0].length));
assert(Math.abs(csv.slice(1).reduce((a,row)=>a+row[12],0)-expected.total)<.02, 'CSV cent rounding must reconcile within two cents');
assert(serialize(csv).includes('Elevator'));
assert(greenRows().some(r=>r[0].includes('removed')&&r[1]===0));
console.log('PASS: 115 items; category and unit reconciliation; VAT/finance bases; 32 option combinations; lift retained; rooftop planting excluded; CSV shape and totals.');
`,ctx);
