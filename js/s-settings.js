import {allFonts} from "./idb.js";
import {setLite} from "./perf.js";
const sample="বর্ষার সকালে গ্রামের পথ ভিজে চকচক করছে। উস্তাদ সাহেব সবাইকে সালাম দিলেন — বিজ্ঞান, যুক্তাক্ষর, দৃষ্টান্ত, উজ্জ্বল।";
const get=k=>{try{return localStorage.getItem(k)}catch{return null}};const set=(k,v)=>{try{v==null||v===""?localStorage.removeItem(k):localStorage.setItem(k,v)}catch{}};
const has=n=>[...document.fonts].some(f=>f.family.replace(/["']/g,"")===n&&f.status==="loaded");
export async function render(el){
  const F=window.AMIN_FONTS||{},user=(await allFonts().catch(()=>[])).map(f=>["U-"+f.name,f.name+" (আপনার তোলা)"]);
  const opts=[...Object.entries(F).map(([k,v])=>[k,v.l]),...user];
  const radio=(name,cur)=>opts.map(([k,l])=>`<label class="card" style="display:block;margin:6px 0"><input type="radio" name="${name}" value="${k}" ${(cur||"default")===k?"checked":""}> <b>${l}</b> <span class="chip" data-chk="${k}"></span></label>`).join("");
  el.innerHTML=`<h1>সেটিংস</h1><p class="small mut">পছন্দ এই ফোনে সংরক্ষিত থাকে এবং অ্যাপ খুললে প্রথম পর্দা আঁকার আগেই প্রয়োগ হয়। (ব্যাকআপে এগুলোও যায়।)</p>
  <div class="card"><h3>অ্যাপের ফন্ট (শিরোনাম ও সব লেখা)</h3><div class="mut small">এই বর্ণনা-অংশও বেছে নেওয়া ফন্টেই দেখানো হচ্ছে।</div>${radio("fontUI",get("fontUI"))}</div>
  <div class="card"><h3>পড়ার ফন্ট (লম্বা লেখা)</h3><div class="mut small">ফন্ট-নমুনা ও "পড়ার" অংশে ব্যবহৃত হয়।</div>${radio("fontRead",get("fontRead"))}<div class="read long" id="pv" style="margin-top:8px">${sample}</div></div>
  <div class="card"><h3>লেখার আকার</h3><input id="fs" type="range" min="14" max="22" value="${parseInt(get("fs"))||16}"> <span id="fsv"></span></div>
  <div class="card"><h3>থিম ও কাচ</h3><div class="row"><button class="ghost" data-th="">সিস্টেম/ডার্ক</button><button class="ghost" data-th="dark">ডার্ক</button><button class="ghost" data-th="light">লাইট</button><button class="ghost" id="lt">হালকা মোড (ব্লার বন্ধ) বদল</button></div></div>
  <div class="card"><button class="ghost" id="rst">সব পছন্দ ডিফল্টে ফেরান</button></div>
  <p class="small mut">Amiri: আরবি লেখার জন্য প্রশ্নপত্র/ফন্ট-নমুনায় ব্যবহৃত; এখানে বেছে নেওয়ার ফন্ট নয়।</p>`;
  const chk=()=>el.querySelectorAll("[data-chk]").forEach(c=>{const k=c.dataset.chk,f=F[k],fam=k.startsWith("U-")?k:f?.s?.replace(/'/g,"");if(!fam||k==="default"||k==="device"){c.textContent="";return}const ok=has(fam);c.textContent=ok?"লোড হয়েছে":"লোড হয়নি";c.className="chip "+(ok?"ok":"warn");c.title=ok?"":"ইন্টারনেটে একবার খুললে নামবে; ততক্ষণ ডিফল্ট ফন্ট দেখাবে"});
  const apply=()=>{window.AMIN_applyFonts();setTimeout(chk,800);setTimeout(chk,3000)};
  el.querySelectorAll('input[name="fontUI"]').forEach(r=>r.onchange=()=>{set("fontUI",r.value==="default"?"":r.value);apply()});
  el.querySelectorAll('input[name="fontRead"]').forEach(r=>r.onchange=()=>{set("fontRead",r.value==="default"?"":r.value);apply()});
  const fs=el.querySelector("#fs"),fv=el.querySelector("#fsv");fv.textContent=fs.value+"px";fs.oninput=()=>{fv.textContent=fs.value+"px";set("fs",fs.value);apply()};
  el.querySelectorAll("[data-th]").forEach(b=>b.onclick=()=>{set("theme",b.dataset.th);if(b.dataset.th)document.documentElement.dataset.theme=b.dataset.th;else document.documentElement.removeAttribute("data-theme")});
  el.querySelector("#lt").onclick=()=>setLite(!document.documentElement.hasAttribute("data-lite"));
  el.querySelector("#rst").onclick=()=>{["fontUI","fontRead","fs","theme"].forEach(k=>set(k,""));document.documentElement.removeAttribute("data-theme");document.documentElement.style.removeProperty("--fs");window.AMIN_applyFonts();render(el)};
  document.fonts.onloadingdone=chk;chk();
}
