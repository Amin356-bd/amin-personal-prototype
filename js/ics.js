const pad=n=>String(n).padStart(2,"0");
export const utc=d=>`${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
const esc=s=>String(s).replace(/\\/g,"\\\\").replace(/;/g,"\;").replace(/,/g,"\\,").replace(/\n/g,"\\n");
const enc=new TextEncoder();
// RFC 5545 §3.1: physical lines ≤75 octets (UTF-8), continuation lines start with one space
export function fold(line){const out=[];let cur="",len=0;for(const ch of line){const b=enc.encode(ch).length;if(len+b>(out.length?74:75)){out.push(cur);cur="";len=0}cur+=ch;len+=b}out.push(cur);return out.join("\r\n ")}
// RFC 5545: CRLF line ends, DTSTAMP+UID required, VALARM ACTION:DISPLAY needs DESCRIPTION + TRIGGER
export function makeIcs(events,now=new Date()){
  const L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//AMIN proto//BN","CALSCALE:GREGORIAN"];
  events.forEach((e,i)=>{const end=new Date(e.start.getTime()+10*60000);
    L.push("BEGIN:VEVENT",`UID:amin-proto-${e.id||i}-${e.start.getTime()}@amin356-bd`,`DTSTAMP:${utc(now)}`,`DTSTART:${utc(e.start)}`,`DTEND:${utc(end)}`,`SUMMARY:${esc(e.title)}`,
      "BEGIN:VALARM","ACTION:DISPLAY",`DESCRIPTION:${esc(e.title)}`,`TRIGGER:-PT${e.alarmBeforeMin||0}M`,"END:VALARM","END:VEVENT")});
  L.push("END:VCALENDAR");return L.map(fold).join("\r\n")+"\r\n";
}
// Android Chrome intent: opens the phone's clock app's "set alarm" screen (SKIP_UI=false so user confirms)
export function alarmIntent(h,m,msg){return `intent:#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR=${h};i.android.intent.extra.alarm.MINUTES=${m};S.android.intent.extra.alarm.MESSAGE=${encodeURIComponent(msg)};B.android.intent.extra.alarm.SKIP_UI=false;end`}
