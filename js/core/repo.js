// Local-first record layer (docs/03 "Repository layer"): get/list/put/delete/watch per collection.
// Cloud sync later plugs into core/sync-adapter.js; nothing here talks to a network.
import {openDb} from "../idb.js";
const run=async(store,mode,fn)=>{const db=await openDb();return new Promise((res,rej)=>{const t=db.transaction(store,mode);let out;try{out=fn(t.objectStore(store))}catch(e){rej(e);return}t.oncomplete=()=>res(out&&"result"in out?out.result:out);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error||new Error("tx aborted"))})};
const bc=typeof BroadcastChannel!=="undefined"?new BroadcastChannel("amin-repo"):null;const subs={};
const notify=c=>{(subs[c]||[]).forEach(f=>f());bc?.postMessage(c)};bc&&(bc.onmessage=e=>(subs[e.data]||[]).forEach(f=>f()));
export function repo(coll,{tier="A"}={}){
  if(tier==="C")throw new Error("স্তর-গ (স্বাস্থ্য/টাকা/খাতা) এখনো চালু নয় — আলাদা পিন ও এনক্রিপশন (Stage 0b-পিন) ছাড়া সংরক্ষণ নিষিদ্ধ");
  const key=id=>coll+":"+id;
  return {
    async put(o){const now=Date.now();o={...o};o.id??=crypto.randomUUID();o.updatedAt=now;o.createdAt??=now;await run("records","readwrite",s=>s.put({key:key(o.id),coll,tier,deleted:false,updatedAt:now,data:o}));notify(coll);return o},
    async get(id){const r=await run("records","readonly",s=>s.get(key(id)));return r&&!r.deleted?r.data:null},
    async list({limit=30,before=Infinity}={}){const all=await run("records","readonly",s=>s.index("coll").getAll(coll));return all.filter(r=>!r.deleted&&r.updatedAt<before).sort((a,b)=>b.updatedAt-a.updatedAt).slice(0,limit).map(r=>r.data)},
    async count(){const all=await run("records","readonly",s=>s.index("coll").getAll(coll));return all.filter(r=>!r.deleted).length},
    async delete(id){const r=await run("records","readonly",s=>s.get(key(id)));if(!r)return;await run("records","readwrite",s=>s.put({...r,deleted:true,data:{id},updatedAt:Date.now()}));notify(coll)}, // tombstone, kept for future sync
    watch(f){(subs[coll]??=[]).push(f);return()=>{subs[coll]=subs[coll].filter(x=>x!==f)}},
  };
}
export const rawAll=()=>run("records","readonly",s=>s.getAll());
export const rawPutMany=async rows=>{for(const r of rows)await run("records","readwrite",s=>s.put(r));};
export const rawClear=()=>run("records","readwrite",s=>s.clear());
