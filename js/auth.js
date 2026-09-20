// ─────────────────────────────────────────────────────────────
// js/auth.js — สมัครสมาชิก / เข้าสู่ระบบ / ออกจากระบบ + ยามเฝ้าหน้า (สัปดาห์ที่ 7)
//
// ต้องโหลดหลัง js/firebase-config.js เสมอ (ไฟล์นั้นตั้งค่า window.auth และ window.db)
// หน้าที่ "ต้องล็อกอินก่อน" ทุกหน้า ยกเว้น login.html และ signup.html จะถูกไฟล์นี้
// เด้งไปหน้า login.html อัตโนมัติถ้ายังไม่ได้ล็อกอิน
//
// สิ่งที่ไฟล์นี้เปิดให้หน้าอื่นเรียกใช้ (window.___):
//   signUp(name, email, password)  → Promise สมัครสมาชิก + สร้างไฟล์ users/{uid}
//   logIn(email, password)         → Promise เข้าสู่ระบบ
//   logOut()                       → Promise ออกจากระบบ แล้วพาไปหน้า login.html
//   getCurrentUser()                → Promise คืนค่า { uid, name, email, role } หรือ null
//   onAuthReady(callback)           → เรียก callback(user) เมื่อรู้สถานะล็อกอินแน่นอนแล้ว
//   authReady                       → Promise แบบเดียวกับ onAuthReady แต่ใช้ .then() ได้ (ครั้งแรกครั้งเดียว)
// ─────────────────────────────────────────────────────────────

