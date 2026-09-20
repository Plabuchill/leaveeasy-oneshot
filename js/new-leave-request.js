// ─────────────────────────────────────────────────────────────
// js/new-leave-request.js — หน้าที่ 2 ยื่นใบลาใหม่
// สัปดาห์ที่ 7: บันทึกใบลาใหม่ลง Firestore จริง (ถ้าตั้งค่าไว้แล้ว)
// ถ้ายังไม่ได้ตั้งค่า Firebase หรืออ่านไม่สำเร็จ ใช้ข้อมูลปลอมใน js/data.js แทน (เหมือนเดิม)
// ─────────────────────────────────────────────────────────────

(function () {
  var ฟอร์ม = document.getElementById("ฟอร์มใบลา");
  var ช่องประเภท = document.getElementById("leaveTypeId");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");

  // เก็บชื่อประเภทคู่กับรหัสไว้ ไม่ว่าจะเติมตัวเลือกมาจาก Firestore หรือข้อมูลปลอม
  // เพื่อให้ตอนบันทึกใบลารู้ชื่อประเภทที่ต้องจดซ้ำ (leaveTypeName) โดยไม่ต้องอ่านซ้ำอีกครั้ง
  var ชื่อประเภทตามรหัส = {};

  function เติมตัวเลือกประเภท(รายการประเภท) {
    รายการประเภท.forEach(function (ประเภท) {
      ชื่อประเภทตามรหัส[ประเภท.id] = ประเภท.name;
      var ตัวเลือก = document.createElement("option");
      ตัวเลือก.value = ประเภท.id;
      ตัวเลือก.textContent = ประเภท.name;
      ช่องประเภท.appendChild(ตัวเลือก);
    });
  }

  // สัปดาห์ที่ 7: ต้องรอให้รู้สถานะล็อกอินแน่นอนก่อน (js/auth.js) ค่อยอ่าน Firestore
  // ไม่งั้นจะยิงคำขออ่านไปตอนที่ยังไม่ล็อกอิน แล้วโดน Security Rules ปฏิเสธ (permission-denied)
  var เริ่มเติมตัวเลือก = function () {
    if (window.db) {
      // มีการตั้งค่า Firebase แล้ว → อ่านประเภทการลาจากโฟลเดอร์ leaveTypes จริง
      // (ทำให้ประเภทที่เพิ่งเพิ่มในหน้าจัดการประเภทการลาโผล่ที่นี่ทันที ตาม US-06)
      window.db.collection("leaveTypes").get().then(function (snapshot) {
        var รายการจากฐานจริง = snapshot.docs.map(function (เอกสาร) {
          var ข้อมูล = เอกสาร.data();
          ข้อมูล.id = เอกสาร.id;
          return ข้อมูล;
        });
        เติมตัวเลือกประเภท(รายการจากฐานจริง);
      }).catch(function (err) {
        console.error("อ่านประเภทการลาจาก Firestore ไม่สำเร็จ:", err);
        showConfigWarning("เชื่อมต่อฐานข้อมูลจริงไม่สำเร็จ จึงแสดงข้อมูลตัวอย่างแทน");
        เติมตัวเลือกประเภท(window.LEAVE_DATA.leaveTypes);
      });
    } else {
      // ยังไม่ได้ตั้งค่า Firebase (js/firebase-config.js ยังเป็น placeholder) → ใช้ข้อมูลปลอม
      showConfigWarning();
      เติมตัวเลือกประเภท(window.LEAVE_DATA.leaveTypes);
    }
  };

  if (window.onAuthReady) {
    window.onAuthReady(เริ่มเติมตัวเลือก);
  } else {
    // เผื่อกรณีไม่ได้โหลด js/auth.js มาก่อนไฟล์นี้ ก็ยังใช้งานได้เหมือนเดิม
    เริ่มเติมตัวเลือก();
  }

  ฟอร์ม.addEventListener("submit", function (e) {
    e.preventDefault();

    var ค่า = {
      title: document.getElementById("title").value.trim(),
      reason: document.getElementById("reason").value.trim(),
      leaveTypeId: ช่องประเภท.value,
      startDate: document.getElementById("startDate").value,
      endDate: document.getElementById("endDate").value
    };

    // ตรวจว่ากรอกครบก่อนบันทึก
    if (!ค่า.title || !ค่า.reason || !ค่า.leaveTypeId || !ค่า.startDate || !ค่า.endDate) {
      เตือน("กรอกไม่ครบ — ต้องกรอกทุกช่องก่อนกดบันทึก");
      return;
    }
    if (ค่า.endDate < ค่า.startDate) {
      เตือน("วันที่สิ้นสุดต้องไม่มาก่อนวันที่เริ่มลา");
      return;
    }

    var ชื่อประเภท = ชื่อประเภทตามรหัส[ค่า.leaveTypeId] || "";

    if (window.db) {
      var บันทึกลงฐานจริง = function () {
        window.getCurrentUser().then(function (ผู้ใช้) {
          return window.db.collection("leaveRequests").add({
            title: ค่า.title,
            reason: ค่า.reason,
            status: "รอพิจารณา",                       // ใบใหม่เริ่มที่ รอพิจารณา เสมอ
            requesterId: ผู้ใช้ ? ผู้ใช้.uid : "",
            requesterName: ผู้ใช้ ? ผู้ใช้.name : "",
            approverId: "",      approverName: "",      // ยังไม่มีหน้าจอกำหนดผู้อนุมัติในเดือนนี้ จึงปล่อยว่างไว้
            leaveTypeId: ค่า.leaveTypeId, leaveTypeName: ชื่อประเภท,
            startDate: ค่า.startDate,
            endDate: ค่า.endDate,
            createdAt: เวลาตอนนี้()
          });
        }).then(function () {
          location.href = "leave-requests.html";
        }).catch(function (err) {
          console.error("บันทึกใบลาไม่สำเร็จ:", err);
          เตือน("บันทึกใบลาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        });
      };

      if (window.onAuthReady) {
        window.onAuthReady(บันทึกลงฐานจริง);
      } else {
        บันทึกลงฐานจริง();
      }
    } else {
      // ยังไม่ได้ตั้งค่า Firebase → เก็บไว้ใน sessionStorage เหมือนเดิม (สมมติว่าผู้ขอลาคือ สมชาย ใจดี)
      var ใบใหม่ = {
        id: "lr-ใหม่-" + Date.now(),
        title: ค่า.title,
        reason: ค่า.reason,
        status: "รอพิจารณา",
        requesterId: "u001", requesterName: "สมชาย ใจดี",
        approverId: "",      approverName: "",
        leaveTypeId: ค่า.leaveTypeId, leaveTypeName: ชื่อประเภท,
        startDate: ค่า.startDate,
        endDate: ค่า.endDate,
        createdAt: เวลาตอนนี้()
      };

      var รายการ = JSON.parse(sessionStorage.getItem("ใบลาที่ยื่นใหม่") || "[]");
      รายการ.push(ใบใหม่);
      sessionStorage.setItem("ใบลาที่ยื่นใหม่", JSON.stringify(รายการ));

      location.href = "leave-requests.html";
    }
  });

  function เตือน(ข้อความ) {
    กล่องเตือน.textContent = "⚠️ " + ข้อความ;
    กล่องเตือน.classList.remove("hidden");
  }
})();
