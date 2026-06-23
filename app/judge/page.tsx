"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { JudgeDashboardResponse } from "@/models/judge-dashboard.model";

export default function JudgeDashboardClient() {
  const [data, setData] = useState<JudgeDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/judge/dashboard", {
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok) {
        setData(null);
        setError(json.message || "Failed to load judge dashboard.");
      } else {
        setData(json);
      }
    } catch {
      setData(null);
      setError("Could not connect to server.");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center text-slate-500">
        Loading judge dashboard...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error || "Could not load judge dashboard."}
      </div>
    );
  }

  const stats = data.stats;

  return (
    <div className="space-y-6 text-slate-950">
      <section className="relative overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-slate-950 via-amber-900 to-amber-500 p-7 text-white shadow-xl shadow-amber-200/70">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-yellow-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-100">
              Welcome back,
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              ⚖️ {data.judge.full_name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-50">
              Review assigned court cases, verify blockchain evidence, examine
              lab reports and legal notes, then prepare final verdicts.
            </p>
          </div>

          <Link
            href="/judge/cases"
            className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
          >
            Review Cases
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-8">
        <StatCard label="Assigned Cases" value={stats.assignedCases} color="text-slate-950" />
        <StatCard label="Open" value={stats.openCases} color="text-blue-600" />
        <StatCard label="In Progress" value={stats.inProgressCases} color="text-amber-600" />
        <StatCard label="Closed" value={stats.closedCases} color="text-slate-600" />
        <StatCard label="Evidence" value={stats.totalEvidence} color="text-violet-600" />
        <StatCard label="Analyzed" value={stats.analyzedEvidence} color="text-emerald-600" />
        <StatCard label="Lab Reports" value={stats.totalLabReports} color="text-purple-600" />
        <StatCard label="Legal Notes" value={stats.finalLegalNotes} color="text-amber-600" />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="glass-card overflow-hidden rounded-3xl xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Assigned Court Cases
              </h2>
              <p className="text-sm text-slate-500">
                Latest cases assigned to this judge.
              </p>
            </div>

            <Link
              href="/judge/cases"
              className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4">Case</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Evidence</th>
                  <th className="p-4">Reports</th>
                  <th className="p-4">Legal Notes</th>
                </tr>
              </thead>

              <tbody>
                {data.assignedCases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      No assigned judge cases yet.
                    </td>
                  </tr>
                ) : (
                  data.assignedCases.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-200 transition hover:bg-amber-50/60"
                    >
                      <td className="p-4">
                        <p className="font-semibold text-slate-950">
                          {item.case_code}
                        </p>
                        <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                          {item.title}
                        </p>
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass(
                            item.priority
                          )}`}
                        >
                          {item.priority}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${caseStatusClass(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="p-4 text-slate-700">
                        {Number(item.evidence_count || 0)}
                      </td>

                      <td className="p-4 text-slate-700">
                        {Number(item.lab_report_count || 0)}
                      </td>

                      <td className="p-4 text-slate-700">
                        {Number(item.final_note_count || 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-xl font-bold text-slate-950">
              Judge Workflow
            </h2>

            <div className="mt-5 space-y-3">
              <WorkflowStep title="Review Case" text="Check assigned case and investigation summary." />
              <WorkflowStep title="Verify Evidence" text="Inspect file hash, IPFS CID, and blockchain transaction." />
              <WorkflowStep title="Read Reports" text="Review lab analysis and legal notes." />
              <WorkflowStep title="Issue Verdict" text="Create final judgment for the case." />
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-xl font-bold text-slate-950">
              Recent Legal Notes
            </h2>

            {data.recentLegalNotes.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                No legal notes available yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {data.recentLegalNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="font-semibold text-slate-950">
                      {note.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {note.case_code || "-"} • {note.note_type}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-amber-700">
                      Status: {note.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-xl font-bold text-slate-950">
            Recent Lab Reports
          </h2>

          {data.recentLabReports.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No lab reports available yet.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {data.recentLabReports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="font-semibold text-slate-950">
                    Evidence #{report.evidence_id}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {report.case_code || "-"} • {report.evidence_type}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-emerald-700">
                    Conclusion: {report.conclusion || "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-xl font-bold text-slate-950">
            Recent Evidence
          </h2>

          {data.recentEvidence.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No evidence available yet.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {data.recentEvidence.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">
                        Evidence #{item.id}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.case_code || "-"} • {item.evidence_type}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${evidenceStatusClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-3 break-all font-mono text-xs text-slate-500">
                    {item.file_hash}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <h2 className={`mt-2 text-3xl font-bold ${color}`}>{value}</h2>
    </div>
  );
}

function WorkflowStep({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="font-bold text-slate-950">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}

function priorityClass(priority: string) {
  if (priority === "Urgent") {
    return "border border-red-300 bg-red-50 text-red-700";
  }

  if (priority === "High") {
    return "border border-orange-300 bg-orange-50 text-orange-700";
  }

  if (priority === "Medium") {
    return "border border-amber-300 bg-amber-50 text-amber-700";
  }

  return "border border-slate-300 bg-slate-50 text-slate-600";
}

function caseStatusClass(status: string) {
  if (status === "Open") {
    return "border border-blue-300 bg-blue-50 text-blue-700";
  }

  if (status === "In Progress") {
    return "border border-amber-300 bg-amber-50 text-amber-700";
  }

  if (status === "Closed") {
    return "border border-slate-300 bg-slate-50 text-slate-600";
  }

  return "border border-slate-300 bg-slate-50 text-slate-600";
}

function evidenceStatusClass(status: string) {
  if (status === "Pending") {
    return "border border-amber-300 bg-amber-50 text-amber-700";
  }

  if (status === "Accepted") {
    return "border border-blue-300 bg-blue-50 text-blue-700";
  }

  if (status === "Analyzed") {
    return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  }

  if (status === "Rejected") {
    return "border border-red-300 bg-red-50 text-red-700";
  }

  return "border border-slate-300 bg-slate-50 text-slate-600";
}