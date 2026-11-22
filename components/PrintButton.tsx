"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "Print / Save as PDF" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-primary btn-sm print:hidden">
      <Printer size={13} /> {label}
    </button>
  );
}
