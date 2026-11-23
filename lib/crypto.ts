import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

const KEY_LEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, KEY_LEN).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, expected] = parts;
  try {
    const derived = scryptSync(password, salt, KEY_LEN);
    const expectedBuf = Buffer.from(expected, "hex");
    if (expectedBuf.length !== derived.length) return false;
    return timingSafeEqual(derived, expectedBuf);
  } catch {
    return false;
  }
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export function sessionToken(): string {
  return randomToken(32);
}

export function validatePasswordPolicy(password: string): string | null {
  if (password.length < 10) return "Password must be at least 10 characters long.";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain a number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain a symbol.";
  return null;
}

export function staffEmail(firstName: string, lastName: string): string {
  const clean = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "");
  return `${clean(firstName)}.${clean(lastName)}@icpc.gov.ng`;
}

export function isValidStaffId(staffId: string): boolean {
  return /^[A-Z0-9][A-Z0-9/-]{1,19}$/.test(staffId.trim().toUpperCase());
}

export function isValidOfficialEmail(email: string): boolean {
  return /^[a-z0-9._-]+@icpc\.gov\.ng$/i.test(email.trim());
}
