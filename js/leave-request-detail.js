// ─────────────────────────────────────────────────────────────
// js/leave-request-detail.js — หน้าที่ 3 รายละเอียดใบลา
// สัปดาห์ที่ 7: อ่าน/เปลี่ยนสถานะ/เขียนความเห็น/ลบ ใบลาจริงจาก Firestore (ถ้าตั้งค่าไว้แล้ว)
// ถ้ายังไม่ได้ตั้งค่า Firebase หรืออ่านไม่สำเร็จ ใช้ข้อมูลปลอมใน js/data.js แทน (เหมือนเดิม)
// ─────────────────────────────────────────────────────────────

(function () {
  var รหัสใบลา = ค่าจากURL("id");
  var กล่องใบลา = document.getElementById("กล่องใบลา");
  var กล่องความเห็น = document.getElementById("กล่องความเห็น");

  var ใบ = null;
  var ความเห็น = [];

  // สัปดาห์ที่ 7: ต้องรอให้รู้สถานะล็อกอินแน่นอนก่อน (js/auth.js) ค่อยอ่าน Firestore
  // ไม่งั้นจะยิงคำขออ่านไปตอนที่ยังไม่ล็อกอิน แล้วโดน Security Rules ปฏิเสธ (permission-denied)
  var เริ่มอ่านข้อมูล = function () {
    if (window.db) {
      // มีการตั้งค่า Firebase แล้ว → อ่านใบลานี้ + ความเห็นในโฟลเดอร์ย่อย approvals จากฐานจริง
      window.db.collection("leaveRequests").doc(รหัสใบลา).get().then(function (เอกสาร) {
        if (!เอกสาร.exists) {
          แสดงไม่พบใบลา();
          return null;
        }
        ใบ = เอกสาร.data();
        ใบ.id = เอกสาร.id;
        return window.db.collection("leaveRequests").doc(รหัสใบลา).collection("approvals").get();
      }).then(function (snapshot) {
        if (!snapshot) return; // ไม่พบใบลา ออกไปก่อนหน้านี้แล้ว
        ความเห็น = snapshot.docs.map(function (เอกสาร) {
          var ข้อมูล = เอกสาร.data();
          ข้อมูล.id = เอกสาร.id;
          return ข้อมูล;
        });
        แสดงผล();
      }).catch(function (err) {
        console.error("อ่านข้อมูลจาก Firestore ไม่สำเร็จ:", err);
        showConfigWarning("เชื่อมต่อฐานข้อมูลจริงไม่สำเร็จ จึงแสดงข้อมูลตัวอย่างแทน");
        อ่านจากข้อมูลปลอม();
      });
    } else {
      // ยังไม่ได้ตั้งค่า Firebase (js/firebase-config.js ยังเป็น placeholder) → ใช้ข้อมูลปลอม
      showConfigWarning();
      อ่านจากข้อมูลปลอม();
    }
  };

  if (window.onAuthReady) {
    window.onAuthReady(เริ่มอ่านข้อมูล);
  } else {
    // เผื่อกรณีไม่ได้โหลด js/auth.js มาก่อนไฟล์นี้ ก็ยังใช้งานได้เหมือนเดิม
    เริ่มอ่านข้อมูล();
  }

  // หาใบลาจากข้อมูลปลอม บวกกับใบที่เพิ่งยื่นในหน้าที่ 2 (เหมือนพฤติกรรมเดิมทุกประการ)
  function อ่านจากข้อมูลปลอม() {
    var ใบลาที่ยื่นใหม่ = JSON.parse(sessionStorage.getItem("ใบลาที่ยื่นใหม่") || "[]");
    ใบ = window.LEAVE_DATA.leaveRequests.concat(ใบลาที่ยื่นใหม่)
      .find(function (x) { return x.id === รหัสใบลา; });

    if (!ใบ) {
      แสดงไม่พบใบลา();
      return;
    }

    ความเห็น = window.LEAVE_DATA.approvals.filter(function (c) { return c.requestId === ใบ.id; });
    แสดงผล();
  }

  function แสดงไม่พบใบลา() {
    กล่องใบลา.innerHTML = "<p>ไม่พบใบขอลาที่ต้องการ — อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>";
  }

  function แสดงผล() {
    วาดใบลา();
    วาดความเห็น();
    กล่องความเห็น.classList.remove("hidden");
    document.getElementById("ปุ่มส่งความเห็น").addEventListener("click", ส่งความเห็น);
  }

  // ── วาดข้อมูลใบลาลงหน้าจอ ──
  function วาดใบลา() {
    var แถว = [
      ["หัวข้อ", esc(ใบ.title)],
      ["เหตุผลการลา", esc(ใบ.reason)],
      ["ประเภทการลา", esc(ใบ.leaveTypeName)],
      ["วันที่ลา", esc(ใบ.startDate) + " ถึง " + esc(ใบ.endDate)],
      ["ผู้ขอลา", esc(ใบ.requesterName)],
      ["ผู้อนุมัติ", ใบ.approverName ? esc(ใบ.approverName) : "ยังไม่ได้กำหนดผู้อนุมัติ"],
      ["สถานะ", ป้ายสถานะ(ใบ.status)],
      ["วันที่ยื่น", esc(ใบ.createdAt)]
    ];

    var html = แถว.map(function (r) {
      return '<div class="field-row"><span class="k">' + r[0] + "</span><span>" + r[1] + "</span></div>";
    }).join("");

    // ปุ่มอนุมัติ / ไม่อนุมัติ / ลบ ขึ้นเฉพาะใบที่ยังรอพิจารณา (ตามหัวข้อ 6)
    if (ใบ.status === "รอพิจารณา") {
      html +=
        '<div class="btn-row">' +
        '<button type="button" class="btn-ok" id="ปุ่มอนุมัติ">อนุมัติ</button>' +
        '<button type="button" class="btn-danger" id="ปุ่มไม่อนุมัติ">ไม่อนุมัติ</button>' +
        '<button type="button" class="btn-ghost" id="ปุ่มลบ">ลบใบลานี้</button>' +
        "</div>";
    } else {
      html += '<p class="hint">ใบนี้พิจารณาแล้ว จึงเปลี่ยนสถานะต่อไม่ได้</p>';
    }

    กล่องใบลา.innerHTML = html;

    if (ใบ.status === "รอพิจารณา") {
      document.getElementById("ปุ่มอนุมัติ").addEventListener("click", function () { เปลี่ยนสถานะ("อนุมัติ"); });
      document.getElementById("ปุ่มไม่อนุมัติ").addEventListener("click", function () { เปลี่ยนสถานะ("ไม่อนุมัติ"); });
      document.getElementById("ปุ่มลบ").addEventListener("click", ลบใบลา);
    }
  }

  // ── เปลี่ยนสถานะ ──
  function เปลี่ยนสถานะ(สถานะใหม่) {
    // กฎ: จะไม่อนุมัติได้ ต้องมีความเห็นอย่างน้อย 1 รายการก่อน
    if (สถานะใหม่ === "ไม่อนุมัติ" && ความเห็น.length === 0) {
      alert("ต้องเขียนความเห็นอย่างน้อย 1 รายการก่อน จึงจะกดไม่อนุมัติได้");
      return;
    }

    if (window.db) {
      // แก้เฉพาะช่อง status เท่านั้น ห้ามเขียนทับช่องอื่นในไฟล์เดิม
      window.db.collection("leaveRequests").doc(ใบ.id).update({ status: สถานะใหม่ })
        .then(function () {
          ใบ.status = สถานะใหม่;
          วาดใบลา();
        })
        .catch(function (err) {
          console.error("เปลี่ยนสถานะไม่สำเร็จ:", err);
          alert("เปลี่ยนสถานะไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        });
    } else {
      ใบ.status = สถานะใหม่;   // แก้เฉพาะช่อง status เท่านั้น
      วาดใบลา();
    }
  }

  // ── ลบใบลา (เฉพาะใบที่ยังรอพิจารณา — ปุ่มขึ้นก็ต่อเมื่อสถานะนี้เท่านั้นอยู่แล้ว) ──
  function ลบใบลา() {
    if (!confirm("ยืนยันการลบใบขอลานี้หรือไม่ — เมื่อลบแล้วจะกู้คืนไม่ได้")) return;

    if (window.db) {
      window.db.collection("leaveRequests").doc(ใบ.id).delete()
        .then(function () {
          location.href = "leave-requests.html";
        })
        .catch(function (err) {
          console.error("ลบใบลาไม่สำเร็จ:", err);
          alert("ลบใบลาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        });
    } else {
      // ยังไม่ได้ตั้งค่า Firebase → ลบออกจากข้อมูลจำลอง (ที่เก็บอยู่จริงคือ sessionStorage สำหรับใบที่เพิ่งยื่นใหม่
      // ส่วนใบตัวอย่างจาก js/data.js เป็นแค่หน่วยความจำชั่วคราว หายเองอยู่แล้วเมื่อโหลดหน้าใหม่)
      var รายการที่ยื่นใหม่ = JSON.parse(sessionStorage.getItem("ใบลาที่ยื่นใหม่") || "[]");
      if (รายการที่ยื่นใหม่.some(function (x) { return x.id === ใบ.id; })) {
        รายการที่ยื่นใหม่ = รายการที่ยื่นใหม่.filter(function (x) { return x.id !== ใบ.id; });
        sessionStorage.setItem("ใบลาที่ยื่นใหม่", JSON.stringify(รายการที่ยื่นใหม่));
      } else {
        window.LEAVE_DATA.leaveRequests = window.LEAVE_DATA.leaveRequests.filter(function (x) { return x.id !== ใบ.id; });
      }
      location.href = "leave-requests.html";
    }
  }

  // ── รายการความเห็น เรียงจากเก่าไปใหม่ ──
  function วาดความเห็น() {
    var ที่วาง = document.getElementById("รายการความเห็น");
    if (ความเห็น.length === 0) {
      ที่วาง.innerHTML = "<p>ยังไม่มีความเห็นในใบนี้</p>";
      return;
    }
    ที่วาง.innerHTML = ความเห็น
      .slice()
      .sort(function (a, b) { return a.createdAt < b.createdAt ? -1 : 1; })
      .map(function (c) {
        return '<div class="comment"><div class="meta">' + esc(c.authorName) + " · " + esc(c.createdAt) +
               "</div><div>" + esc(c.message) + "</div></div>";
      }).join("");
  }

  // ── ส่งความเห็นใหม่ ──
  function ส่งความเห็น() {
    var ช่อง = document.getElementById("ข้อความความเห็น");
    var เตือน = document.getElementById("เตือนความเห็น");
    var ข้อความ = ช่อง.value.trim();

    if (!ข้อความ) {
      เตือน.textContent = "⚠️ พิมพ์ข้อความก่อน จึงจะส่งความเห็นได้";
      เตือน.classList.remove("hidden");
      return;
    }
    เตือน.classList.add("hidden");

    if (window.db) {
      window.getCurrentUser().then(function (ผู้ใช้) {
        var ความเห็นใหม่ = {
          authorId: ผู้ใช้ ? ผู้ใช้.uid : "",
          authorName: ผู้ใช้ ? ผู้ใช้.name : "",
          message: ข้อความ,
          createdAt: เวลาตอนนี้()
        };
        return window.db.collection("leaveRequests").doc(ใบ.id).collection("approvals").add(ความเห็นใหม่)
          .then(function (เอกสารใหม่) {
            ความเห็นใหม่.id = เอกสารใหม่.id;
            ความเห็น.push(ความเห็นใหม่);
            ช่อง.value = "";
            วาดความเห็น();
          });
      }).catch(function (err) {
        console.error("ส่งความเห็นไม่สำเร็จ:", err);
        เตือน.textContent = "⚠️ ส่งความเห็นไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
        เตือน.classList.remove("hidden");
      });
    } else {
      // สัปดาห์ที่ 6 ยังไม่มีล็อกอิน จึงสมมติว่าผู้เขียนคือ สมหญิง รักงาน
      ความเห็น.push({
        id: "ap-ใหม่-" + Date.now(),
        requestId: ใบ.id,
        authorId: "u002", authorName: "สมหญิง รักงาน",
        message: ข้อความ,
        createdAt: เวลาตอนนี้()
      });
      ช่อง.value = "";
      วาดความเห็น();
    }
  }
})();
