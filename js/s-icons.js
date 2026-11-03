export function render(el){
  const bg=[["#0B1226","গাঢ়"],["#F4F1EA","হালকা"],["#3b57b8","রঙিন"]];
  const box=(src,s,b,extra="")=>`<div class="icbox" style="background:${b[0]};color:${b[0]==="#F4F1EA"?"#000":"#fff"}"><img src="${src}" width="${s}" height="${s}" class="${extra}" alt="">${s}px</div>`;
  el.innerHTML=`<h1>আইকন — আসল আকারে</h1><p class="small mut">ফোনে ৪৮px-এ পরিষ্কার লাগছে কি না দেখুন (ব্র্যান্ড-কিট README-র শর্ত)।</p>
  ${bg.map(b=>`<div>${[48,32,24].map(s=>box("icons/icon-192.png",s,b)).join("")}${box("icons/icon-maskable-512.png",48,b,"mask")}${box("icons/favicon-48.png",48,b)}</div>`).join("")}
  <h3>নোটিফিকেশন (একরঙা)</h3><div style="background:#444;display:inline-block;padding:10px"><img src="icons/notification-mono-96.png" width="48" height="48" alt=""></div> <div style="background:#444;display:inline-block;padding:10px"><img src="icons/notification-mono-96.png" width="24" height="24" alt=""></div>
  <h3>লোগো</h3><div style="background:#0B1226;padding:12px;display:inline-block"><img src="logo/lockup-356-dark.png" width="160" alt=""></div>`;
}
