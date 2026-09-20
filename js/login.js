// ─────────────────────────────────────────────────────────────
// js/login.js — หน้าเข้าสู่ระบบ (login.html)
// ─────────────────────────────────────────────────────────────

(function () {
  var ฟอร์ม = document.getElementById("ฟอร์มล็อกอิน");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");
  var ปุ่ม = document.getElementById("ปุ่มเข้าสู่ระบบ");

  function แสดงเตือน(ข้อความ) {
    กล่องเตือน.textContent = ข้อความ;
    กล่องเตือน.classList.remove("hidden");
  }

  function ซ่อนเตือน() {
    กล่องเตือน.classList.add("hidden");
  }

  ฟอร์ม.addEventListener("submit", function (e) {
    e.preventDefault();
    ซ่อนเตือน();

    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;

    if (!email || !password) {
      แสดงเตือน("กรุณากรอกอีเมลและรหัสผ่านให้ครบ");
      return;
    }

    ปุ่ม.disabled = true;
    ปุ่ม.textContent = "กำลังเข้าสู่ระบบ…";

    window.logIn(email, password).catch(function (err) {
      แสดงเตือน(err.message);
      ปุ่ม.disabled = false;
      ปุ่ม.textContent = "เข้าสู่ระบบ";
    });
  });
})();
