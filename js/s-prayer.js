import {dayTimes,computed,COMPUTED_OFFSET,hhmm,h12,toBn,KEYS} from "./prayer.js";
const L={sahri:"সাহরি",fajr:"ফজর",zuhr:"যোহর",asr:"আসর",maghrib:"মাগরিব/ইফতার",isha:"এশা",sunrise:"সূর্যোদয়"};
const SUS=[[6,30,"sahri","সাহরি–ফজর ব্যবধান ৫ মি (সাধারণত ৬)"],[11,24,"fajr","সাহরি–ফজর ব্যবধান ৪ মি (সাধারণত ৬)"],[5,6,"isha","গণনার সঙ্গে ২.৫ মি তফাত"]];
const SAMPLE=[[1,1],[2,28],[4,12],[8,18],[10,12],[12,12],[6,24],[6,30],[11,24],[5,6]];
export async function render(el){
  const [P,Dd]=await Promise.all([fetch("data/prayer-dhaka.json").then(r=>r.json()),fetch("data/districts.json").then(r=>r.json())]);
  const rows=P.rows,dists=Dd.districts;
  let dn="গাজীপুর",conf={};try{dn=localStorage.getItem("district")||dn;conf=JSON.parse(localStorage.getItem("ptconf")||"{}")}catch{}
  const t=new Date(),today=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
  el.innerHTML=`<h1>নামাজের সময়-টেবিল</h1><div class="card"><span class="chip warn">স্ক্যান থেকে হাতে তোলা — আপনি মেলানো পর্যন্ত অযাচাইকৃত</span>
  <div class="row" style="margin-top:8px"><input type="date" id="dt" value="${today}"><select id="ds">${dists.map(d=>`<option ${d.name===dn?"selected":""}>${d.name}</option>`).join("")}</select><label class="small"><input type="checkbox" id="all"> সব ওয়াক্তে একই মিনিট (ঐচ্ছিক, টেবিলে নেই)</label></div><div id="out"></div></div>
  <div class="card"><h3>মেলানোর তালিকা (আপনার PDF-এর সঙ্গে)</h3><p class="small mut">নিচের সারিগুলো আপনার ইসলামিক ফাউন্ডেশন PDF-এর সঙ্গে মিলিয়ে ✓/✗ দিন। ⚠ চিহ্নিতগুলো আমার সন্দেহ।</p><div id="conf"></div><button id="exp" class="ghost">ফল কপি করুন</button></div>
  <div class="card small mut">উৎস: ${P.source}<br>ফেব্রুয়ারির শেষ সারি স্ক্যানে "৩০" ছাপা = মাসের শেষ দিন (আপনি নিশ্চিত করেছেন); লিপ-বছরের ২৯ ফেব্রুয়ারিও এই সারি ধরে।</div>`;
  const out=el.querySelector("#out");
  const draw=()=>{const [y,m,d]=el.querySelector("#dt").value.split("-").map(Number);const D=dists.find(x=>x.name===el.querySelector("#ds").value);try{localStorage.setItem("district",D.name)}catch{}
    const T=dayTimes(rows,m,d,{sahri:D.sahri,iftar:D.iftar},el.querySelector("#all").checked);const C=computed(m,d);
    out.innerHTML=`<table><tr><th>ওয়াক্ত</th><th>টেবিল+ইন্টারপো.</th><th>গণনা*</th><th>তফাত</th></tr>${KEYS.map(k=>{const c=C[k];const diff=c==null?"":(T[k]-(c+COMPUTED_OFFSET[k])-((k==="maghrib"&&!el.querySelector("#all").checked)?D.iftar:0)-((k==="sahri")?0:0));
      return `<tr><td>${L[k]}</td><td><b>${h12(T[k])}</b> <span class="mut small">${hhmm(T[k])}</span></td><td>${c==null?"—":hhmm(Math.round(c))}</td><td>${c==null?"":(Math.abs(T[k]-Math.round(c)-(COMPUTED_OFFSET[k]||0))<=2.5?'<span class="chip ok">মিলছে</span>':'<span class="chip bad">দেখুন</span>')}</td></tr>`}).join("")}</table><p class="small mut">* স্বাধীন সৌর-গণনা (ফজর ১৮°, আসর হানাফি/ছায়া২, মাগরিব=অস্ত+স্থির ব্যবধান)। "মিলছে" = ২.৫ মিনিটের মধ্যে। জেলা-মিনিট শুধু সাহরি ও ইফতারে (ডিফল্ট)।</p>`};
  ["#dt","#ds","#all"].forEach(s=>el.querySelector(s).onchange=draw);draw();
  const cf=el.querySelector("#conf");
  const cdraw=()=>{cf.innerHTML=SAMPLE.map(([m,d])=>{const r=rows.find(x=>x.m===m&&x.d===d)||rows.find(x=>x.m===m&&x.d===d+2);if(!r)return"";const key=m+"/"+d;const sus=SUS.find(s=>s[0]===m&&s[1]===d);const s=conf[key];
    return `<div class="card" style="margin:6px 0"><b>${toBn(d)}/${toBn(m)}</b> ${sus?`<span class="chip warn">⚠ ${sus[3]}</span>`:""}<div class="small">${["sahri","fajr","zuhr","asr","maghrib","isha","sunrise"].map(k=>L[k].split("/")[0]+" "+h12(r[k])).join(" · ")}</div><div class="row"><button class="ghost" data-k="${key}" data-v="1">✓ মিলছে</button><button class="ghost" data-k="${key}" data-v="0">✗ ভুল</button>${s==="1"?'<span class="chip ok">মিলেছে</span>':s==="0"?'<span class="chip bad">ভুল</span>':""}</div></div>`}).join("");
    cf.querySelectorAll("button").forEach(b=>b.onclick=()=>{conf[b.dataset.k]=b.dataset.v;try{localStorage.setItem("ptconf",JSON.stringify(conf))}catch{};cdraw()})};cdraw();
  el.querySelector("#exp").onclick=async()=>{const s=Object.entries(conf).map(([k,v])=>k+": "+(v==="1"?"ঠিক":"ভুল")).join("\n");try{await navigator.clipboard.writeText(s);toast("কপি হয়েছে")}catch{toast(s||"কিছু নেই")}};
}
