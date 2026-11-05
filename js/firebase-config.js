// ====== আপনাকে বসাতে হবে (Firebase Console → Project settings → Your apps → Web app → Config) ======
// এগুলো পাবলিক শনাক্তকারী, গোপন চাবি নয় (01 B1)। পাসওয়ার্ড/সার্ভিস-অ্যাকাউন্ট কী এখানে কখনো নয়।
export default {
  firebase: { apiKey:"PASTE_API_KEY", authDomain:"PASTE_PROJECT.firebaseapp.com", projectId:"PASTE_PROJECT_ID", appId:"PASTE_APP_ID" },
  sdkVersion: "12.14.0",              // limited-use token (replay protection) এর জন্য ≥ 12.14.0 (ডক)
  recaptchaEnterpriseSiteKey: "PASTE_RECAPTCHA_ENTERPRISE_SITE_KEY", // App Check → Apps → reCAPTCHA Enterprise
  appCheckDebug: false,               // true করলে debug provider; কনসোলে টোকেন নথিভুক্ত না করলে কাজ করবে না
  ownerUid: "PASTE_YOUR_UID_AFTER_FIRST_SIGNIN", // প্রথম সাইন-ইনের পর "সাইন-ইন" পাতায় দেখানো UID
  model: "gemini-flash-latest",       // অনুমান — মডেলের নাম বানানোর দিনে যাচাই (01 C2); পাতায় বদলানো যায়
};
