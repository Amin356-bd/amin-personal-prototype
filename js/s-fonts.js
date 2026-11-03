import {putFont,allFonts,delFont} from "./idb.js";
const GF="https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@400;600&family=Hind+Siliguri:wght@400;600&family=Noto+Serif+Bengali:wght@400;600&family=Amiri:ital,wght@0,400;0,700&display=swap";
export const BN=`বর্ষার সকালে গ্রামের পথ ভিজে চকচক করছে। মক্তবের ছোট ছোট ছেলেমেয়েরা ছাতা মাথায় সারি বেঁধে হেঁটে যাচ্ছে। উস্তাদ সাহেব দরজায় দাঁড়িয়ে প্রত্যেককে সালাম দিলেন। বিজ্ঞান, শ্রদ্ধা, সংস্কৃতি, যুক্তাক্ষর, দৃষ্টান্ত, ক্ষুদ্র, জ্ঞান, স্বপ্ন, বিশ্বাস, রাষ্ট্র, উজ্জ্বল, সন্ধ্যা — এই শব্দগুলোর যুক্তবর্ণ ঠিকভাবে বসছে কি না দেখুন। ক্লাসের শেষে সবাই মিলে আজকের পাঠ আবার মনে করল।`;
export const AR="كِتَابٌ جَدِيدٌ فِي الْمَدْرَسَةِ، وَقَلَمٌ صَغِيرٌ عَلَى الْمَكْتَبِ. هَذَا دَرْسٌ سَهْلٌ.";
const FONTS=[["Anek Bangla","'Anek Bangla'"],["Hind Siliguri","'Hind Siliguri'"],["Noto Serif Bengali","'Noto Serif Bengali'"]];
export async function render(el){
  if(!document.getElementById("gf")){const l=document.createElement("link");l.id="gf";l.rel="stylesheet";l.href=GF;document.head.appendChild(l)}
  el.innerHTML=`<h1>ফন্ট-নমুনা</h1><p class="small mut">ইন্টারনেট থাকলে প্রথমবার Google Fonts থেকে নামবে (পরীক্ষার জন্য; আসল অ্যাপে ফাইল রিপোতে থাকবে)। পরে অফলাইনেও থাকে কি না ইনস্টল-পাতায় দেখুন।</p>
  <div id="list"></div>
  <div class="sample"><div class="nm">Amiri <span class="chip" id="st-amiri">…</span></div><div class="arab" style="font-family:Amiri,FreeSerif,serif">${AR}</div></div>
  <div class="card"><h3>নিজের ফন্ট তুলুন (SutonnyOMJ, FreeSerif, যেকোনো .ttf/.otf)</h3><input type="file" id="pick" accept=".ttf,.otf,.woff,.woff2"><div id="mine" class="small"></div><p class="small mut">ফাইল IndexedDB-তে রাখা হয়; পাতা রিলোডের পরও থাকবে (প্রশ্নপত্র-পাতায় বেছে নেওয়া যায়)।</p></div>`;
  el.querySelector("#list").innerHTML=FONTS.map(([n,f])=>`<div class="sample"><div class="nm">${n} <span class="chip" data-f="${n}">…</span></div><div class="long" style="font-family:${f},'Noto Sans Bengali',sans-serif">${BN}</div></div>`).join("");
  const has=n=>[...document.fonts].some(f=>f.family.replace(/["']/g,"")===n&&f.status==="loaded");
  const chk=async()=>{for(const [n] of FONTS){const ok=has(n);const c=el.querySelector(`[data-f="${n}"]`);if(c){c.textContent=ok?"লোড হয়েছে":"লোড হয়নি";c.className="chip "+(ok?"ok":"bad")}}
    const a=el.querySelector("#st-amiri");if(a){const ok=has("Amiri");a.textContent=ok?"লোড হয়েছে":"লোড হয়নি (FreeSerif/ডিফল্ট দেখাচ্ছে)";a.className="chip "+(ok?"ok":"bad")}};
  try{await Promise.race([document.fonts.load('16px "Anek Bangla"',"ক"),new Promise(r=>setTimeout(r,2500))]);await Promise.race([Promise.all([document.fonts.load('16px "Hind Siliguri"',"ক"),document.fonts.load('16px "Noto Serif Bengali"',"ক"),document.fonts.load("16px Amiri","ك")]),new Promise(r=>setTimeout(r,2500))])}catch{}
  chk();document.fonts.onloadingdone=chk;
  const mine=el.querySelector("#mine");
  const draw=async()=>{const l=await allFonts();mine.innerHTML=l.length?l.map(f=>`<div class="sample"><div class="nm">${f.name} <span class="chip ok">সংরক্ষিত</span> <button class="ghost" data-d="${f.name}" style="padding:2px 8px">মুছুন</button></div><div class="long" style="font-family:'U-${f.name}',serif">${BN}</div><div class="arab" style="font-family:'U-${f.name}',serif">${AR}</div></div>`).join(""):'<span class="mut">এখনো কিছু তোলা হয়নি</span>';
    mine.querySelectorAll("[data-d]").forEach(b=>b.onclick=async()=>{await delFont(b.dataset.d);draw()})};
  el.querySelector("#pick").onchange=async e=>{const f=e.target.files[0];if(!f)return;const buf=await f.arrayBuffer();const name=f.name.replace(/\.[^.]+$/,"");
    try{const ff=new FontFace("U-"+name,buf.slice(0));await ff.load();document.fonts.add(ff);await putFont(name,buf,f.type);try{await navigator.storage?.persist?.()}catch{}toast("সংরক্ষিত: "+name);draw()}catch(err){toast("ফন্ট পড়া যায়নি: "+err)}};
  draw();
}
