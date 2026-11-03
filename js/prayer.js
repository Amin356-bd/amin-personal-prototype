// Pure module (works in browser and Node). Anchors: 6 dates/month from the IF Dhaka permanent table.
export const KEYS=["sahri","fajr","zuhr","asr","maghrib","isha","sunrise"];
const BASE=2025; // non-leap reference year
const doy=(m,d)=>Math.round((Date.UTC(BASE,m-1,d)-Date.UTC(BASE,0,1))/864e5);
export function interp(rows,m,d,key){
  const a=rows.map(r=>({t:doy(r.m,r.d),v:r[key]}));
  let t=doy(m,d); if(m===2&&d===29) t=doy(2,28); // printed "30" row = last day of February (user, 2026-11-01); leap day uses it
  const first=a[0],last=a[a.length-1];
  let lo,hi;
  if(t<first.t){lo={t:last.t-365,v:last.v};hi=first}
  else if(t>last.t){lo=last;hi={t:first.t+365,v:first.v}}
  else{for(let i=0;i<a.length-1;i++){if(t>=a[i].t&&t<=a[i+1].t){lo=a[i];hi=a[i+1];break}}}
  const f=hi.t===lo.t?0:(t-lo.t)/(hi.t-lo.t);
  return Math.round(lo.v+(hi.v-lo.v)*f);
}
// district offsets apply ONLY to sahri and iftar(maghrib) by default (decision D2)
export function dayTimes(rows,m,d,off={sahri:0,iftar:0},allWaqts=false){
  const o={}; for(const k of KEYS) o[k]=interp(rows,m,d,k);
  o.sahri+=off.sahri; o.maghrib+=off.iftar;
  if(allWaqts){for(const k of["fajr","zuhr","asr","isha","sunrise"]) o[k]+=off.sahri}
  return o;
}
export const hhmm=x=>String(Math.floor(x/60)).padStart(2,"0")+":"+String(x%60).padStart(2,"0");
const bn="০১২৩৪৫৬৭৮৯";
export const toBn=s=>String(s).replace(/\d/g,c=>bn[c]);
export function h12(x){let h=Math.floor(x/60)%12||12;return toBn(h)+":"+toBn(String(x%60).padStart(2,"0"))}
// independent cross-check: NOAA-style sun position, Dhaka
export function computed(m,d,{lat=23.8103,lon=90.4125,tz=6}={}){
  const n=doy(m,d)+1,g=2*Math.PI/365*(n-1);
  const eqt=229.18*(0.000075+0.001868*Math.cos(g)-0.032077*Math.sin(g)-0.014615*Math.cos(2*g)-0.040849*Math.sin(2*g));
  const dec=0.006918-0.399912*Math.cos(g)+0.070257*Math.sin(g)-0.006758*Math.cos(2*g)+0.000907*Math.sin(2*g)-0.002697*Math.cos(3*g)+0.00148*Math.sin(3*g);
  const la=lat*Math.PI/180,noon=720-4*lon-eqt+tz*60;
  const ha=a=>{const c=(Math.sin(-a*Math.PI/180)-Math.sin(la)*Math.sin(dec))/(Math.cos(la)*Math.cos(dec));return Math.acos(Math.max(-1,Math.min(1,c)))*180/Math.PI*4};
  const asr=k=>{const alt=Math.atan(1/(k+Math.tan(Math.abs(la-dec))));const c=(Math.sin(alt)-Math.sin(la)*Math.sin(dec))/(Math.cos(la)*Math.cos(dec));return Math.acos(c)*180/Math.PI*4};
  return {fajr:noon-ha(18),sunrise:noon-ha(.833),zuhr:noon,asr:noon+asr(2),maghrib:noon+ha(.833),isha:noon+ha(18)};
}
export const COMPUTED_OFFSET={fajr:1.6,sunrise:-.3,zuhr:3.5,asr:-.5,maghrib:3.7,isha:1.7}; // median(table-computed), measured by tools/crosscheck.py
