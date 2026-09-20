// ─────────────────────────────────────────────────────────────
// js/leave-requests.js — หน้าที่ 1 รายการใบลา
// สัปดาห์ที่ 6: อ่านจาก Firestore จริง (ถ้าตั้งค่าไว้แล้ว)
// ถ้ายังไม่ได้ตั้งค่า Firebase หรืออ่านไม่สำเร็จ ใช้ข้อมูลปลอมใน js/data.js แทน
// ─────────────────────────────────────────────────────────────

(function () {
  var กล่อง = document.getElementById("ผลลัพธ์");

  // ใบลาที่เพิ่งยื่นในหน้าถัดไประหว่างที่ยังไม่ต่อการสร้างใบลาจริง (มาสัปดาห์ที่ 7)
  // เก็บไว้ใน sessionStorage เท่านั้น จึงหายเมื่อปิดเบราว์เซอร์
  var ใบลาที่ยื่นใหม่ = JSON.parse(sessionStorage.getItem("ใบลาที่ยื่นใหม่") || "[]");

  // ถ้ามีสถานะติดมาท้าย URL ให้กรองเฉพาะสถานะนั้น
  var สถานะที่กรอง = ค่าจากURL("status");
  if (สถานะที่กรอง) {
    document.querySelector(".subtitle").textContent =
      "กำลังแสดงเฉพาะใบลาที่สถานะ " + สถานะที่กรอง + " · กดเมนู รายการใบลา เพื่อดูทั้งหมด";
  }

  // สัปดาห์ที่ 7: ต้องรอให้รู้สถานะล็อกอินแน่นอนก่อน (js/auth.js) ค่อยอ่าน Firestore
  // ไม่งั้นจะยิงคำขออ่านไปตอนที่ยังไม่ล็อกอิน แล้วโดน Security Rules ปฏิเสธ (permission-denied)
  // ก่อนที่ยามเฝ้าหน้าจะเด้งไปหน้า login.html ทัน
  var เริ่มอ่านข้อมูล = function () {
    if (window.db) {
      // มีการตั้งค่า Firebase แล้ว → อ่านใบลาทั้งหมดจากโฟลเดอร์ leaveRequests จริง
      window.db.collection("leaveRequests").get().then(function (snapshot) {
        var ใบลาจากฐานจริง = snapshot.docs.map(function (เอกสาร) {
          var ข้อมูล = เอกสาร.data();
          ข้อมูล.id = เอกสาร.id;
          return ข้อมูล;
        });
        เตรียมและแสดง(ใบลาจากฐานจริง.concat(ใบลาที่ยื่นใหม่));
      }).catch(function (err) {
        console.error("อ่านข้อมูลจาก Firestore ไม่สำเร็จ:", err);
        showConfigWarning("เชื่อมต่อฐานข้อมูลจริงไม่สำเร็จ จึงแสดงข้อมูลตัวอย่างแทน");
        เตรียมและแสดง(window.LEAVE_DATA.leaveRequests.concat(ใบลาที่ยื่นใหม่));
      });
    } else {
      // ยังไม่ได้ตั้งค่า Firebase (js/firebase-config.js ยังเป็น placeholder) → ใช้ข้อมูลปลอม
      showConfigWarning();
      เตรียมและแสดง(window.LEAVE_DATA.leaveRequests.concat(ใบลาที่ยื่นใหม่));
    }
  };

  if (window.onAuthReady) {
    window.onAuthReady(เริ่มอ่านข้อมูล);
  } else {
    // เผื่อกรณีไม่ได้โหลด js/auth.js มาก่อนไฟล์นี้ ก็ยังใช้งานได้เหมือนเดิม
    เริ่มอ่านข้อมูล();
  }

  function เตรียมและแสดง(ใบลาทั้งหมด) {
    if (สถานะที่กรอง) {
      ใบลาทั้งหมด = ใบลาทั้งหมด.filter(function (ใบ) { return ใบ.status === สถานะที่กรอง; });
    }
    แสดงตาราง(ใบลาทั้งหมด);
  }

  function แสดงตาราง(รายการ) {
    if (รายการ.length === 0) {
      กล่อง.innerHTML = "<p>ยังไม่มีใบขอลาในระบบ</p>";
      return;
    }

    var html =
      "<table><thead><tr>" +
      "<th>หัวข้อ</th>" +
      "<th>ประเภทการลา</th>" +
      "<th>สถานะ</th>" +
      '<th class="hide-mobile">ผู้ขอลา</th>' +
      '<th class="hide-mobile">วันที่ลา</th>' +
      "</tr></thead><tbody>";

    รายการ.forEach(function (ใบ) {
      html +=
        '<tr class="clickable" data-id="' + esc(ใบ.id) + '">' +
        "<td>" + esc(ใบ.title) + "</td>" +
        "<td>" + esc(ใบ.leaveTypeName) + "</td>" +
        "<td>" + ป้ายสถานะ(ใบ.status) + "</td>" +
        '<td class="hide-mobile">' + esc(ใบ.requesterName) + "</td>" +
        '<td class="hide-mobile">' + esc(ใบ.startDate) + " ถึง " + esc(ใบ.endDate) + "</td>" +
        "</tr>";
    });

    html += "</tbody></table>";
    กล่อง.innerHTML = html;

    // กดที่แถวไหน ไปหน้ารายละเอียดของใบนั้น
    กล่อง.querySelectorAll("tr.clickable").forEach(function (แถว) {
      แถว.addEventListener("click", function () {
        location.href = "leave-request-detail.html?id=" + แถว.dataset.id;
      });
    });
  }
})();
