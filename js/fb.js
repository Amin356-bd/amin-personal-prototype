import cfg from "./firebase-config.js";
const CDN=v=>`https://www.gstatic.com/firebasejs/${v}/`;
export const configured=()=>!Object.values(cfg.firebase).some(v=>String(v).startsWith("PASTE"));
export const cfgOwner=()=>String(cfg.ownerUid).startsWith("PASTE")?null:cfg.ownerUid;
export {cfg};
let P=null;
export function load(){ // memoised init; throws friendly errors
  return P??=(async()=>{
    if(!configured())throw Object.assign(new Error("firebase-config.js এখনো বসানো হয়নি"),{code:"no-config"});
    if(!navigator.onLine)throw Object.assign(new Error("অফলাইন — Firebase চলবে না"),{code:"offline"});
    const v=cfg.sdkVersion,U=CDN(v);let m;
    try{m={app:await import(U+"firebase-app.js"),auth:await import(U+"firebase-auth.js"),fs:await import(U+"firebase-firestore.js"),ac:await import(U+"firebase-app-check.js"),ai:await import(U+"firebase-ai.js")}}
    catch(e){throw Object.assign(new Error("Firebase SDK নামানো যায়নি ("+v+"): "+e.message),{code:"sdk-load"})}
    const app=m.app.initializeApp(cfg.firebase);let appCheck=null,acInfo="বন্ধ";
    if(cfg.appCheckDebug){self.FIREBASE_APPCHECK_DEBUG_TOKEN=true;acInfo="debug provider"}
    if(cfg.appCheckDebug||!String(cfg.recaptchaEnterpriseSiteKey).startsWith("PASTE")){
      try{appCheck=m.ac.initializeAppCheck(app,{provider:new m.ac.ReCaptchaEnterpriseProvider(cfg.recaptchaEnterpriseSiteKey),isTokenAutoRefreshEnabled:true});if(!cfg.appCheckDebug)acInfo="reCAPTCHA Enterprise"}catch(e){acInfo="ত্রুটি: "+e.message}}
    return {m,app,appCheck,acInfo,auth:m.auth.getAuth(app),db:m.fs.getFirestore(app),ai:m.ai.getAI(app,{backend:new m.ai.GoogleAIBackend(),useLimitedUseAppCheckTokens:true})};
  })().catch(e=>{P=null;throw e});
}
export function friendly(e){ // map errors to short Bangla messages (AI/quota/AppCheck/offline)
  const s=String(e?.code||"")+" "+String(e?.message||e);
  if(/permission-denied/i.test(s))return "অনুমতি নেই (নিয়ম আটকাল)";
  if(/429|quota|RESOURCE_EXHAUSTED|rate/i.test(s))return "আজকের/এই মিনিটের সীমা শেষ — কিছুক্ষণ পরে চেষ্টা করুন";
  if(/app.?check|appcheck|403/i.test(s))return "App Check যাচাই হয়নি (সাইট-কী/ডোমেন/টোকেন দেখুন)";
  if(/timeout/i.test(s))return "সময় শেষ (টাইমআউট)";
  if(/offline|network|fetch/i.test(s))return "ইন্টারনেট/নেটওয়ার্ক সমস্যা";
  if(/not.?found|404|model/i.test(s))return "মডেল পাওয়া যায়নি/অনুমোদিত নয় — মডেলের নাম বদলে দেখুন";
  return "ত্রুটি: "+String(e?.message||e).slice(0,160);
}
export const withTimeout=(p,ms=25000)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(Object.assign(new Error("timeout"),{code:"timeout"})),ms))]);
export const needCfg=el=>{el.innerHTML=`<h1>Firebase লাগবে</h1><div class="card"><span class="chip warn">কনফিগ বসানো হয়নি</span><p>এই পরীক্ষার জন্য আপনার Firebase প্রজেক্টের ওয়েব-কনফিগ <code>js/firebase-config.js</code>-এ বসাতে হবে। ধাপ: <code>GUIDE_B_বাংলা.md</code>।</p></div>`};
