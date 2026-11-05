// Backup export/import (decision B6/B7): one file, optional passphrase (PBKDF2 → AES-GCM), integrity-checked, safe import.
import {openDb,allFonts,putFont,delFont} from "../idb.js";
import {rawAll,rawPutMany,rawClear} from "./repo.js";
export const LS_KEYS=["theme","fs","fontUI","fontRead","lite","district","ptconf","shareInbox","rem","aiCalls","lastBackupAt"];
export const FORMAT="amin-backup",VERSION=1,ITER=600000,MAX_BYTES=60*1024*1024;
const enc=new TextEncoder(),dec=new TextDecoder();
export const b64=u=>{let s="";const a=new Uint8Array(u);for(let i=0;i<a.length;i+=0x8000)s+=String.fromCharCode.apply(null,a.subarray(i,i+0x8000));return btoa(s)};
export const unb64=s=>{const b=atob(s),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a};
const sha=async b=>b64(await crypto.subtle.digest("SHA-256",b));
async function key(pass,salt,iter){const k=await crypto.subtle.importKey("raw",enc.encode(pass),"PBKDF2",false,["deriveKey"]);return crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:iter,hash:"SHA-256"},k,{name:"AES-GCM",length:256},false,["encrypt","decrypt"])}
export async function collect({fonts=false}={}){
  const ls={};for(const k of LS_KEYS){try{const v=localStorage.getItem(k);if(v!=null)ls[k]=v}catch{}}
  const records=await rawAll();let fontRows=[];
  if(fonts){const f=await allFonts();fontRows=f.map(x=>({name:x.name,type:x.type,b64:b64(x.buf)}))}
  return {meta:{app:"AMIN",createdAt:Date.now(),counts:{records:records.length,fonts:fontRows.length,settings:Object.keys(ls).length}},ls,records,fonts:fontRows};
}
export async function seal(payload,pass){
  const json=enc.encode(JSON.stringify(payload));
  if(!pass)return {format:FORMAT,v:VERSION,enc:false,sha256:await sha(json),payload};
  const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=await crypto.subtle.encrypt({name:"AES-GCM",iv},await key(pass,salt,ITER),json);
  return {format:FORMAT,v:VERSION,enc:true,kdf:{name:"PBKDF2",hash:"SHA-256",iter:ITER,salt:b64(salt)},iv:b64(iv),data:b64(ct)};
}
export class BackupError extends Error{constructor(code,msg){super(msg);this.code=code}}
export async function openFile(text,pass){
  if(text.length>MAX_BYTES)throw new BackupError("size","ফাইল খুব বড়");
  let f;try{f=JSON.parse(text)}catch{throw new BackupError("format","এটি AMIN ব্যাকআপ ফাইল নয় (পড়া যায়নি)")}
  if(!f||f.format!==FORMAT)throw new BackupError("format","এটি AMIN ব্যাকআপ ফাইল নয়");
  if(typeof f.v!=="number"||f.v>VERSION)throw new BackupError("version","ফাইলটি নতুন সংস্করণের — অ্যাপ আপডেট করুন");
  let payload;
  if(f.enc){
    if(!pass)throw new BackupError("need-pass","পাসফ্রেজ লাগবে");
    if(!f.kdf||f.kdf.iter>5e6||f.kdf.iter<1e5)throw new BackupError("format","ফাইলের এনক্রিপশন-তথ্য অগ্রহণযোগ্য");
    try{const pt=await crypto.subtle.decrypt({name:"AES-GCM",iv:unb64(f.iv)},await key(pass,unb64(f.kdf.salt),f.kdf.iter),unb64(f.data));payload=JSON.parse(dec.decode(pt))}
    catch{throw new BackupError("bad-pass","পাসফ্রেজ ভুল, অথবা ফাইল নষ্ট/বদলানো")}
  }else{
    if(f.sha256&&f.sha256!==await sha(enc.encode(JSON.stringify(f.payload))))throw new BackupError("corrupt","ফাইল নষ্ট বা বদলানো (চেকসাম মেলেনি)");
    payload=f.payload;
  }
  return validate(payload);
}
function validate(p){
  if(!p||typeof p!=="object"||!p.meta||p.meta.app!=="AMIN")throw new BackupError("format","ব্যাকআপের বিষয়বস্তু ঠিক নেই");
  const ls={};for(const [k,v] of Object.entries(p.ls||{}))if(LS_KEYS.includes(k)&&typeof v==="string"&&v.length<2e6)ls[k]=v;
  const records=(Array.isArray(p.records)?p.records:[]).filter(r=>r&&typeof r.key==="string"&&typeof r.coll==="string"&&r.key.startsWith(r.coll+":")&&r.tier!=="C"&&typeof r.updatedAt==="number"&&r.data&&typeof r.data==="object");
  const fonts=(Array.isArray(p.fonts)?p.fonts:[]).filter(x=>x&&typeof x.name==="string"&&x.name.length<80&&typeof x.b64==="string");
  return {meta:p.meta,ls,records,fonts};
}
export const summary=p=>({records:p.records.filter(r=>!r.deleted).length,fonts:p.fonts.length,settings:Object.keys(p.ls).length,createdAt:p.meta.createdAt});
// Safety: before ANY import, current state is saved into IDB "safety" so the import can be undone.
export async function safetySnapshot(){
  const snap=await collect({fonts:true});const db=await openDb();
  await new Promise((res,rej)=>{const t=db.transaction("safety","readwrite");t.objectStore("safety").put({k:"last",at:Date.now(),snap});t.oncomplete=res;t.onerror=()=>rej(t.error)});
}
export async function safetyInfo(){const db=await openDb();return new Promise(res=>{const r=db.transaction("safety").objectStore("safety").get("last");r.onsuccess=()=>res(r.result?{at:r.result.at,snap:r.result.snap}:null);r.onerror=()=>res(null)})}
async function replaceFonts(fonts){
  const current=await allFonts();
  for(const f of current)await delFont(f.name);
  for(const f of fonts)await putFont(f.name,unb64(f.b64).buffer,f.type||"");
}
export async function apply(p,{mode="merge"}={}){
  await safetySnapshot();
  if(mode==="replace"){
    await rawClear();
    for(const k of LS_KEYS)try{localStorage.removeItem(k)}catch{}
    await replaceFonts(p.fonts);
  }
  const cur=new Map((await rawAll()).map(r=>[r.key,r]));
  const take=p.records.filter(r=>{const c=cur.get(r.key);return !c||r.updatedAt>c.updatedAt});
  await rawPutMany(take);
  for(const [k,v] of Object.entries(p.ls)){try{if(mode==="replace"||localStorage.getItem(k)==null||k==="lastBackupAt")localStorage.setItem(k,v)}catch{}}
  if(mode!=="replace"){
    const have=new Set((await allFonts()).map(f=>f.name));
    for(const f of p.fonts)if(!have.has(f.name)){await putFont(f.name,unb64(f.b64).buffer,f.type||"");have.add(f.name)}
  }
  window.AMIN_applyFonts?.();
  return {recordsWritten:take.length,fonts:p.fonts.length};
}
export async function undoLast(){
  const s=await safetyInfo();
  if(!s)throw new BackupError("none","পূর্বাবস্থার কপি নেই");
  const p=validate(s.snap);
  await rawClear();
  for(const k of LS_KEYS)try{localStorage.removeItem(k)}catch{}
  await rawPutMany(p.records);
  for(const [k,v] of Object.entries(p.ls))try{localStorage.setItem(k,v)}catch{}
  await replaceFonts(p.fonts);
  window.AMIN_applyFonts?.();
  return summary(p);
}
