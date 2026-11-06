import {dayTimes,hhmm,h12,toBn} from "./prayer.js";
const W=[["fajr","ফজর"],["zuhr","যোহর"],["asr","আসর"],["maghrib","মাগরিব"],["isha","এশা"]];
export async function render(el){
  const [rows,dist]=await Promise.all([fetch("data/prayer-dhaka.json").then(r=>r.json()),fetch("data/districts.json").then(r=>r.json())]);
  let dn="গাজীপুর";try{dn=localStorage.getItem("district")||dn}catch{}
  const D=dist.districts.find(x=>x.name===dn)||dist.districts[0];
  const q=new URLSearchParams(location.hash.split("?")[1]||"");
  const now=q.get("t")?(([m,d,h,mi])=>new Date(2026,m-1,d,h,mi))(q.get("t").split(",").map(Number)):new Date();
  const T=dayTimes(rows.rows,now.getMonth()+1,now.getDate(),{sahri:D.sahri,iftar:D.iftar});
  const nm=now.getHours()*60+now.getMinutes();
  const list=[["sahri","সাহরি শেষ"],["fajr","ফজর"],["sunrise","সূর্যোদয়"],["zuhr","যোহর"],["asr","আসর"],["maghrib","মাগরিব"],["isha","এশা"]].map(([k,l])=>({k,l,t:T[k]}));
  const nxt=list.find(x=>x.t>nm)||list[0];
  const cur=[...list].reverse().find(x=>x.t<=nm);
  const circ=2*Math.PI*20;let lb=0;try{lb=+localStorage.getItem("lastBackupAt")||0}catch{}const days=lb?Math.floor((Date.now()-lb)/864e5):null;const bk=(days===null||days>30)?`<a class="chip warn" href="#/data">${days===null?"ব্যাকআপ কখনো নেওয়া হয়নি":"শেষ ব্যাকআপ "+toBn(days)+" দিন আগে"} — এখন নিন</a>`:"";
  const ring=([k,l])=>{const idx=list.findIndex(x=>x.k===k),a=list[idx].t,b=(list[idx+1]||{t:1440+list[0].t}).t;const p=Math.max(0,Math.min(1,(nm-a)/(b-a)));const isNext=nxt.k===k;
    return `<div class="ring ${isNext?"next":""}"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="none" stroke="var(--line)" stroke-width="4"/><circle class="p" cx="24" cy="24" r="20" fill="none" stroke="var(--gold)" stroke-width="4" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${circ*(1-(nm>=a&&nm<b?p:nm>=b?1:0))}" transform="rotate(-90 24 24)" style="transition:stroke-dashoffset .6s ease-out"/></svg><div>${l}</div><div class="mut">${h12(T[k]>720?T[k]:T[k])}</div></div>`};
  el.innerHTML=`<h1>আজ <span class="chip">${toBn(now.getDate())}/${toBn(now.getMonth()+1)}</span> <span class="chip">${dn}</span></h1>
  <div class="card glass"><div class="rings">${W.map(ring).join("")}</div></div>
  <div class="card"><div class="small mut">এখন</div><h2>${cur?cur.l+"-এর সময়":"রাত"} · পরের: ${nxt.l} ${h12(nxt.t)} (${nxt.t-nm>0?toBn(nxt.t-nm)+" মিনিট বাকি":"কাল"})</h2></div>
  <div class="card" style="border-color:var(--gold)"><div class="small mut">একটাই সবচেয়ে জরুরি</div><h3>৫ম শ্রেণির প্রশ্নপত্র ছাপানো</h3><span class="chip warn">নমুনা তথ্য — আসল নয়</span></div>
  <div class="tl">${list.map(x=>`<div class="it ${x.t<=nm?(cur&&cur.k===x.k?"now":"past"):""}"><time>${h12(x.t)}</time> ${x.l}${x.k==="sahri"||x.k==="maghrib"?` <span class="chip">${D.name} ${D.sahri>=0?"+":""}${toBn(x.k==="sahri"?D.sahri:D.iftar)}মি</span>`:""}</div>`).join("")}</div>
  ${bk}<p class="small mut">সময়: ইসলামিক ফাউন্ডেশন স্থায়ী সময়সূচী (স্ক্যান থেকে তোলা, অযাচাইকৃত) · মাঝের দিন রৈখিক ইন্টারপোলেশন।</p>`;
}
