// ─────────────────────────────────────────────────────────────
// js/signup.js — หน้าสมัครสมาชิก (signup.html)
// ─────────────────────────────────────────────────────────────

(function () {
  var ฟอร์ม = document.getElementById("ฟอร์มสมัครสมาชิก");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");
  var ปุ่ม = document.getElementById("ปุ่มสมัครสมาชิก");

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

    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;

    if (!name || !email || !password) {
      แสดงเตือน("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    ปุ่ม.disabled = true;
    ปุ่ม.textContent = "กำลังสมัครสมาชิก…";

    window.signUp(name, email, password).catch(function (err) {
      แสดงเตือน(err.message);
      ปุ่ม.disabled = false;
      ปุ่ม.textContent = "สมัครสมาชิก";
    });
  });
})();
