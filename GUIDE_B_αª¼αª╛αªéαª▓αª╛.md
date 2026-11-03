# (খ) অংশ — আপনার করণীয় (ChatGPT-র সঙ্গে ধাপে ধাপে; কোড লেখা লাগবে না)
**নিরাপত্তা:** পাসওয়ার্ড, টোকেন, সার্ভিস-অ্যাকাউন্ট ফাইল, App Check **debug token** কখনো চ্যাটে/রিপোতে নয়। শুধু Firebase-এর "ওয়েব-কনফিগ" (পাবলিক) `js/firebase-config.js`-এ বসবে।
**সময়সীমা:** ডক অনুযায়ী ২ নভেম্বর ২০২৬ থেকে Firebase AI Logic-এ App Check বাধ্যতামূলক (পিছানোর শেষ তারিখ ২১ জানুয়ারি ২০২৭)। তাই নতুন প্রজেক্টে শুরু থেকেই App Check দরকার।

1. **নতুন Firebase প্রজেক্ট** (VOA-র প্রজেক্ট নয়), Spark প্ল্যান, বিলিং-অ্যাকাউন্ট যুক্ত করবেন না।
2. Project settings → Your apps → **Web app** যোগ → `firebaseConfig`-এর ৪টি মান (`apiKey, authDomain, projectId, appId`) `js/firebase-config.js`-এ বসান।
3. **Authentication → Sign-in method → Google** চালু। **Settings → Authorized domains** → `amin356-bd.github.io` যোগ।
4. **Firestore Database** তৈরি (Production mode)। এখনো নিয়ম বদলাবেন না — আগে UID লাগবে (ধাপ ৭)।
5. **App Check:** Google Cloud Console-এ **reCAPTCHA Enterprise** ওয়েব-কী বানান (ডোমেন: `amin356-bd.github.io`) → কী-টি `recaptchaEnterpriseSiteKey`-এ। Firebase Console → App Check → Apps → আপনার ওয়েব অ্যাপ → reCAPTCHA Enterprise দিয়ে রেজিস্টার। `localhost` ডোমেন **যোগ করবেন না** (ডকের সতর্কতা)।
6. **AI Logic:** Firebase Console → Build → AI Logic → Get started → **Gemini Developer API**। App Check-এর "AI Logic" অংশে Enforce চালু (প্রজেক্টের ধরন অনুযায়ী নিজে থেকে চালু থাকতে পারে)।
7. নতুন সংস্করণ GitHub-এ তুলে ফোনে খুলুন → আরও → **খ-১** → "Google দিয়ে সাইন-ইন" → UID কপি → `firebase-config.js`-এর `ownerUid` ও `firestore.rules`-এর `OWNER_UID`-এ বসান → Firestore → Rules-এ `firestore.rules` পেস্ট → Publish। ফাইল আবার GitHub-এ তুলুন।
8. **খ-১** "নিয়ম-পরীক্ষা চালান" → সব সারি PASS হওয়ার কথা → "ফল কপি" → আমাকে দিন।
9. **দ্বিতীয় Google অ্যাকাউন্টে** (অন্য জিমেইল) সাইন-আউট → সাইন-ইন → আবার পরীক্ষা → সব সারি **deny/PASS** হওয়ার কথা।
10. **খ-২:** App Check টোকেন "পাওয়া গেছে" দেখাচ্ছে কি; বাংলা ও আরবি বোতাম; মডেল না চললে নাম বদলে (যেটা চলে সেটা লিখে রাখুন); সেকেন্ড ও টোকেন-সংখ্যা কপি।
11. **খ-৩:** বইয়ের ছোট পৃষ্ঠা-পরিসর (≤১৫ MB) একটি নতুন-ফন্টের ও একটি **পুরোনো-ফন্টের** PDF; ফল ✓/✗ দিন।
12. **খ-৪ রিমাইন্ডার:** অ্যাপ ইনস্টল → নোটিফিকেশন অনুমতি → প্রতিটি পদ্ধতি আলাদা সময়ে (৩ মিনিট) চালু → অ্যাপ বন্ধ, ফোন লক → ফল দেখুন। ব্যাটারি "Optimized" ও "Unrestricted" দুবার।

## ফোনে/কনসোলে দেখার জন্য ছোট চেকলিস্ট
- [ ] খ-১ নিজের UID পেলাম  - [ ] নিজের পথে লেখা/পড়া OK  - [ ] অন্য UID deny  - [ ] দ্বিতীয় অ্যাকাউন্টে সব deny
- [ ] খ-২ App Check টোকেন  - [ ] বাংলা AI-কল  - [ ] আরবি AI-কল  - [ ] সীমা পেরোলে ভদ্র বার্তা (সম্ভব হলে)
- [ ] খ-৩ নতুন-ফন্ট PDF  - [ ] পুরোনো-ফন্ট PDF  - [ ] ১৫ MB-এর বেশি ফাইল আটকাল  - [ ] সরকারি PDF-লিংক CORS
- [ ] খ-৪ প্রতিটি পদ্ধতির ফল (৫টি × ২ ব্যাটারি-অবস্থা)
