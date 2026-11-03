import json, math, statistics as st, datetime as dt
D=json.load(open("/home/claude/amin-proto/data/prayer-dhaka.json"))["rows"]
LAT,LON,TZ=23.8103,90.4125,6.0
def sun(doy):
    g=2*math.pi/365*(doy-1)
    eqt=229.18*(0.000075+0.001868*math.cos(g)-0.032077*math.sin(g)-0.014615*math.cos(2*g)-0.040849*math.sin(2*g))
    dec=0.006918-0.399912*math.cos(g)+0.070257*math.sin(g)-0.006758*math.cos(2*g)+0.000907*math.sin(2*g)-0.002697*math.cos(3*g)+0.00148*math.sin(3*g)
    return eqt,dec
def ha(angle,dec): # hour angle for sun altitude=-angle
    la=math.radians(LAT); a=math.radians(-angle)
    c=(math.sin(a)-math.sin(la)*math.sin(dec))/(math.cos(la)*math.cos(dec))
    return math.degrees(math.acos(max(-1,min(1,c))))*4  # minutes
def asr_ha(k,dec):
    la=math.radians(LAT); alt=math.atan(1/(k+math.tan(abs(la-dec))))
    c=(math.sin(alt)-math.sin(la)*math.sin(dec))/(math.cos(la)*math.cos(dec))
    return math.degrees(math.acos(c))*4
res={k:[] for k in["fajr","zuhr","asr1","asr2","maghrib","isha","sunrise"]}
rows=[]
for r in D:
    doy=dt.date(2025,r["m"],r["d"]).timetuple().tm_yday
    eqt,dec=sun(doy); noon=720-4*LON-eqt+TZ*60
    comp={"zuhr":noon,"sunrise":noon-ha(0.833,dec),"maghrib":noon+ha(0.833,dec),"fajr":noon-ha(18,dec),"isha":noon+ha(18,dec),"asr1":noon+asr_ha(1,dec),"asr2":noon+asr_ha(2,dec)}
    rows.append((r,comp))
def tab(r,k): return r["asr"] if k.startswith("asr") else r[k]
summary={}
for k in res:
    d=[tab(r,k)-c[k] for r,c in rows]; med=st.median(d)
    sd=st.pstdev(d); summary[k]=(med,sd)
    print(f"{k:8s} median(table-computed)={med:+.1f} min  sd={sd:.1f}")
# which asr fits better
print("Asr: best fit =", min(["asr1","asr2"],key=lambda k:summary[k][1]))
# outliers: residual vs median > 2.5 min, and second-difference jumps in the table
print("\nOUTLIERS vs computed (|res-median|>2.5):")
for r,c in rows:
    for k in ["fajr","zuhr","maghrib","isha","sunrise"]:
        e=tab(r,k)-c[k]-summary[k][0]
        if abs(e)>2.5: print(f"  {r['m']}/{r['d']} {k}: table={tab(r,k)//60}:{tab(r,k)%60:02d} off by {e:+.1f}")
print("\nSAHRI-FAJR gap (expect constant):",{g for g in [r['fajr']-r['sahri'] for r,_ in rows]})
for r,_ in rows:
    g=r['fajr']-r['sahri']
    if g!=6: print("  gap",g,"at",r['m'],r['d'])
print("\nSMOOTHNESS: |2nd difference|>=3 within anchors")
keys=["sahri","fajr","zuhr","asr","maghrib","isha","sunrise"]
for k in keys:
    s=[r[k] for r in D]
    for i in range(1,len(s)-1):
        dd=s[i-1]-2*s[i]+s[i+1]
        if abs(dd)>=3: print(f"  {k} at {D[i]['m']}/{D[i]['d']}: {s[i-1]},{s[i]},{s[i+1]} (2nd diff {dd})")
