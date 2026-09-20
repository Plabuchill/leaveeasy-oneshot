// ─────────────────────────────────────────────────────────────
// js/seed.js — ใส่ข้อมูลตัวอย่างจาก leaveeasy-spec.md หัวข้อ 7 ลง Firestore
// เครื่องมือใช้ครั้งเดียวตอนติดตั้งโปรเจกต์ (ไม่ใช่หน้าจอของระบบ)
//
// ใช้ .doc("รหัสคงที่").set(...) ทุกจุด → กดปุ่มซ้ำได้ ไม่เกิดข้อมูลซ้ำ (idempotent)
// ─────────────────────────────────────────────────────────────

(function () {
  var ปุ่ม = document.getElementById("ปุ่มใส่ข้อมูล");
  var กล่องสถานะ = document.getElementById("สถานะ");

  ปุ่ม.addEventListener("click", ใส่ข้อมูลตัวอย่าง);

  function แสดงสถานะ(ชนิด, ข้อความ) {
    กล่องสถานะ.innerHTML = '<div class="alert alert-' + ชนิด + '">' + ข้อความ + "</div>";
  }

  function ใส่ข้อมูลตัวอย่าง() {
    if (!window.db) {
      แสดงสถานะ("warn", "⚠️ ยังไม่ได้ตั้งค่า Firebase — วางค่า config ลงใน js/firebase-config.js ก่อน (ดู SETUP.md ขั้นที่ 1-4)");
      return;
    }

    ปุ่ม.disabled = true;
    แสดงสถานะ("warn", "กำลังใส่ข้อมูล…");

    var batch = window.db.batch();

    // 📁 users — ผู้ใช้ 3 คน (สเปกหัวข้อ 7.1)
    var users = {
      u001: { name: "สมชาย ใจดี",   email: "somchai@example.com", role: "employee" },
      u002: { name: "สมหญิง รักงาน", email: "somying@example.com", role: "manager" },
      u003: { name: "สมศรี ตั้งใจ",  email: "somsri@example.com",  role: "hr" }
    };
    Object.keys(users).forEach(function (id) {
      batch.set(window.db.collection("users").doc(id), users[id]);
    });

    // 📁 leaveTypes — ประเภทการลา 3 แบบ (สเปกหัวข้อ 7.2)
    var leaveTypes = {
      lt001: { name: "ลาพักร้อน" },
      lt002: { name: "ลาป่วย" },
      lt003: { name: "ลากิจ" }
    };
    Object.keys(leaveTypes).forEach(function (id) {
      batch.set(window.db.collection("leaveTypes").doc(id), leaveTypes[id]);
    });

    // 📁 leaveRequests — ใบขอลา 5 ใบ (สเปกหัวข้อ 7.3)
    var leaveRequests = {
      lr001: {
        title: "ลาพักร้อนไปเที่ยวกับครอบครัว",
        reason: "วางแผนเดินทางไปต่างจังหวัดกับครอบครัว จองที่พักไว้ล่วงหน้าแล้ว",
        status: "รอพิจารณา",
        requesterId: "u001", requesterName: "สมชาย ใจดี",
        approverId: "u002",  approverName: "สมหญิง รักงาน",
        leaveTypeId: "lt001", leaveTypeName: "ลาพักร้อน",
        startDate: "2026-09-07", endDate: "2026-09-09",
        createdAt: "2026-09-01 09:15"
      },
      lr002: {
        title: "ลาป่วยไข้หวัดใหญ่",
        reason: "มีไข้สูงและไอมาก แพทย์แนะนำให้พักอยู่บ้าน 2 วัน",
        status: "อนุมัติ",
        requesterId: "u001", requesterName: "สมชาย ใจดี",
        approverId: "u002",  approverName: "สมหญิง รักงาน",
        leaveTypeId: "lt002", leaveTypeName: "ลาป่วย",
        startDate: "2026-08-24", endDate: "2026-08-25",
        createdAt: "2026-08-24 08:05"
      },
      lr003: {
        title: "ลากิจไปทำบัตรประชาชน",
        reason: "บัตรประชาชนหมดอายุ ต้องไปทำที่สำนักงานเขตในวันทำการ",
        status: "รอพิจารณา",
        requesterId: "u003", requesterName: "สมศรี ตั้งใจ",
        approverId: "",      approverName: "",
        leaveTypeId: "lt003", leaveTypeName: "ลากิจ",
        startDate: "2026-09-15", endDate: "2026-09-15",
        createdAt: "2026-09-10 16:30"
      },
      lr004: {
        title: "ลาพักร้อนช่วงวันหยุดยาว",
        reason: "อยากต่อวันหยุดยาวไปพักผ่อนกับครอบครัวอีก 3 วัน",
        status: "ไม่อนุมัติ",
        requesterId: "u003", requesterName: "สมศรี ตั้งใจ",
        approverId: "u002",  approverName: "สมหญิง รักงาน",
        leaveTypeId: "lt001", leaveTypeName: "ลาพักร้อน",
        startDate: "2026-10-12", endDate: "2026-10-16",
        createdAt: "2026-09-20 11:00"
      },
      lr005: {
        title: "ลาป่วยไปพบแพทย์ตามนัด",
        reason: "มีนัดตรวจติดตามอาการกับแพทย์ในช่วงเช้า",
        status: "รอพิจารณา",
        requesterId: "u001", requesterName: "สมชาย ใจดี",
        approverId: "u002",  approverName: "สมหญิง รักงาน",
        leaveTypeId: "lt002", leaveTypeName: "ลาป่วย",
        startDate: "2026-09-22", endDate: "2026-09-22",
        createdAt: "2026-09-18 14:45"
      }
    };
    Object.keys(leaveRequests).forEach(function (id) {
      batch.set(window.db.collection("leaveRequests").doc(id), leaveRequests[id]);
    });

    // 📁 leaveRequests/<รหัสใบลา>/approvals — ความเห็นการอนุมัติ (สเปกหัวข้อ 7.4)
    // หมายเหตุ: lr003 และ lr005 ไม่มีความเห็น จึงไม่มี .set() ให้สองใบนี้
    var approvals = {
      lr001: {
        ap001: { authorId: "u002", authorName: "สมหญิง รักงาน",
                 message: "รับเรื่องแล้ว ขอดูตารางงานของทีมช่วงนั้นก่อนนะครับ",
                 createdAt: "2026-09-01 13:40" },
        ap002: { authorId: "u003", authorName: "สมศรี ตั้งใจ",
                 message: "ตรวจแล้ว วันลาพักร้อนคงเหลือครอบคลุมช่วงที่ขอ ไม่ติดขัดฝั่งฝ่ายบุคคล",
                 createdAt: "2026-09-02 10:05" }
      },
      lr002: {
        ap003: { authorId: "u002", authorName: "สมหญิง รักงาน",
                 message: "อนุมัติแล้ว พักผ่อนให้เต็มที่ งานที่ค้างไว้เดี๋ยวทีมช่วยดูให้",
                 createdAt: "2026-08-24 09:20" }
      },
      lr004: {
        ap004: { authorId: "u002", authorName: "สมหญิง รักงาน",
                 message: "ช่วงนั้นทีมมีงานส่งมอบพอดี ขอเลื่อนเป็นสัปดาห์ถัดไปได้ไหมครับ",
                 createdAt: "2026-09-20 15:10" }
      }
    };
    Object.keys(approvals).forEach(function (idใบลา) {
      var รายการความเห็น = approvals[idใบลา];
      Object.keys(รายการความเห็น).forEach(function (idความเห็น) {
        batch.set(
          window.db.collection("leaveRequests").doc(idใบลา).collection("approvals").doc(idความเห็น),
          รายการความเห็น[idความเห็น]
        );
      });
    });

    batch.commit().then(function () {
      แสดงสถานะ("ok", "✅ ใส่ข้อมูลตัวอย่างสำเร็จ — เปิด leave-requests.html เพื่อดูใบลา 5 ใบจริงจาก Firestore");
      ปุ่ม.disabled = false;
    }).catch(function (err) {
      console.error("ใส่ข้อมูลตัวอย่างไม่สำเร็จ:", err);
      แสดงสถานะ("error", "❌ ใส่ข้อมูลตัวอย่างไม่สำเร็จ: " + err.message);
      ปุ่ม.disabled = false;
    });
  }
})();
