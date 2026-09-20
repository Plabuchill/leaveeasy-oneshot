// ─────────────────────────────────────────────────────────────
// js/leave-types.js — หน้าที่ 4 จัดการประเภทการลา
// สัปดาห์ที่ 7: เพิ่ม/แก้/ลบ ประเภทการลาจริงใน Firestore (ถ้าตั้งค่าไว้แล้ว)
// ถ้ายังไม่ได้ตั้งค่า Firebase หรืออ่านไม่สำเร็จ ใช้ข้อมูลปลอมใน js/data.js แทน (เหมือนเดิม)
// ─────────────────────────────────────────────────────────────

(function () {
  var รายการ = [];   // เติมค่าจาก Firestore หรือข้อมูลปลอม หลังรู้สถานะล็อกอินแน่นอนแล้ว
  var ที่วางตาราง = document.getElementById("ตารางประเภท");
  var ช่องชื่อใหม่ = document.getElementById("ชื่อประเภทใหม่");
  var กล่องเตือน = document.getElementById("เตือนประเภท");

  // สัปดาห์ที่ 7: ต้องรอให้รู้สถานะล็อกอินแน่นอนก่อน (js/auth.js) ค่อยอ่าน Firestore
  // ไม่งั้นจะยิงคำขออ่านไปตอนที่ยังไม่ล็อกอิน แล้วโดน Security Rules ปฏิเสธ (permission-denied)
  var เริ่มอ่านข้อมูล = function () {
    if (window.db) {
      // มีการตั้งค่า Firebase แล้ว → อ่านประเภทการลาทั้งหมดจากโฟลเดอร์ leaveTypes จริง
      window.db.collection("leaveTypes").get().then(function (snapshot) {
        รายการ = snapshot.docs.map(function (เอกสาร) {
          var ข้อมูล = เอกสาร.data();
          ข้อมูล.id = เอกสาร.id;
          return ข้อมูล;
        });
        วาดตาราง();
      }).catch(function (err) {
        console.error("อ่านประเภทการลาจาก Firestore ไม่สำเร็จ:", err);
        showConfigWarning("เชื่อมต่อฐานข้อมูลจริงไม่สำเร็จ จึงแสดงข้อมูลตัวอย่างแทน");
        รายการ = window.LEAVE_DATA.leaveTypes.slice();
        วาดตาราง();
      });
    } else {
      // ยังไม่ได้ตั้งค่า Firebase (js/firebase-config.js ยังเป็น placeholder) → ใช้ข้อมูลปลอม
      showConfigWarning();
      รายการ = window.LEAVE_DATA.leaveTypes.slice();   // ทำสำเนาไว้แก้
      วาดตาราง();
    }
  };

  if (window.onAuthReady) {
    window.onAuthReady(เริ่มอ่านข้อมูล);
  } else {
    // เผื่อกรณีไม่ได้โหลด js/auth.js มาก่อนไฟล์นี้ ก็ยังใช้งานได้เหมือนเดิม
    เริ่มอ่านข้อมูล();
  }

  document.getElementById("ปุ่มเพิ่ม").addEventListener("click", เพิ่มประเภท);

  function วาดตาราง() {
    if (รายการ.length === 0) {
      ที่วางตาราง.innerHTML = "<p>ยังไม่มีประเภทการลาในระบบ</p>";
      return;
    }

    var html = "<table><thead><tr><th>ชื่อประเภทการลา</th><th>จัดการ</th></tr></thead><tbody>";
    รายการ.forEach(function (ประเภท) {
      html +=
        "<tr><td>" + esc(ประเภท.name) + "</td><td>" +
        '<button type="button" class="btn-ghost" data-edit="' + esc(ประเภท.id) + '">แก้ไข</button> ' +
        '<button type="button" class="btn-danger" data-del="' + esc(ประเภท.id) + '">ลบ</button>' +
        "</td></tr>";
    });
    html += "</tbody></table>";
    ที่วางตาราง.innerHTML = html;

    ที่วางตาราง.querySelectorAll("[data-edit]").forEach(function (ปุ่ม) {
      ปุ่ม.addEventListener("click", function () { แก้ประเภท(ปุ่ม.dataset.edit); });
    });
    ที่วางตาราง.querySelectorAll("[data-del]").forEach(function (ปุ่ม) {
      ปุ่ม.addEventListener("click", function () { ลบประเภท(ปุ่ม.dataset.del); });
    });
  }

  function เพิ่มประเภท() {
    var ชื่อ = ช่องชื่อใหม่.value.trim();
    if (!ชื่อ) {
      กล่องเตือน.textContent = "⚠️ พิมพ์ชื่อประเภทการลาก่อน จึงจะเพิ่มได้";
      กล่องเตือน.classList.remove("hidden");
      return;
    }
    กล่องเตือน.classList.add("hidden");

    if (window.db) {
      window.db.collection("leaveTypes").add({ name: ชื่อ }).then(function (เอกสารใหม่) {
        รายการ.push({ id: เอกสารใหม่.id, name: ชื่อ });
        ช่องชื่อใหม่.value = "";
        วาดตาราง();
      }).catch(function (err) {
        console.error("เพิ่มประเภทการลาไม่สำเร็จ:", err);
        alert("เพิ่มประเภทการลาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      });
    } else {
      รายการ.push({ id: "lt-ใหม่-" + Date.now(), name: ชื่อ });
      ช่องชื่อใหม่.value = "";
      วาดตาราง();
    }
  }

  function แก้ประเภท(id) {
    var ประเภท = รายการ.find(function (t) { return t.id === id; });
    var ชื่อใหม่ = prompt("แก้ชื่อประเภทการลา", ประเภท.name);
    if (ชื่อใหม่ === null) return;              // กดยกเลิก
    if (!ชื่อใหม่.trim()) { alert("ชื่อประเภทการลาว่างเปล่าไม่ได้"); return; }
    ชื่อใหม่ = ชื่อใหม่.trim();

    if (window.db) {
      window.db.collection("leaveTypes").doc(id).update({ name: ชื่อใหม่ }).then(function () {
        ประเภท.name = ชื่อใหม่;
        วาดตาราง();
      }).catch(function (err) {
        console.error("แก้ประเภทการลาไม่สำเร็จ:", err);
        alert("แก้ประเภทการลาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      });
    } else {
      ประเภท.name = ชื่อใหม่;
      วาดตาราง();
    }
  }

  function ลบประเภท(id) {
    var ประเภท = รายการ.find(function (t) { return t.id === id; });
    if (!confirm('ยืนยันการลบประเภท "' + ประเภท.name + '" หรือไม่')) return;

    if (window.db) {
      window.db.collection("leaveTypes").doc(id).delete().then(function () {
        รายการ = รายการ.filter(function (t) { return t.id !== id; });
        วาดตาราง();
      }).catch(function (err) {
        console.error("ลบประเภทการลาไม่สำเร็จ:", err);
        alert("ลบประเภทการลาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      });
    } else {
      รายการ = รายการ.filter(function (t) { return t.id !== id; });
      วาดตาราง();
    }
  }
})();
