import {makeIcs,alarmIntent} from "./ics.js";
const K="rem";const load=()=>{try{return JSON.parse(localStorage.getItem(K)||"[]")}catch{return[]}};const save=l=>{try{localStorage.setItem(K,JSON.stringify(l))}catch{}};
const hm=t=>new Date(t).toLocaleTimeString("bn-BD",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
async function swLog(){try{const c=await caches.open("remind-log");const r=await c.match("/log.json");return r?await r.json():[]}catch{return[]}}
async function putDue(list){const c=await caches.open("remind");await c.put("/due.json",new Response(JSON.stringify(list)))}
export async function render(el){
  const reg=await navigator.serviceWorker?.ready.catch(()=>null);
  const feat={trigger:"Notification"in self&&"showTrigger"in Notification.prototype&&"TimestampTrigger"in self,periodic:!!(reg&&"periodicSync"in reg),perm:"Notification"in self?Notification.permission:"নেই",standalone:matchMedia("(display-mode: standalone)").matches};
  el.innerHTML=`<h1>খ-৪ রিমাইন্ডার (৩ পদ্ধতি + .ics + অ্যালার্ম-অ্যাপ)</h1>
  <p class="small mut">অ্যাপ ইনস্টল করে, নোটিফিকেশন অনুমতি দিয়ে, পদ্ধতি চালু করুন → অ্যাপ বন্ধ → ফোন লক → অপেক্ষা। ব্যাটারি "Optimized" ও "Unrestricted" দুই অবস্থায় আলাদা আলাদা চালান।</p>
  <div class="card small">ডিভাইস-সক্ষমতা: Notification Triggers <span class="chip ${feat.trigger?"ok":"bad"}">${feat.trigger?"আছে":"নেই"}</span> (ডক: এই API-র উন্নয়ন বন্ধ) · Periodic Sync <span class="chip ${feat.periodic?"ok":"bad"}">${feat.periodic?"আছে":"নেই"}</span> · ইনস্টল-করা অ্যাপ <span class="chip ${feat.standalone?"ok":"warn"}">${feat.standalone?"হ্যাঁ":"না"}</span> · অনুমতি: <b>${feat.perm}</b> <button class="ghost" id="perm" style="padding:2px 10px">অনুমতি চান</button></div>
  <div class="card row"><label>কত মিনিট পরে: <input type="number" id="dly" value="3" min="1" max="120" style="width:70px"></label><label>ব্যাটারি: <select id="bat"><option>Optimized</option><option>Unrestricted</option></select></label></div>
  <div class="card"><div class="row"><button data-m="trigger">১· Notification Trigger</button><button data-m="swtimer">২· SW/পেজ টাইমার</button><button data-m="periodic">৩· Periodic Sync</button></div><div class="row" style="margin-top:8px"><button class="ghost" data-m="ics">৪· .ics (ক্যালেন্ডার)</button><button class="ghost" data-m="alarm">৫· ঘড়ি-অ্যাপ অ্যালার্ম</button></div><div id="msg" class="small" style="margin-top:6px"></div></div>
  <div class="card"><h3>লগ</h3><div id="log"></div><button class="ghost" id="cpy">লগ কপি</button> <button class="ghost" id="clr">মুছুন</button></div>`;
  const msg=el.querySelector("#msg"),logEl=el.querySelector("#log");
  const draw=async()=>{const L=load(),S=await swLog();logEl.innerHTML=L.length?`<table><tr><th>পদ্ধতি</th><th>নির্ধারিত</th><th>SW-এ বেজেছে</th><th>ব্যাটারি</th><th>আপনার রায়</th></tr>${L.map((r,i)=>{const s=S.find(x=>x.id===r.id);return `<tr><td>${r.method}</td><td>${hm(r.due)}</td><td>${s?hm(s.firedAt)+" (+"+Math.round((s.firedAt-r.due)/1000)+"s)":"—"}</td><td>${r.battery}</td><td>${r.verdict||`<button class="ghost" data-v="${i}|সময়মতো" style="padding:1px 6px">✓</button><button class="ghost" data-v="${i}|দেরিতে" style="padding:1px 6px">দেরি</button><button class="ghost" data-v="${i}|বাজেনি" style="padding:1px 6px">✗</button>`}</td></tr>`}).join("")}</table>`:'<span class="mut">এখনো কিছু নেই</span>';
    logEl.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{const [i,v]=b.dataset.v.split("|"),l=load();l[+i].verdict=v;save(l);draw()})};
  el.querySelector("#perm").onclick=async()=>{try{const p=await Notification.requestPermission();toast("অনুমতি: "+p)}catch(e){toast("হয়নি: "+e.message)}};
  el.querySelectorAll("[data-m]").forEach(b=>b.onclick=async()=>{
    const m=b.dataset.m,mins=Math.max(1,+el.querySelector("#dly").value||3),due=Date.now()+mins*60000,bat=el.querySelector("#bat").value,id=m+"-"+due,title="AMIN পরীক্ষা: "+m;
    const add=()=>{const l=load();l.push({id,method:m,due,battery:bat});save(l);draw()};
    try{
      if(m==="trigger"){if(!feat.trigger){msg.innerHTML='<span class="chip bad">এই ফোনে Notification Triggers নেই</span> — এটাই ফল (ঠিক ঠিক "নেই" লিখে রাখা হলো)';const l=load();l.push({id,method:m,due,battery:bat,verdict:"API নেই"});save(l);draw();return}
        await reg.showNotification(title,{tag:id,showTrigger:new TimestampTrigger(due),body:"নির্ধারিত সময়ে বাজার কথা"});add();msg.textContent="নির্ধারিত: "+hm(due)+" — অ্যাপ বন্ধ করে ফোন লক করুন"}
      if(m==="swtimer"){reg.active.postMessage({type:"sched",id,due,title});setTimeout(()=>{if(Notification.permission==="granted")new Notification(title+" (পেজ-টাইমার)")},due-Date.now());add();msg.textContent="SW + পেজ টাইমার বসেছে ("+hm(due)+")। অ্যাপ বন্ধ করলে পেজ-টাইমার মরে যাবে — সেটাই পরীক্ষা"}
      if(m==="periodic"){const st=await navigator.permissions.query({name:"periodic-background-sync"}).catch(()=>({state:"জানা নেই"}));if(!feat.periodic){msg.innerHTML='<span class="chip bad">Periodic Sync নেই</span>';const l=load();l.push({id,method:m,due,battery:bat,verdict:"API নেই"});save(l);draw();return}
        const l=load().filter(x=>x.method==="periodic"&&!x.verdict).concat([{id,due,title}]);await putDue(l.map(x=>({id:x.id,due:x.due,title:x.title||title})));
        await reg.periodicSync.register("amin-remind",{minInterval:60*1000});add();msg.textContent="অনুমতি: "+st.state+" · Chrome নিজে ঠিক করে কখন চালাবে (সাধারণত ঘণ্টায়/দিনে) — তাই দেরি বা না-বাজা স্বাভাবিক"}
      if(m==="ics"){const t=makeIcs([{id,start:new Date(due),title:"AMIN পরীক্ষা (.ics)"}]);const f=new File([t],"amin-test.ics",{type:"text/calendar"});
        if(navigator.canShare?.({files:[f]})){try{await navigator.share({files:[f]})}catch{}}else{const a=document.createElement("a");a.href=URL.createObjectURL(f);a.download="amin-test.ics";a.click()}
        add();msg.textContent=".ics তৈরি — খুলে ক্যালেন্ডারে যোগ করুন (ক্যালেন্ডার-অ্যাপ অ্যালার্ম ধরে কি না সেটাই পরীক্ষা)"}
      if(m==="alarm"){const d=new Date(due);add();location.href=alarmIntent(d.getHours(),d.getMinutes(),title)}
    }catch(e){msg.innerHTML=`<span class="chip bad">ব্যর্থ</span> ${String(e.message).slice(0,160)}`}
  });
  el.querySelector("#cpy").onclick=()=>{const L=load();navigator.clipboard?.writeText(L.map(r=>`${r.method} due ${new Date(r.due).toISOString()} battery ${r.battery} verdict ${r.verdict||"?"}`).join("\n")).then(()=>toast("কপি হয়েছে"))};
  el.querySelector("#clr").onclick=async()=>{save([]);await caches.delete("remind-log");await caches.delete("remind");draw()};
  draw();
}
