import path from "node:path";

export function dataDir(): string {
  return process.env.ICPC_DATA_DIR?.trim() || path.join(process.cwd(), "data");
}

export function uploadsDir(): string {
  return path.join(dataDir(), "uploads");
}
