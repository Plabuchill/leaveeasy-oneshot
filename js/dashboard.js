// ─────────────────────────────────────────────────────────────
// js/dashboard.js — หน้าที่ 5 แดชบอร์ดสรุป
// สัปดาห์ที่ 6 (ต้นสัปดาห์): อ่านจากข้อมูลปลอมใน js/data.js
// ─────────────────────────────────────────────────────────────

(function () {
  var กล่องสถิติ = document.getElementById("สถิติ");
  var กล่องล่าสุด = document.getElementById("ล่าสุด");

  // ใบลาจากข้อมูลปลอม บวกกับใบที่เพิ่งยื่นในหน้าถัดไป
  var ใบลาที่ยื่นใหม่ = JSON.parse(sessionStorage.getItem("ใบลาที่ยื่นใหม่") || "[]");
  var ใบลาทั้งหมด = window.LEAVE_DATA.leaveRequests.concat(ใบลาที่ยื่นใหม่);

  // นับจำนวนใบลาแต่ละสถานะ
  var นับตามสถานะ = {
    "รอพิจารณา": 0,
    "อนุมัติ": 0,
    "ไม่อนุมัติ": 0
  };

  ใบลาทั้งหมด.forEach(function (ใบ) {
    if (นับตามสถานะ.hasOwnProperty(ใบ.status)) {
      นับตามสถานะ[ใบ.status]++;
    }
  });

  // แสดงกล่องสถิติ 3 ช่อง
  แสดงสถิติ(นับตามสถานะ);

  // แสดงตารางใบลา 5 อันดับล่าสุด
  แสดงตารางล่าสุด(ใบลาทั้งหมด);

  function แสดงสถิติ(นับ) {
    var html = "";

    Object.keys(นับ).forEach(function (สถานะ) {
      html +=
        '<a class="stat" href="leave-requests.html?status=' + esc(สถานะ) + '">' +
        '<div class="number">' + นับ[สถานะ] + '</div>' +
        '<div>' + esc(สถานะ) + '</div>' +
        '</a>';
    });

    กล่องสถิติ.innerHTML = html;
  }

  function แสดงตารางล่าสุด(รายการ) {
    // เรียงลำดับจาก createdAt ใหม่สุดมาแรก
    var รายการเรียง = รายการ.slice().sort(function (a, b) {
      return b.createdAt.localeCompare(a.createdAt);
    });

    // เอาเฉพาะ 5 อันดับแรก
    var ห้าล่าสุด = รายการเรียง.slice(0, 5);

    if (ห้าล่าสุด.length === 0) {
      กล่องล่าสุด.innerHTML = "<h2>ใบลาล่าสุด 5 อันดับ</h2><p>ยังไม่มีใบขอลาในระบบ</p>";
      return;
    }

    var html =
      "<h2>ใบลาล่าสุด 5 อันดับ</h2>" +
      "<table><thead><tr>" +
      "<th>หัวข้อ</th>" +
      "<th>ประเภทการลา</th>" +
      "<th>สถานะ</th>" +
      '<th class="hide-mobile">ผู้ขอลา</th>' +
      '<th class="hide-mobile">วันที่สร้าง</th>' +
      "</tr></thead><tbody>";

    ห้าล่าสุด.forEach(function (ใบ) {
      html +=
        '<tr class="clickable" data-id="' + esc(ใบ.id) + '">' +
        "<td>" + esc(ใบ.title) + "</td>" +
        "<td>" + esc(ใบ.leaveTypeName) + "</td>" +
        "<td>" + ป้ายสถานะ(ใบ.status) + "</td>" +
        '<td class="hide-mobile">' + esc(ใบ.requesterName) + "</td>" +
        '<td class="hide-mobile">' + esc(ใบ.createdAt) + "</td>" +
        "</tr>";
    });

    html += "</tbody></table>";
    กล่องล่าสุด.innerHTML = html;

    // กดที่แถวไหน ไปหน้ารายละเอียดของใบนั้น
    กล่องล่าสุด.querySelectorAll("tr.clickable").forEach(function (แถว) {
      แถว.addEventListener("click", function () {
        location.href = "leave-request-detail.html?id=" + แถว.dataset.id;
      });
    });
  }
})();
