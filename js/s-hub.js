const G=[
 ["স্বাধীন অ্যাপ (নেটওয়ার্ক/Firebase ছাড়া চলে)",[["today","আজ-সময়রেখা"],["prayer","নামাজের সময়-টেবিল"],["print","প্রশ্নপত্র → A4 PDF"],["notes","নোট (নমুনা মডিউল)"],["data","ডেটা ও ব্যাকআপ"],["settings","সেটিংস (ফন্ট, আকার, থিম)"],["share","শেয়ার-ইনবক্স"],["family","পরিবারের গাছ (নমুনা)"],["path","পাঠ্যক্রম-পথ (নমুনা)"],["learn","জানার কোণ (নমুনা)"]]],
 ["ফোন-পরীক্ষা (সম্পন্ন/চলমান)",[["glass","কাচ-চাপ-পরীক্ষা + FPS"],["fonts","ফন্ট-নমুনা + নিজের ফন্ট তোলা"],["install","ইনস্টল ও অফলাইন অবস্থা"],["icons","আইকন ৪৮px"],["bremind","রিমাইন্ডার-পরীক্ষা"]]]];
const CLOUD=[["bauth","সাইন-ইন ও Firestore নিয়ম"],["bai","App Check ও AI-কল"],["bpdf","AI দিয়ে PDF পড়া"]];
export function render(el){
  const th=document.documentElement.dataset.theme||"dark";
  el.innerHTML=`<h1>AMIN</h1>${G.map(([t,l])=>`<h3>${t}</h3><div class="hub">${l.map(([r,n])=>`<a class="card" href="#/${r}"><b>${n}</b></a>`).join("")}</div>`).join("")}
  <details class="card"><summary><b>ক্লাউড (স্থগিত — স্বাধীন অ্যাপে লাগে না)</b></summary><p class="small mut">Firebase/AI সাময়িক বন্ধ; ফাইল মোছা হয়নি। এগুলো খুললে "কনফিগ বসানো হয়নি" দেখাবে — স্বাভাবিক।</p><div class="hub">${CLOUD.map(([r,n])=>`<a class="card" href="#/${r}"><b>${n}</b></a>`).join("")}</div></details>
  <div class="card row"><span>থিম:</span><button class="ghost" id="th">${th==="light"?"ডার্ক":"লাইট"} করুন</button><a href="#/settings" class="btn ghost" style="background:none;color:inherit;border:1px solid var(--line)">আরও সেটিংস →</a></div>`;
  el.querySelector("#th").onclick=()=>{const n=document.documentElement.dataset.theme==="light"?"dark":"light";document.documentElement.dataset.theme=n;try{localStorage.setItem("theme",n)}catch{};render(el)};
  
}
