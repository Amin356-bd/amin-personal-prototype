import {allFonts} from "./idb.js";
import {AR} from "./s-fonts.js";
const Q=(n,t,m)=>`<div class="q"><span>${n}। ${t}</span><span class="mk">${m}</span></div>`;
// placeholder content: NOT real exam questions, NOT Quran text
const CH=[
 ()=>`<div class="hd"><img src="logo/madrasa-logo.png" alt=""><b>পিরুজালী মডেল মাদ্রাসা</b><b>অর্ধ-বার্ষিক পরীক্ষা-২০২৫</b></div><div class="meta"><span>শ্রেণিঃ ৫ম</span><span>বিষয়ঃ নমুনা</span><span>সময়ঃ ২.৩০ মিনিট</span><span>পূর্ণমান ১০০</span></div><div class="note">(বি.দ্র. ডানপাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক)</div><h4>(ক) বিভাগ — নমুনা-৭০</h4>${Q("১","সঠিক উত্তর লিখ: <b>(৫টি)</b>","১০")}<div class="sub">ক) বিজ্ঞান ও সংস্কৃতি — যুক্তবর্ণ: ক্ষ জ্ঞ স্ত্র ন্দ্র ঙ্ক ত্ব</div><div class="sub">খ) আরবি শব্দ: <span class="ar">${AR.split("،")[0]}</span></div>${Q("২","এক কথায় উত্তর দাও: <b>(৫টি)</b>","১০")}<div class="sub">ক) নমুনা প্রশ্ন, খ) নমুনা প্রশ্ন, গ) নমুনা প্রশ্ন</div>`,
 ()=>`<h4>অর্ধ-পাতা ২</h4>${Q("৩","রচনামূলক প্রশ্নের উত্তর দাও-(যে-কোনো <b>২টি</b>)","২০")}<div class="sub">ক) নমুনা, খ) নমুনা, গ) নমুনা</div>${Q("৪","শূন্যস্থান পূরণ কর -","১০")}<div class="sub">ক) ______ বাহক। খ) ______ টি।</div><div class="sub ar" style="font-size:22px">${AR}</div>`,
 ()=>`<h4>অর্ধ-পাতা ৩</h4>${Q("৫","হরকত সহ মুখস্থ লিখ-(<b>১টি</b>)","১০")}<div class="sub">ক) নমুনা খ) নমুনা গ) নমুনা</div>${Q("৬","বাংলায় অনুবাদ লিখ-(যে-কোনো <b>১টি</b>)","১০")}<div class="sub ar" style="font-size:22px">قَلَمٌ، كِتَابٌ، بَابٌ</div>`,
 ()=>`<h4>(খ) বিভাগ — নমুনা-৩০ · অর্ধ-পাতা ৪</h4>${Q("৭","এক কথায় উত্তর দাও-(যে-কোনো <b>৫টি</b>)","১০")}<div class="sub">ক) … খ) … গ) … ঘ) … ঙ) …</div>${Q("৮","রচনামূলক প্রশ্নের উত্তর দাও: (যে-কোনো <b>১টি</b>)","১০")}<div class="sub">ক) নমুনা খ) নমুনা</div>`];
// LTR = Bangla/English paper (docs 03 §10). RTL = Arabic paper: n=3 confirmed by user (front [blank|1], back [3|2]);
// n=2 and n=4 are GUESSES (back sheet mirrored / 1st on the right) — user will verify on paper.
const layout=(n,rtl)=>rtl?({1:[[1,1]],2:[[2,1]],3:[[0,1],[3,2]],4:[[4,1],[3,2]]})[n]:({1:[[1,1]],2:[[1,2]],3:[[0,1],[2,3]],4:[[4,1],[2,3]]})[n];
export async function render(el){
  const fonts=await allFonts();
  el.innerHTML=`<h1>প্রশ্নপত্র → PDF</h1><p class="small mut">নমুনা-টেমপ্লেট (৫ম শ্রেণি ০৩-এর কাঠামো; লেখা নকল নয়)। অর্ধ-পাতা বেছে "PDF করুন" চাপুন → Chrome-এর প্রিন্ট-পাতায় "Save as PDF", কাগজ A4 ল্যান্ডস্কেপ।</p>
  <div class="card row"><label>অর্ধ-পাতা: <select id="n"><option>1</option><option selected>2</option><option>3</option><option>4</option></select></label>
  <label>কাগজ: <select id="d"><option value="">বাংলা/ইংরেজি (বাঁ→ডান)</option><option value="rtl">আরবি (ডান→বাঁ)</option></select></label> <label>বাংলা ফন্ট: <select id="f"><option value="">ডিফল্ট (Hind Siliguri)</option>${fonts.map(f=>`<option value="U-${f.name}">${f.name} (তোলা)</option>`).join("")}</select></label>
  <button id="p">PDF করুন (প্রিন্ট)</button></div><div class="small mut" id="info"></div><div id="sheets"></div>`;
  const paint=()=>{const n=+el.querySelector("#n").value,f=el.querySelector("#f").value,rtl=el.querySelector("#d").value==="rtl";const L=layout(n,rtl);
    el.querySelector("#sheets").innerHTML=L.map((pair,si)=>`<div class="sheet" data-side="${si?"পিছন":"সামনে"}">${pair.map(i=>`<div class="half" style="${rtl?"direction:rtl;":""}${f?`font-family:'${f}','Hind Siliguri',serif`:""}">${i?CH[i-1]():"<div class='blank'>(ফাঁকা)</div>"}<div class="pg">[অর্ধ-পাতা ${i||"ফাঁকা"}]</div></div>`).join("")}</div>`).join("");
    el.querySelector("#info").textContent=`${L.length} পাতার PDF · সামনে ${L[0].map(x=>x||"ফাঁকা").join(" | ")}`+(L[1]?` · পিছনে ${L[1].join(" | ")}`:"")+(rtl&&(n===2||n===4)?" · ⚠ আরবি ২/৪ অর্ধ-পাতার ক্রম অনুমান — কাগজে যাচাই বাকি":"")};
  el.querySelector("#n").onchange=paint;el.querySelector("#d").onchange=paint;el.querySelector("#f").onchange=paint;paint();
  el.querySelector("#p").onclick=()=>window.print();
  document.body.classList.add("printing-page");
  const cleanup=()=>{if(!el.isConnected)document.body.classList.remove("printing-page")};addEventListener("hashchange",cleanup,{once:true});
}
