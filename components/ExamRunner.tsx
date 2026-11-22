"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle, CheckCircle2, ClipboardList, Clock, Send, Timer } from "lucide-react";
import { submitAssessmentAction } from "@/lib/actions/learning";

export interface RunnerQuestion {
  id: number;
  type: string;
  prompt: string;
  points: number;
  options: string[] | Array<{ left: string; right: string }> | null;
}

function SubmitButton({ label, className = "btn btn-primary" }: { label: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? "Submitting…" : label} {!pending && <Send size={14} />}
    </button>
  );
}

function fmt(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ExamRunner({
  attemptId,
  questions,
  deadline,
  instructions,
  title,
  attempted,
  passMark,
}: {
  attemptId: number;
  questions: RunnerQuestion[];
  deadline: string | null;
  instructions: string | null;
  title: string;
  attempted: number;
  passMark: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [remaining, setRemaining] = useState<number | null>(() =>
    deadline ? Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000)) : null
  );
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) {
      setExpired(true);
      formRef.current?.requestSubmit();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => (r === null ? null : r - 1)), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const lowTime = remaining !== null && remaining <= 300;

  return (
    <form ref={formRef} action={submitAssessmentAction}>
      <input type="hidden" name="attemptId" value={attemptId} />

      <div className="sticky top-16 z-20 mb-5 overflow-hidden rounded-xl border border-line bg-panel/95 shadow-soft backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-800 text-white">
              <ClipboardList size={15} />
            </span>
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-semibold text-ink">{title}</div>
              <div className="text-[10px] text-muted">{questions.length} questions · Pass mark {passMark}% · {attempted} attempt{attempted === 1 ? "" : "s"} used previously</div>
            </div>
          </div>
          {remaining !== null ? (
            <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-bold tabular-nums ${
              lowTime ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" : "bg-surface-2 text-ink"
            }`}>
              <Timer size={15} /> {expired ? "Time expired" : fmt(remaining)}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-1.5 text-[11px] font-medium text-muted">
              <Clock size={13} /> Untimed
            </div>
          )}
          <SubmitButton label="Submit assessment" className="btn btn-primary btn-sm" />
        </div>
        {lowTime && !expired && (
          <div className="flex items-center gap-2 bg-red-50 px-4 py-1.5 text-[10.5px] font-medium text-red-700 dark:bg-red-950/30 dark:text-red-300">
            <AlertTriangle size={12} /> Less than five minutes remaining. Your assessment will submit automatically when time expires.
          </div>
        )}
        {expired && (
          <div className="flex items-center gap-2 bg-red-50 px-4 py-1.5 text-[10.5px] font-medium text-red-700 dark:bg-red-950/30 dark:text-red-300">
            <AlertTriangle size={12} /> Time has expired. Submitting your saved answers…
          </div>
        )}
      </div>

      {instructions && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-line bg-panel-2 px-4 py-3 text-[12px] leading-relaxed text-ink-soft">
          <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-300" />
          <div><strong className="text-ink">Instructions.</strong> {instructions}</div>
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-1.5">
        {questions.map((q, i) => (
          <a
            key={q.id}
            href={`#q-${q.id}`}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-panel text-[10.5px] font-semibold text-ink-soft hover:border-brand-500 hover:text-brand-700"
          >
            {i + 1}
          </a>
        ))}
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <section key={q.id} id={`q-${q.id}`} className="card scroll-mt-32 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-800 text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="chip chip-gray capitalize">{q.type.replace(/_/g, " ")}</span>
                  <span className="text-[10px] text-muted">{q.points} point{q.points === 1 ? "" : "s"}</span>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-[13.5px] font-medium leading-relaxed text-ink">{q.prompt}</p>

                <div className="mt-3.5 space-y-2">
                  {q.type === "mcq" && Array.isArray(q.options) &&
                    (q.options as string[]).map((opt, idx) => (
                      <label key={idx} className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-ink-soft hover:border-brand-400">
                        <input type="radio" name={`q_${q.id}`} value={idx} className="mt-0.5 accent-[#16437f]" />
                        <span>{opt}</span>
                      </label>
                    ))}

                  {q.type === "multi" && Array.isArray(q.options) &&
                    (q.options as string[]).map((opt, idx) => (
                      <label key={idx} className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-ink-soft hover:border-brand-400">
                        <input type="checkbox" name={`q_${q.id}`} value={idx} className="mt-0.5 accent-[#16437f]" />
                        <span>{opt}</span>
                      </label>
                    ))}

                  {q.type === "true_false" && (
                    <>
                      <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-ink-soft hover:border-brand-400">
                        <input type="radio" name={`q_${q.id}`} value="true" className="accent-[#16437f]" /> True
                      </label>
                      <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-ink-soft hover:border-brand-400">
                        <input type="radio" name={`q_${q.id}`} value="false" className="accent-[#16437f]" /> False
                      </label>
                    </>
                  )}

                  {q.type === "fill" && (
                    <input name={`q_${q.id}`} placeholder="Type your answer…" className="input" autoComplete="off" />
                  )}

                  {q.type === "matching" && Array.isArray(q.options) && (
                    <div className="space-y-2">
                      {(q.options as Array<{ left: string; right: string }>).map((pair, idx) => (
                        <div key={idx} className="grid items-center gap-2 sm:grid-cols-2">
                          <div className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] font-medium text-ink">{pair.left}</div>
                          <select name={`q_${q.id}__${idx}`} className="input" defaultValue="">
                            <option value="">Select the matching item…</option>
                            {(q.options as Array<{ left: string; right: string }>).map((p) => (
                              <option key={p.right} value={p.right}>{p.right}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === "short_answer" && (
                    <textarea name={`q_${q.id}`} rows={3} placeholder="Type your response…" className="input resize-y" />
                  )}

                  {q.type === "essay" && (
                    <textarea name={`q_${q.id}`} rows={10} placeholder="Type your response. This item will be graded manually by the instructor…" className="input resize-y leading-relaxed" />
                  )}

                  {!["mcq", "multi", "true_false", "fill", "matching", "short_answer", "essay"].includes(q.type) && (
                    <textarea name={`q_${q.id}`} rows={4} placeholder="Type your response…" className="input resize-y" />
                  )}
                </div>
                {(q.type === "short_answer" || q.type === "essay" || q.type === "scenario") && (
                  <p className="mt-2 text-[10.5px] text-muted">This response is graded manually. You will be notified when your result is published.</p>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-line bg-panel-2 px-5 py-4 sm:flex-row">
        <p className="text-[11.5px] text-muted">
          Review all answers before submitting. {deadline ? "Your attempt will submit automatically at the deadline." : "You may submit when ready."}
        </p>
        <SubmitButton label="Submit assessment" />
      </div>
    </form>
  );
}
