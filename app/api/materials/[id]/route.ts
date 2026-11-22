import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { uploadsDir } from "@/lib/paths";

export const runtime = "nodejs";

function contentDisposition(title: string): string {
  const ascii = title
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/["\\\r\n]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "material";
  const encoded = encodeURIComponent(title).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  return `inline; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  const material = db
    .prepare(
      `SELECT m.filename, m.mime, m.title, c.instructor_id
       FROM materials m JOIN courses c ON c.id = m.course_id WHERE m.id = ?`
    )
    .get(Number(id)) as { filename: string; mime: string; title: string; instructor_id: number | null } | undefined;
  if (!material) return NextResponse.json({ error: "Material not found" }, { status: 404 });

  const privileged = ["super_admin", "training_admin"].includes(user.role) || material.instructor_id === user.id;
  const enrolled = db
    .prepare(
      `SELECT 1 FROM enrollments e JOIN materials m ON m.course_id = e.course_id WHERE m.id = ? AND e.user_id = ?`
    )
    .get(Number(id), user.id);
  if (!privileged && !enrolled) {
    return NextResponse.json({ error: "You are not enrolled in this course" }, { status: 403 });
  }

  try {
    const buffer = await readFile(path.join(uploadsDir(), path.basename(material.filename)));
    const mime = /^[a-z]+\/[a-z0-9.+-]+$/i.test(material.mime) ? material.mime : "application/octet-stream";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": contentDisposition(material.title),
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Cross-Origin-Resource-Policy": "same-origin",
      },
    });
  } catch {
    return NextResponse.json({ error: "File unavailable" }, { status: 404 });
  }
}
