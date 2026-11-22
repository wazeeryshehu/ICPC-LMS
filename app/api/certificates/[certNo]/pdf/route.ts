import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSessionUser, getSetting } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const runtime = "nodejs";

function ascii(text: string): string {
  return text.normalize("NFKD").replace(/[^\x20-\x7E]/g, "'").replace(/\s+/g, " ").trim();
}

export async function GET(_request: Request, { params }: { params: Promise<{ certNo: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const { certNo } = await params;
  const db = getDb();
  const cert = db
    .prepare(
      `SELECT ct.*, u.first_name, u.last_name, u.staff_id, c.title, c.duration_minutes, c.cpd_points, cat.name AS category
       FROM certificates ct
       JOIN users u ON u.id = ct.user_id
       JOIN courses c ON c.id = ct.course_id
       LEFT JOIN course_categories cat ON cat.id = c.category_id
       WHERE ct.cert_no = ? AND ct.revoked = 0`
    )
    .get(certNo) as
    | {
        id: number;
        cert_no: string;
        user_id: number;
        final_score: number;
        grade: string;
        issued_at: string;
        first_name: string;
        last_name: string;
        staff_id: string;
        title: string;
        duration_minutes: number;
        cpd_points: number;
        category: string | null;
      }
    | undefined;
  if (!cert) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });

  const privileged = ["super_admin", "training_admin"].includes(user.role);
  if (cert.user_id !== user.id && !privileged) {
    return NextResponse.json({ error: "You are not authorised to download this certificate" }, { status: 403 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify/${cert.cert_no}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 240, color: { dark: "#0b2550", light: "#ffffff" } });
  const qrBytes = Buffer.from(qrDataUrl.split(",")[1], "base64");

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();
  const navy = rgb(0.043, 0.145, 0.314);
  const blue = rgb(0.184, 0.486, 0.839);
  const ink = rgb(0.063, 0.114, 0.2);
  const muted = rgb(0.353, 0.42, 0.51);

  const timesBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const times = await pdf.embedFont(StandardFonts.TimesRoman);
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const qrImage = await pdf.embedPng(qrBytes);
  const emblemBytes = await readFile(path.join(process.cwd(), "public", "images", "icpc-emblem.png"));
  const emblemImage = await pdf.embedPng(emblemBytes);

  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.969, 0.98, 1) });
  page.drawRectangle({ x: 22, y: 22, width: width - 44, height: height - 44, borderColor: navy, borderWidth: 7 });
  page.drawRectangle({ x: 34, y: 34, width: width - 68, height: height - 68, borderColor: blue, borderWidth: 1.4 });
  page.drawRectangle({ x: 46, y: 46, width: width - 92, height: height - 92, borderColor: navy, borderWidth: 0.6, opacity: 0.35 });

  page.drawImage(emblemImage, { x: width / 2 - 33, y: height - 134, width: 66, height: 66 });

  const institution = ascii(getSetting("institution_name", "Independent Corrupt Practices and Other Related Offences Commission"));
  page.drawText(institution.toUpperCase(), {
    x: width / 2 - helvBold.widthOfTextAtSize(institution.toUpperCase(), 10.5) / 2,
    y: height - 152,
    size: 10.5,
    font: helvBold,
    color: navy,
  });
  const portal = "Digital Learning and Capacity Development Management System";
  page.drawText(portal, {
    x: width / 2 - helv.widthOfTextAtSize(portal, 8.5) / 2,
    y: height - 168,
    size: 8.5,
    font: helv,
    color: muted,
  });

  const title = "CERTIFICATE OF COMPLETION";
  page.drawText(title, {
    x: width / 2 - timesBold.widthOfTextAtSize(title, 30) / 2,
    y: height - 236,
    size: 30,
    font: timesBold,
    color: navy,
  });
  page.drawLine({ start: { x: width / 2 - 120, y: height - 248 }, end: { x: width / 2 + 120, y: height - 248 }, thickness: 1, color: blue });

  const certify = "This is to certify that";
  page.drawText(certify, {
    x: width / 2 - times.widthOfTextAtSize(certify, 12) / 2,
    y: height - 278,
    size: 12,
    font: times,
    color: muted,
  });

  const name = ascii(`${cert.first_name} ${cert.last_name}`);
  page.drawText(name, {
    x: width / 2 - timesBold.widthOfTextAtSize(name, 28) / 2,
    y: height - 316,
    size: 28,
    font: timesBold,
    color: ink,
  });
  const staffLine = `Staff ID ${cert.staff_id}`;
  page.drawText(staffLine, {
    x: width / 2 - helv.widthOfTextAtSize(staffLine, 9) / 2,
    y: height - 332,
    size: 9,
    font: helv,
    color: muted,
  });

  const completedLine = "has successfully completed the course";
  page.drawText(completedLine, {
    x: width / 2 - times.widthOfTextAtSize(completedLine, 12) / 2,
    y: height - 360,
    size: 12,
    font: times,
    color: muted,
  });

  page.drawText(ascii(cert.title), {
    x: 90,
    y: height - 392,
    size: 17,
    font: timesBold,
    color: blue,
    maxWidth: width - 180,
    lineHeight: 21,
  });

  const scoreLine = `Final assessment score: ${cert.final_score}%  |  Grade: ${ascii(cert.grade)}  |  ${cert.cpd_points} CPD points`;
  page.drawText(scoreLine, {
    x: width / 2 - helv.widthOfTextAtSize(scoreLine, 9.5) / 2,
    y: height - 428,
    size: 9.5,
    font: helv,
    color: muted,
  });

  page.drawLine({ start: { x: 110, y: 150 }, end: { x: 310, y: 150 }, thickness: 0.8, color: muted });
  page.drawText(ascii(getSetting("signatory_name", "Chairman, ICPC")), { x: 110, y: 134, size: 10, font: helvBold, color: ink });
  page.drawText("Chairman", { x: 110, y: 121, size: 8, font: helv, color: muted });
  page.drawText(ascii(getSetting("signatory_title", "Independent Corrupt Practices and Other Related Offences Commission")), {
    x: 110,
    y: 110,
    size: 6.5,
    font: helv,
    color: muted,
    maxWidth: 210,
    lineHeight: 8,
  });

  page.drawText(`Certificate No: ${cert.cert_no}`, { x: width / 2 - 40, y: 150, size: 8.5, font: helvBold, color: ink });
  page.drawText(`Issued: ${formatDate(cert.issued_at)}`, { x: width / 2 - 40, y: 137, size: 8, font: helv, color: muted });
  page.drawText("Verify online:", { x: width / 2 - 40, y: 124, size: 7, font: helv, color: muted });
  page.drawText(verifyUrl, { x: width / 2 - 40, y: 114, size: 6.5, font: helv, color: blue, maxWidth: 230 });

  page.drawImage(qrImage, { x: width - 152, y: 70, width: 74, height: 74 });
  page.drawText("Scan to verify", { x: width - 148, y: 58, size: 7, font: helv, color: muted });

  page.drawText("This certificate is issued through the ICPC Digital Learning and Capacity Development Management System.", {
    x: width / 2 - helv.widthOfTextAtSize("This certificate is issued through the ICPC Digital Learning and Capacity Development Management System.", 6.5) / 2,
    y: 62,
    size: 6.5,
    font: helv,
    color: muted,
  });
  page.drawText("Demonstration environment - certificate data is fictitious.", {
    x: width / 2 - helv.widthOfTextAtSize("Demonstration environment — certificate data is fictitious.", 6.5) / 2,
    y: 52,
    size: 6.5,
    font: helv,
    color: muted,
  });

  pdf.setTitle(`ICPC Certificate ${cert.cert_no}`);
  pdf.setAuthor("ICPC Digital Learning and Capacity Development Management System");
  pdf.setSubject(`Certificate of completion for ${cert.title}`);

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ICPC-Certificate-${cert.cert_no}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
