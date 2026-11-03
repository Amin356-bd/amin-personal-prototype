const items=[["today","১ · আজ-সময়রেখা (ডিজাইন)"],["family","১ · পরিবারের গাছ → প্রসারণ"],["path","১ · শ্রেণি→বিষয়→অধ্যায় পথ"],["learn","১ · জানার কোণ-কার্ড"],["glass","২ · কাচ-চাপ-পরীক্ষা + FPS"],["fonts","৩ · ফন্ট-নমুনা + নিজের ফন্ট তোলা"],["print","৪ · প্রশ্নপত্র → A4 ল্যান্ডস্কেপ → PDF"],["install","৫ · ইনস্টল ও অফলাইন অবস্থা"],["icons","৫ · আইকন ৪৮px"],["prayer","১০ · নামাজের সময়-টেবিল"],["share","৯ · Web Share Target ইনবক্স"],["bauth","খ-১ · সাইন-ইন ও Firestore নিয়ম (Firebase লাগবে)"],["bai","খ-২ · App Check ও AI-কল (Firebase লাগবে)"],["bpdf","খ-৩ · AI দিয়ে PDF পড়া (Firebase লাগবে)"],["bremind","খ-৪ · রিমাইন্ডার (ইনস্টল-করা অ্যাপে)"]];
export function render(el){
  const th=document.documentElement.dataset.theme||"dark";
  el.innerHTML=`<h1>পরীক্ষা-তালিকা</h1><p class="mut small">প্রতিটি পাতা খুলে দেখুন; নিচে "ফোনে যা দেখবেন" লেখা আছে।</p>
  <div class="hub">${items.map(([r,t])=>`<a class="card" href="#/${r}"><b>${t}</b></a>`).join("")}</div>
  <div class="card row"><span>থিম:</span><button class="ghost" id="th">${th==="light"?"ডার্ক":"লাইট"} করুন</button>
  <span>ফন্ট-আকার:</span><input id="fs" type="range" min="14" max="22" value="${parseInt(getComputedStyle(document.documentElement).getPropertyValue("--fs"))||16}"></div>`;
  el.querySelector("#th").onclick=()=>{const n=document.documentElement.dataset.theme==="light"?"dark":"light";document.documentElement.dataset.theme=n;try{localStorage.setItem("theme",n)}catch{};render(el)};
  el.querySelector("#fs").oninput=e=>document.documentElement.style.setProperty("--fs",e.target.value+"px");
}
