const T={"শ্রেণি ৫":{"কুরআন-তাজভীদ":["নুন সাকিন","মিম সাকিন","ইদগাম"],"আরবি":["হরফ","শব্দ","বাক্য"]},"শ্রেণি ৯":{"ইসলামের ইতিহাস":["অধ্যায় ১","অধ্যায় ২","অধ্যায় ৩"],"আরবি ২য় পত্র":["অনুবাদ","ব্যাকরণ"]}};
export function render(el){
  let st=[];
  const draw=()=>{const lvl=st.length;let node=T;st.forEach(k=>node=Array.isArray(node)?null:node[k]);
    const items=Array.isArray(node)?node:Object.keys(node);
    el.innerHTML=`<h1>পাঠ্যক্রম-পথ</h1><div class="crumb"><button class="ghost" data-i="-1">শুরু</button>${st.map((s,i)=>`<button class="ghost" data-i="${i}">${s}</button>`).join("")}</div><div class="pathlist slide">${items.map((k,i)=>`<button class="${lvl===2&&i===1?"today":""}" data-k="${k}">${k}${lvl===2&&i===1?' <span class="chip ok">আজকের পাঠ</span>':""}${lvl<2?" ›":""}</button>`).join("")}</div>${lvl===2?'<div class="card small mut">শ্রেণি → বিষয় → অধ্যায় (→ পাঠ → প্রশ্ন পরে)। নমুনা তথ্য।</div>':""}`;
    el.querySelectorAll(".crumb button").forEach(b=>b.onclick=()=>{st=st.slice(0,+b.dataset.i+1);draw()});
    el.querySelectorAll(".pathlist button").forEach(b=>b.onclick=()=>{if(lvl<2){st.push(b.dataset.k);draw()}});};
  draw();
}
