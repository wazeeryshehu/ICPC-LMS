import { getDb } from "./db";
import type { VerificationRecord } from "@/components/CertificateVerify";

export function getVerificationRecord(certNo: string): VerificationRecord | null {
  const row = getDb()
    .prepare(
      `SELECT ct.cert_no, ct.final_score, ct.grade, ct.issued_at, ct.revoked, ct.revoked_reason,
              u.first_name, u.last_name, u.staff_id, c.title, c.cpd_points, cat.name AS category
       FROM certificates ct
       JOIN users u ON u.id = ct.user_id
       JOIN courses c ON c.id = ct.course_id
       LEFT JOIN course_categories cat ON cat.id = c.category_id
       WHERE ct.cert_no = ?`
    )
    .get(certNo.trim()) as
    | {
        cert_no: string;
        final_score: number;
        grade: string;
        issued_at: string;
        revoked: number;
        revoked_reason: string | null;
        first_name: string;
        last_name: string;
        staff_id: string;
        title: string;
        cpd_points: number;
        category: string | null;
      }
    | undefined;
  if (!row) return null;
  return {
    certNo: row.cert_no,
    learnerName: `${row.first_name} ${row.last_name}`,
    staffId: row.staff_id,
    courseTitle: row.title,
    category: row.category,
    score: row.final_score,
    grade: row.grade,
    issuedAt: row.issued_at,
    revoked: row.revoked,
    revokedReason: row.revoked_reason,
    cpdPoints: row.cpd_points,
  };
}
