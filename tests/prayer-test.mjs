import {interp,dayTimes,computed,COMPUTED_OFFSET,hhmm,KEYS} from "../js/prayer.js";
import fs from "fs";
const P=JSON.parse(fs.readFileSync(new URL("../data/prayer-dhaka.json",import.meta.url)));const D=JSON.parse(fs.readFileSync(new URL("../data/districts.json",import.meta.url))).districts;
const rows=P.rows;let fail=[];const ok=(c,m)=>{if(!c)fail.push(m)};
// 1 anchors reproduce exactly
for(const r of rows)for(const k of KEYS)ok(interp(rows,r.m,r.d,k)===r[k],`anchor ${r.m}/${r.d} ${k}`);
ok(JSON.stringify(KEYS.map(k=>interp(rows,2,29,k)))===JSON.stringify(KEYS.map(k=>interp(rows,2,28,k))),'feb29 uses last-day anchor');
// 2 midpoint sanity (Apr 3: between Apr1 and Apr6)
const a=interp(rows,4,3,"fajr");ok(a>=rows.find(r=>r.m===4&&r.d===1).fajr-6&&a<=rows.find(r=>r.m===4&&r.d===1).fajr,"apr3 fajr between anchors");
// 3 wrap: Dec 31 and Jan 1..5 continuous, no jump >3 min/day
let prev=null,jumps=[];for(let m=1;m<=12;m++){const dm=new Date(2025,m,0).getDate();for(let d=1;d<=dm;d++){for(const k of KEYS){const v=interp(rows,m,d,k);const key=k;prev??={};if(prev[key]!=null&&Math.abs(v-prev[key])>3)jumps.push(`${m}/${d} ${k} ${prev[key]}->${v}`);prev[key]=v}}}
// 4 district offsets
const g=D.find(x=>x.name==="গাজীপুর"),pt=D.find(x=>x.name==="পটুয়াখালী"),dh=D.find(x=>x.name==="ঢাকা");
const base=dayTimes(rows,10,31,{sahri:0,iftar:0}),gz=dayTimes(rows,10,31,{sahri:g.sahri,iftar:g.iftar}),pk=dayTimes(rows,10,31,{sahri:pt.sahri,iftar:pt.iftar});
ok(gz.sahri===base.sahri+1&&gz.maghrib===base.maghrib+1&&gz.fajr===base.fajr&&gz.asr===base.asr,"gazipur +1 only sahri/iftar");
ok(pk.sahri===base.sahri-2&&pk.maghrib===base.maghrib-2&&pk.isha===base.isha,"patuakhali -2 only sahri/iftar");
// 5 cross-check residuals
const res={};for(const k of ["fajr","zuhr","asr","maghrib","isha","sunrise"]){res[k]=[]}
for(const r of rows){const c=computed(r.m,r.d);for(const k of Object.keys(res))res[k].push(r[k]-c[k]-COMPUTED_OFFSET[k])}
const stat={};let out=[];for(const k in res){const v=res[k];stat[k]={maxAbs:+Math.max(...v.map(Math.abs)).toFixed(1)}}
for(const r of rows){const c=computed(r.m,r.d);for(const k of Object.keys(res)){const e=r[k]-c[k]-COMPUTED_OFFSET[k];if(Math.abs(e)>2.5)out.push(`${r.m}/${r.d} ${k} ${e.toFixed(1)}`)}}
console.log(JSON.stringify({anchorsAndLogicFailures:fail,daysWithJumpOver3min:jumps,gazipur_oct31:{dhaka_sahri:hhmm(base.sahri),gazipur_sahri:hhmm(gz.sahri),dhaka_iftar:hhmm(base.maghrib),gazipur_iftar:hhmm(gz.maghrib)},patuakhali_sahri:hhmm(pk.sahri),crosscheckMaxResidualMin:stat,outliersOver2_5:out,districtCount:D.length},null,1));
