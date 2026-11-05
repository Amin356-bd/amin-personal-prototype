import {collect,seal,openFile,summary,apply,undoLast,safetyInfo,BackupError,FORMAT} from "./core/backup.js";
import {rawAll} from "./core/repo.js";
import {allFonts} from "./idb.js";
const mb=n=>(n/1048576).toFixed(2)+" MB";
export async function render(el){
  const last=(()=>{try{return +localStorage.getItem("lastBackupAt")||0}catch{return 0}})();
  const [recs,fonts,safe]=await Promise.all([rawAll().catch(()=>[]),allFonts().catch(()=>[]),safetyInfo()]);
  const fsz=fonts.reduce((a,f)=>a+f.buf.byteLength,0);
  el.innerHTML=`<h1>ডেটা ও ব্যাকআপ</h1><p class="small mut">সব ডেটা এই ফোনে। ব্যাকআপ-ফাইলই আপনার নিরাপত্তা-জাল — মাসে একবার নিন।</p>
  <div class="card small">রেকর্ড: <b>${recs.filter(r=>!r.deleted).length}</b> · তোলা ফন্ট: <b>${fonts.length}</b> (${mb(fsz)}) · শেষ ব্যাকআপ: <b>${last?new Date(last).toLocaleDateString("bn-BD"):"কখনো নয়"}</b></div>
  <div class="card"><h3>ব্যাকআপ নিন</h3>
   <label class="small">পাসফ্রেজ (ঐচ্ছিক — দিলে ফাইল এনক্রিপ্টেড): <input type="password" id="p1" autocomplete="new-password" style="width:100%"></label>
   <label class="small">আবার লিখুন: <input type="password" id="p2" autocomplete="new-password" style="width:100%"></label>
   <label class="small"><input type="checkbox" id="wf"> তোলা ফন্ট ফাইলসহ (${mb(fsz)} বাড়বে)</label>
   <div class="small" style="color:var(--warn)">⚠ পাসফ্রেজ ভুললে ফাইল আর খোলা যাবে না — উদ্ধারের উপায় নেই।</div>
   <div class="row" style="margin-top:8px"><button id="ex">ব্যাকআপ-ফাইল তৈরি</button></div><div id="exo" class="small"></div></div>
  <div class="card"><h3>ব্যাকআপ ফেরত আনুন</h3><input type="file" id="im" accept=".json,application/json"><div id="imo" class="small"></div></div>
  <div class="card"><h3>শেষ ইমপোর্ট বাতিল</h3><div class="small mut">${safe?"ইমপোর্টের আগের অবস্থার কপি আছে ("+new Date(safe.at).toLocaleString("bn-BD")+")":"কোনো কপি নেই"}</div><button class="ghost" id="un" ${safe?"":"disabled"}>পূর্বাবস্থায় ফিরুন</button><div id="uno" class="small"></div></div>`;
  const $=s=>el.querySelector(s);
  $("#ex").onclick=async()=>{const o=$("#exo"),a=$("#p1").value,b=$("#p2").value;if(a!==b){o.innerHTML='<span class="chip bad">পাসফ্রেজ দুটি মেলেনি</span>';return}
    o.textContent=a?"এনক্রিপ্ট হচ্ছে… (কয়েক সেকেন্ড লাগতে পারে)":"তৈরি হচ্ছে…";
    try{const p=await collect({fonts:$("#wf").checked});const f=await seal(p,a);const txt=JSON.stringify(f);const name=`amin-backup-${new Date().toISOString().slice(0,10)}.json`;const file=new File([txt],name,{type:"application/json"});
      if(navigator.canShare?.({files:[file]})&&confirm("শেয়ার-মেনু দিয়ে সংরক্ষণ করবেন? (বাতিল = সরাসরি ডাউনলোড)")){try{await navigator.share({files:[file]})}catch{}}else{const u=URL.createObjectURL(file),l=document.createElement("a");l.href=u;l.download=name;l.click();setTimeout(()=>URL.revokeObjectURL(u),5000)}
      try{localStorage.setItem("lastBackupAt",String(Date.now()))}catch{}
      o.innerHTML=`<span class="chip ok">তৈরি</span> ${name} · ${mb(txt.length)} · ${f.enc?"এনক্রিপ্টেড":"এনক্রিপশন ছাড়া"} · রেকর্ড ${p.meta.counts.records}`}
    catch(e){o.innerHTML=`<span class="chip bad">ব্যর্থ</span> ${e.message}`}};
  $("#im").onchange=async e=>{const f=e.target.files[0],o=$("#imo");if(!f)return;o.textContent="পড়ছি…";
    try{const text=await f.text();let pass="";let head;try{head=JSON.parse(text)}catch{}
      if(head?.enc){pass=prompt("এই ফাইল এনক্রিপ্টেড। পাসফ্রেজ দিন:")||""}
      const p=await openFile(text,pass),s=summary(p);
      o.innerHTML=`<div class="card"><b>ফাইল ঠিক আছে ✓</b><br>তৈরি: ${new Date(s.createdAt).toLocaleString("bn-BD")}<br>রেকর্ড ${s.records} · ফন্ট ${s.fonts} · সেটিংস ${s.settings}<div class="row" style="margin-top:8px"><button id="mg">মিলিয়ে নিন (merge)</button><button class="ghost" id="rp">সব বদলে দিন (replace)</button></div><div class="small mut">merge: নতুনটা রাখে, কিছু মোছে না। replace: বর্তমান ডেটা সরিয়ে ফাইলের ডেটা বসায়। দুটিতেই আগের অবস্থার কপি রাখা হয়।</div></div>`;
      const go=async mode=>{if(mode==="replace"&&prompt('বর্তমান ডেটা বদলে যাবে। চালিয়ে যেতে "বদলাও" লিখুন:')!=="বদলাও")return;o.textContent="প্রয়োগ হচ্ছে…";try{const r=await apply(p,{mode});o.innerHTML=`<span class="chip ok">সম্পন্ন</span> রেকর্ড লেখা ${r.recordsWritten}, ফন্ট ${r.fonts}`;toast("ইমপোর্ট সম্পন্ন")}catch(err){o.innerHTML=`<span class="chip bad">ব্যর্থ</span> ${err.message}`}};
      o.querySelector("#mg").onclick=()=>go("merge");o.querySelector("#rp").onclick=()=>go("replace")}
    catch(err){o.innerHTML=`<span class="chip bad">${err instanceof BackupError?"গ্রহণ করা হয়নি":"ত্রুটি"}</span> ${err.message}`}finally{e.target.value=""}};
  $("#un").onclick=async()=>{try{const s=await undoLast();$("#uno").innerHTML=`<span class="chip ok">ফিরেছে</span> রেকর্ড ${s.records}`}catch(e){$("#uno").innerHTML=`<span class="chip bad">ব্যর্থ</span> ${e.message}`}};
                                                     }
