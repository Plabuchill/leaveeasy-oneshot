// ─────────────────────────────────────────────────────────────
// js/firebase-config.js — ค่าตั้งค่าการเชื่อมต่อ Firebase ของโปรเจกต์นี้
//
// ⚠️ ค่าด้านล่างเป็น "ของปลอม" (placeholder) ต้องแทนที่ด้วยค่าจริงของคุณเอง
// ก่อนไฟล์อื่นในระบบจะอ่านข้อมูลจาก Firestore ได้
//
// วิธีหาค่าจริง (ทำตาม SETUP.md ขั้นที่ 1-3 ด้วย):
//   1. เปิด https://console.firebase.google.com
//   2. กด "สร้างโปรเจกต์" (Add project) ตั้งชื่ออะไรก็ได้ แล้วรอจนสร้างเสร็จ
//   3. ในเมนูซ้าย เปิด "Firestore Database" แล้วกด "สร้างฐานข้อมูล"
//      เลือกโหมด "ทดสอบ" (test mode) ไปก่อน
//   4. กลับไปหน้าโปรเจกต์ (กดรูปเฟือง ⚙️ → Project settings)
//      เลื่อนลงมาที่ "Your apps" แล้วกดไอคอน </> เพื่อ "เพิ่มเว็บแอป" (Add app)
//      ตั้งชื่อแอปอะไรก็ได้ แล้วกด "Register app"
//   5. หน้าจอจะโชว์ก้อนโค้ดที่มีตัวแปรชื่อ firebaseConfig หน้าตาเหมือนด้านล่างนี้
//      → คัดลอกค่าทั้งหมดมาวางแทนที่ก้อน placeholder ด้านล่าง
// ─────────────────────────────────────────────────────────────

window.firebaseConfig = {
  apiKey: "AIzaSyAwyKHSNZ9g0gxKnQjhknSujrK7PN5gCy8",
  authDomain: "leaveeasy-oneshot-390ee.firebaseapp.com",
  projectId: "leaveeasy-oneshot-390ee",
  storageBucket: "leaveeasy-oneshot-390ee.firebasestorage.app",
  messagingSenderId: "1026733586124",
  appId: "1:1026733586124:web:6613564f5617bb23253469"
};

// ตั้งค่า Firebase ให้ระบบใช้งานได้ · กันไว้ไม่ให้หน้าเว็บพังถ้ายังไม่ได้ใส่ค่าจริง
// ถ้ายังเป็นค่า placeholder อยู่ (หรือใส่ค่าผิด) window.db / window.auth จะเป็น null แทนที่จะทำให้หน้าเว็บ error
window.db = null;
window.auth = null; // สัปดาห์ที่ 7: ใช้ Firebase Authentication (ต้องโหลด firebase-auth-compat.js มาก่อนไฟล์นี้)
try {
  if (window.firebaseConfig.apiKey && window.firebaseConfig.apiKey !== "PASTE_YOUR_API_KEY_HERE") {
    firebase.initializeApp(window.firebaseConfig);
    window.db = firebase.firestore();
    window.auth = firebase.auth();
  }
} catch (err) {
  console.error("ตั้งค่า Firebase ไม่สำเร็จ:", err);
  window.db = null;
  window.auth = null;
}
