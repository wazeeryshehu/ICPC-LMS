import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate, percent } from "@/lib/format";
import { isAdministrator } from "@/lib/rbac";

export const runtime = "nodejs";

interface ExportRow {
  staff_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  department_name: string | null;
  course_title: string;
  category_name: string | null;
  level: string;
  enrollment_status: string;
  progress_percent: number;
  enrolled_at: string;
  completed_at: string | null;
  avg_score: number | null;
  cert_no: string | null;
}

function ascii(text: string): string {
  return text.normalize("NFKD").replace(/[^\x20-\x7E]/g, "'").replace(/\s+/g, " ").trim();
}

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const url = new URL(request.url);
  const scope = url.searchParams.get("scope") ?? "admin";
  const format = (url.searchParams.get("format") ?? "csv").toLowerCase();
  const departmentId = Number(url.searchParams.get("department")) || 0;
  const categoryId = Number(url.searchParams.get("category")) || 0;
  const courseId = Number(url.searchParams.get("course")) || 0;
  const status = url.searchParams.get("status") ?? "";
  const from = url.searchParams.get("from") ?? "";
  const to = url.searchParams.get("to") ?? "";

  if (!["csv", "xlsx", "pdf"].includes(format)) {
    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  }

  const db = getDb();
  const where: string[] = ["1=1"];
  const args: Array<string | number> = [];
  let scopeLabel = "Organisation-wide";

  if (scope === "admin") {
    if (!["super_admin", "training_admin", "management"].includes(user.role)) {
      return NextResponse.json({ error: "Not authorised" }, { status: 403 });
    }
  } else if (scope === "instructor") {
    if (!["instructor", "super_admin", "training_admin"].includes(user.role)) {
      return NextResponse.json({ error: "Not authorised" }, { status: 403 });
    }
    if (!isAdministrator(user.role)) {
      where.push("c.instructor_id = ?");
      args.push(user.id);
      scopeLabel = "My courses";
    }
  } else if (scope === "department") {
    if (!["coordinator", "super_admin", "training_admin"].includes(user.role)) {
      return NextResponse.json({ error: "Not authorised" }, { status: 403 });
    }
    if (user.role === "coordinator") {
      if (!user.department_id) return NextResponse.json({ error: "No department assigned" }, { status: 403 });
      where.push("u.department_id = ?");
      args.push(user.department_id);
      scopeLabel = user.department_name ?? "Department";
    }
  } else {
    return NextResponse.json({ error: "Unknown scope" }, { status: 400 });
  }

  if (scope !== "department" || user.role !== "coordinator") {
    if (departmentId) {
      where.push("u.department_id = ?");
      args.push(departmentId);
      scopeLabel = `${scopeLabel} · department ${departmentId}`;
    }
  }
  if (categoryId) {
    where.push("c.category_id = ?");
    args.push(categoryId);
  }
  if (courseId) {
    where.push("c.id = ?");
    args.push(courseId);
  }
  if (status === "active" || status === "completed") {
    where.push("e.status = ?");
    args.push(status);
  }
  if (from) {
    where.push("e.enrolled_at >= ?");
    args.push(`${from}T00:00:00.000Z`);
  }
  if (to) {
    where.push("e.enrolled_at <= ?");
    args.push(`${to}T23:59:59.999Z`);
  }

  const rows = db
    .prepare(
      `SELECT u.staff_id, u.first_name, u.middle_name, u.last_name, u.email, d.name AS department_name,
              c.title AS course_title, cc.name AS category_name, c.level,
              e.status AS enrollment_status, e.progress_percent, e.enrolled_at, e.completed_at,
              (SELECT ROUND(AVG(at.percent), 1) FROM assessment_attempts at JOIN assessments a ON a.id = at.assessment_id
                WHERE at.user_id = u.id AND a.course_id = c.id AND at.status = 'graded') AS avg_score,
              (SELECT ct.cert_no FROM certificates ct WHERE ct.user_id = u.id AND ct.course_id = c.id AND ct.revoked = 0 LIMIT 1) AS cert_no
       FROM enrollments e
       JOIN users u ON u.id = e.user_id
       LEFT JOIN departments d ON d.id = u.department_id
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN course_categories cc ON cc.id = c.category_id
       WHERE ${where.join(" AND ")}
       ORDER BY d.name, u.last_name, u.first_name, c.title
       LIMIT 5000`
    )
    .all(...args) as unknown as ExportRow[];

  const total = rows.length;
  const completed = rows.filter((r) => r.enrollment_status === "completed").length;
  const certificates = rows.filter((r) => r.cert_no).length;
  const scored = rows.filter((r) => r.avg_score !== null);
  const avgScore = scored.length ? Math.round((scored.reduce((s, r) => s + (r.avg_score ?? 0), 0) / scored.length) * 10) / 10 : 0;
  const avgProgress = total ? Math.round(rows.reduce((s, r) => s + r.progress_percent, 0) / total) : 0;
  const stamp = new Date().toISOString().slice(0, 10);
  const baseName = `ICPC-training-report-${stamp}`;
  const title = "ICPC Digital Learning Portal — Training Report";
  const summary = [
    ["Scope", scopeLabel],
    ["Generated", new Date().toUTCString()],
    ["Records", String(total)],
    ["Completed enrolments", String(completed)],
    ["Completion rate", `${percent(completed, total)}%`],
    ["Average progress", `${avgProgress}%`],
    ["Average assessment score", `${avgScore}%`],
    ["Certificates issued", String(certificates)],
    ["Notice", "Demonstration data. Fictitious staff and training records."],
  ];

  if (format === "csv") {
    const header = ["Staff ID", "First name", "Other name", "Surname", "Official email", "Department", "Course", "Category", "Level", "Status", "Progress %", "Average score %", "Certificate number", "Enrolled", "Completed"];
    const lines = [
      header,
      ...rows.map((r) => [
        r.staff_id,
        r.first_name,
        r.middle_name ?? "",
        r.last_name,
        r.email,
        r.department_name ?? "",
        r.course_title,
        r.category_name ?? "",
        r.level,
        r.enrollment_status,
        r.progress_percent,
        r.avg_score ?? "",
        r.cert_no ?? "",
        formatDate(r.enrolled_at),
        r.completed_at ? formatDate(r.completed_at) : "",
      ]),
    ];
    const csv = "\uFEFF" + lines.map((line) => line.map(csvCell).join(",")).join("\r\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${baseName}.csv"`,
      },
    });
  }

  if (format === "xlsx") {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "ICPC Digital Learning Portal";
    workbook.created = new Date();
    const info = workbook.addWorksheet("Summary");
    info.columns = [{ width: 34 }, { width: 70 }];
    info.mergeCells("A1:B1");
    info.getCell("A1").value = title;
    info.getCell("A1").font = { bold: true, size: 14, color: { argb: "FF0E4A37" } };
    summary.forEach(([label, value], i) => {
      info.getCell(`A${i + 3}`).value = label;
      info.getCell(`A${i + 3}`).font = { bold: true };
      info.getCell(`B${i + 3}`).value = value;
    });

    const sheet = workbook.addWorksheet("Learner records");
    sheet.columns = [
      { header: "Staff ID", key: "staff_id", width: 12 },
      { header: "First name", key: "first_name", width: 16 },
      { header: "Other name", key: "middle_name", width: 16 },
      { header: "Surname", key: "last_name", width: 18 },
      { header: "Official email", key: "email", width: 34 },
      { header: "Department", key: "department_name", width: 30 },
      { header: "Course", key: "course_title", width: 46 },
      { header: "Category", key: "category_name", width: 30 },
      { header: "Level", key: "level", width: 12 },
      { header: "Status", key: "enrollment_status", width: 12 },
      { header: "Progress %", key: "progress_percent", width: 11 },
      { header: "Average score %", key: "avg_score", width: 14 },
      { header: "Certificate", key: "cert_no", width: 20 },
      { header: "Enrolled", key: "enrolled_at", width: 14 },
      { header: "Completed", key: "completed_at", width: 14 },
    ];
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0E4A37" } };
    rows.forEach((r) =>
      sheet.addRow({
        ...r,
        middle_name: r.middle_name ?? "",
        department_name: r.department_name ?? "",
        category_name: r.category_name ?? "",
        avg_score: r.avg_score ?? "",
        cert_no: r.cert_no ?? "",
        enrolled_at: formatDate(r.enrolled_at),
        completed_at: r.completed_at ? formatDate(r.completed_at) : "",
      })
    );
    sheet.autoFilter = { from: "A1", to: "O1" };
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.eachRow((row, index) => {
      if (index > 1) row.alignment = { vertical: "top", wrapText: false };
    });
    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${baseName}.xlsx"`,
      },
    });
  }

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageSize: [number, number] = [841.89, 595.28];
  let page = pdf.addPage(pageSize);
  let { width, height } = page.getSize();
  let y = height - 46;
  const green = rgb(0.043, 0.145, 0.314);
  const gold = rgb(0.184, 0.486, 0.839);
  const grey = rgb(0.353, 0.42, 0.51);
  const ink = rgb(0.063, 0.114, 0.2);
  const margin = 36;

  const newPage = () => {
    page = pdf.addPage(pageSize);
    ({ width, height } = page.getSize());
    y = height - 46;
    page.drawRectangle({ x: 0, y: height - 8, width, height: 8, color: green });
    page.drawRectangle({ x: 0, y: height - 11, width, height: 3, color: gold });
    page.drawText(title, { x: margin, y, size: 11, font: bold, color: green });
    page.drawText(`Page ${pdf.getPageCount()}`, { x: width - margin - 44, y, size: 8, font, color: grey });
    y -= 22;
  };

  page.drawRectangle({ x: 0, y: height - 8, width, height: 8, color: green });
  page.drawRectangle({ x: 0, y: height - 11, width, height: 3, color: gold });
  page.drawText(title, { x: margin, y, size: 19, font: bold, color: green });
  y -= 22;
  page.drawText(`Independent Corrupt Practices and Other Related Offences Commission`, { x: margin, y, size: 9, font, color: grey });
  y -= 12;
  page.drawText(`Scope: ${ascii(scopeLabel)}  ·  Generated ${ascii(new Date().toISOString().slice(0, 16).replace("T", " "))} UTC`, { x: margin, y, size: 9, font, color: grey });
  y -= 22;

  const stats = [
    ["Records", String(total)],
    ["Completed", `${completed} (${percent(completed, total)}%)`],
    ["Avg progress", `${avgProgress}%`],
    ["Avg score", `${avgScore}%`],
    ["Certificates", String(certificates)],
  ];
  let x = margin;
  for (const [label, value] of stats) {
    page.drawRectangle({ x, y: y - 30, width: 140, height: 34, borderColor: rgb(0.85, 0.87, 0.85), borderWidth: 0.6 });
    page.drawText(label, { x: x + 8, y: y - 8, size: 7.5, font, color: grey });
    page.drawText(value, { x: x + 8, y: y - 23, size: 12, font: bold, color: ink });
    x += 150;
  }
  y -= 52;

  const columns = [
    { label: "Staff", x: margin, width: 74, key: "staff" },
    { label: "Department", x: margin + 78, width: 100, key: "dept" },
    { label: "Course", x: margin + 182, width: 230, key: "course" },
    { label: "Status", x: margin + 416, width: 58, key: "status" },
    { label: "Progress", x: margin + 478, width: 48, key: "progress" },
    { label: "Score", x: margin + 530, width: 40, key: "score" },
    { label: "Certificate", x: margin + 574, width: 100, key: "cert" },
    { label: "Enrolled", x: margin + 678, width: 88, key: "enrolled" },
  ];
  const drawHeader = () => {
    page.drawRectangle({ x: margin, y: y - 4, width: width - margin * 2, height: 18, color: rgb(0.94, 0.96, 0.94) });
    for (const col of columns) {
      page.drawText(col.label, { x: col.x, y: y + 1, size: 7.5, font: bold, color: green });
    }
    y -= 20;
  };
  drawHeader();

  const fit = (text: string, max: number) => {
    let t = ascii(text);
    while (t.length > 1 && font.widthOfTextAtSize(t, 7.5) > max) t = t.slice(0, -1);
    return t;
  };

  for (const r of rows) {
    if (y < 34) {
      newPage();
      drawHeader();
    }
    const cells = [
      `${[r.first_name, r.middle_name, r.last_name].filter(Boolean).join(" ")} (${r.staff_id})`,
      r.department_name ?? "—",
      r.course_title,
      r.enrollment_status === "completed" ? "Completed" : "In progress",
      `${r.progress_percent}%`,
      r.avg_score != null ? `${r.avg_score}%` : "—",
      r.cert_no ?? "—",
      formatDate(r.enrolled_at),
    ];
    cells.forEach((cell, i) => {
      page.drawText(fit(cell, columns[i].width - 4), { x: columns[i].x, y, size: 7.5, font, color: ink });
    });
    page.drawLine({ start: { x: margin, y: y - 5 }, end: { x: width - margin, y: y - 5 }, thickness: 0.4, color: rgb(0.9, 0.91, 0.9) });
    y -= 15;
  }

  y -= 10;
  if (y < 30) newPage();
  page.drawText("Demonstration data. Staff and training records are fictitious.", { x: margin, y, size: 7.5, font, color: grey });

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${baseName}.pdf"`,
    },
  });
}