(function () {
  // หน้าที่เปิดได้โดยไม่ต้องล็อกอิน
  var หน้าที่ไม่ต้องล็อกอิน = ["login.html", "signup.html"];
  var หน้าปัจจุบัน = location.pathname.split("/").pop() || "index.html";

  var ตัวจัดการเมื่อพร้อม = [];
  var สถานะพร้อมแล้ว = false;
  var ผู้ใช้ล่าสุด = null;

  // ให้หน้าอื่น await/.then() รอจนกว่าจะรู้สถานะล็อกอินแน่นอนได้
  window.authReady = new Promise(function (resolve) {
    ตัวจัดการเมื่อพร้อม.push(resolve);
  });

  // ทางเลือกแบบ callback เผื่อไม่อยากใช้ Promise
  window.onAuthReady = function (callback) {
    if (สถานะพร้อมแล้ว) {
      callback(ผู้ใช้ล่าสุด);
    } else {
      ตัวจัดการเมื่อพร้อม.push(callback);
    }
  };

  function แจ้งทุกคนที่รอ() {
    var รายการ = ตัวจัดการเมื่อพร้อม;
    ตัวจัดการเมื่อพร้อม = [];
    สถานะพร้อมแล้ว = true;
    รายการ.forEach(function (fn) { fn(ผู้ใช้ล่าสุด); });
  }

  if (window.auth) {
    window.auth.onAuthStateChanged(function (user) {
      ผู้ใช้ล่าสุด = user;

      if (!user) {
        // ยังไม่ได้ล็อกอิน → หน้าที่ต้องล็อกอินก่อน ให้เด้งไปหน้า login.html
        if (หน้าที่ไม่ต้องล็อกอิน.indexOf(หน้าปัจจุบัน) === -1) {
          location.href = "login.html";
          return; // ไม่ต้องแจ้งใครที่รอ เพราะกำลังจะออกจากหน้านี้อยู่แล้ว
        }
      } else {
        // ล็อกอินอยู่แล้ว → ไม่ต้องเห็นหน้า login.html / signup.html อีก
        if (หน้าที่ไม่ต้องล็อกอิน.indexOf(หน้าปัจจุบัน) !== -1) {
          location.href = "index.html";
          return;
        }
        แสดงชื่อผู้ใช้บนแถบเมนู(user);
      }

      แจ้งทุกคนที่รอ();
    });
  } else {
    // ยังไม่ได้ตั้งค่า Firebase (js/firebase-config.js ยังเป็น placeholder)
    // ปล่อยผ่านไปก่อน ไม่บังคับล็อกอิน — หน้านั้น ๆ จะขึ้นแถบเตือน showConfigWarning ของตัวเองอยู่แล้ว
    แจ้งทุกคนที่รอ();
  }

  // เติมชื่อผู้ใช้ + ปุ่มออกจากระบบ ใน <span id="navUser"> ของแถบเมนู (js/nav.js)
  // ต้องรอ (poll) เพราะ nav.js อาจยังสร้าง element นี้ไม่เสร็จตอนที่ onAuthStateChanged ทำงาน
  function แสดงชื่อผู้ใช้บนแถบเมนู(user) {
    var ลองหาช่อง = function (จำนวนครั้งที่เหลือ) {
      var กล่อง = document.getElementById("navUser");
      if (!กล่อง) {
        if (จำนวนครั้งที่เหลือ > 0) setTimeout(function () { ลองหาช่อง(จำนวนครั้งที่เหลือ - 1); }, 50);
        return;
      }
      window.getCurrentUser().then(function (ข้อมูลผู้ใช้) {
        var ชื่อ = ข้อมูลผู้ใช้ && ข้อมูลผู้ใช้.name ? ข้อมูลผู้ใช้.name : user.email;
        var ชื่อปลอดภัย = typeof esc === "function" ? esc(ชื่อ) : String(ชื่อ);
        กล่อง.innerHTML = ชื่อปลอดภัย + ' · <a href="#" id="ปุ่มออกจากระบบ">ออกจากระบบ</a>';
        var ปุ่ม = document.getElementById("ปุ่มออกจากระบบ");
        if (ปุ่ม) {
          ปุ่ม.addEventListener("click", function (e) {
            e.preventDefault();
            window.logOut();
          });
        }
      });
    };
    ลองหาช่อง(40); // รอได้สูงสุดประมาณ 2 วินาที
  }

  // แปลรหัสข้อผิดพลาดของ Firebase Auth เป็นข้อความไทยที่คนอ่านเข้าใจ
  function แปลข้อผิดพลาด(err) {
    var รหัส = err && err.code;
    var ตาราง = {
      "auth/email-already-in-use": "อีเมลนี้ถูกใช้แล้ว",
      "auth/invalid-email": "รูปแบบอีเมลไม่ถูกต้อง",
      "auth/weak-password": "รหัสผ่านสั้นเกินไป ต้องมีอย่างน้อย 6 ตัวอักษร",
      "auth/missing-password": "กรุณากรอกรหัสผ่าน",
      "auth/user-not-found": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      "auth/wrong-password": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      "auth/invalid-credential": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      "auth/too-many-requests": "ลองผิดหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่"
    };
    var ข้อความ = ตาราง[รหัส] || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
    var ผลลัพธ์ = new Error(ข้อความ);
    ผลลัพธ์.code = รหัส;
    return ผลลัพธ์;
  }

  // ── สมัครสมาชิก ──────────────────────────────────────────
  // สร้างบัญชีใน Firebase Authentication แล้วสร้างไฟล์ users/{uid}
  // role เริ่มต้นเป็น "employee" เสมอตามสเปก แล้วพาไปหน้าแรก
  window.signUp = function (name, email, password) {
    if (!window.auth || !window.db) {
      return Promise.reject(new Error("ยังไม่ได้ตั้งค่า Firebase — ดูวิธีตั้งค่าในไฟล์ SETUP.md"));
    }
    return window.auth.createUserWithEmailAndPassword(email, password)
      .then(function (ผลลัพธ์) {
        return window.db.collection("users").doc(ผลลัพธ์.user.uid).set({
          name: name,
          email: email,
          role: "employee"
        });
      })
      .then(function () {
        location.href = "index.html";
      })
      .catch(function (err) {
        throw แปลข้อผิดพลาด(err);
      });
  };

  // ── เข้าสู่ระบบ ──────────────────────────────────────────
  window.logIn = function (email, password) {
    if (!window.auth) {
      return Promise.reject(new Error("ยังไม่ได้ตั้งค่า Firebase — ดูวิธีตั้งค่าในไฟล์ SETUP.md"));
    }
    return window.auth.signInWithEmailAndPassword(email, password)
      .then(function () {
        location.href = "index.html";
      })
      .catch(function (err) {
        throw แปลข้อผิดพลาด(err);
      });
  };

  // ── ออกจากระบบ ──────────────────────────────────────────
  window.logOut = function () {
    if (!window.auth) {
      location.href = "login.html";
      return Promise.resolve();
    }
    return window.auth.signOut().then(function () {
      location.href = "login.html";
    });
  };

  // ── ผู้ใช้ที่ล็อกอินอยู่ตอนนี้ ──────────────────────────
  // คืนค่า Promise ที่ resolve เป็น { uid, name, email, role } หรือ null ถ้ายังไม่ได้ล็อกอิน
  // (ฟังก์ชันนี้ชื่อและรูปแบบค่าที่คืนต้องคงที่ — โค้ด CRUD ของหน้าอื่นจะเรียกใช้ต่อ)
  window.getCurrentUser = function () {
    return window.authReady.then(function () {
      var user = window.auth ? window.auth.currentUser : null;
      if (!user) return null;
      return window.db.collection("users").doc(user.uid).get().then(function (เอกสาร) {
        var ข้อมูล = เอกสาร.exists ? เอกสาร.data() : {};
        return {
          uid: user.uid,
          name: ข้อมูล.name || user.email,
          email: ข้อมูล.email || user.email,
          role: ข้อมูล.role || "employee"
        };
      });
    });
  };
})();
