"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LabDashboardResponse } from "@/models/lab-dashboard.model";
import { DashboardSkeleton } from "@/components/ui/LoadingSkeletons";
import StatusBadge from "@/components/ui/StatusBadge";

export default function LabDashboardClient() {
  const [data, setData] = useState<LabDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/lab/dashboard", {
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok) {
        setData(null);
        setError(json.message || "Failed to load lab dashboard.");
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
  return <DashboardSkeleton tone="emerald" statCount={6} tableColumns={5} />;
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error || "Could not load lab dashboard."}
      </div>
    );
  }

  const stats = data.stats;

  return (
    <div className="space-y-6 text-slate-950">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-950 p-7 text-white shadow-xl shadow-emerald-200/70">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-100">
              Welcome back,
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              🧪 {data.technician.full_name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50">
              Review pending evidence, accept laboratory custody, and submit
              analysis reports for assigned cases.
            </p>
          </div>

          <Link
            href="/lab/evidence"
            className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
          >
            View Evidence Queue
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Assigned Cases" value={stats.assignedCases} color="text-slate-950" />
        <StatCard label="Pending" value={stats.pendingEvidence} color="text-amber-600" />
        <StatCard label="Accepted" value={stats.acceptedEvidence} color="text-blue-600" />
        <StatCard label="Analyzed" value={stats.analyzedEvidence} color="text-emerald-600" />
        <StatCard label="Rejected" value={stats.rejectedEvidence} color="text-red-600" />
        <StatCard label="Reports" value={stats.totalReports} color="text-purple-600" />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="glass-card overflow-hidden rounded-3xl xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Recent Assigned Evidence
              </h2>
              <p className="text-sm text-slate-500">
                Latest evidence from cases assigned to you.
              </p>
            </div>

            <Link
              href="/lab/evidence"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4">Evidence</th>
                  <th className="p-4">Case</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Blockchain</th>
                </tr>
              </thead>

              <tbody>
                {data.recentEvidence.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      No assigned evidence yet.
                    </td>
                  </tr>
                ) : (
                  data.recentEvidence.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-200 transition hover:bg-emerald-50/60"
                    >
                      <td className="p-4 font-semibold text-slate-950">
                        #{item.id}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">
                          {item.case_code || "-"}
                        </p>
                        <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500">
                          {item.case_title || "-"}
                        </p>
                      </td>
                      <td className="p-4 text-slate-700">{item.evidence_type}</td>
                      <td className="p-4">
                        <StatusBadge status={item.status} variant="evidence" />
                      </td>
                      <td className="p-4">
                        <StatusBadge status={item.blockchain_status} variant="blockchain" />
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
              Lab Workflow
            </h2>

            <div className="mt-5 space-y-3">
              <WorkflowStep title="Pending" text="Evidence submitted by investigator." />
              <WorkflowStep title="Accepted" text="Lab technician accepts evidence custody." />
              <WorkflowStep title="Analyzed" text="Lab technician submits lab report." />
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-xl font-bold text-slate-950">
              Recent Reports
            </h2>

            {data.recentReports.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                No lab reports submitted yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {data.recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="font-semibold text-slate-950">
                      Evidence #{report.evidence_id}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {report.analysis_type || "General Analysis"}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-emerald-700">
                      {report.conclusion || "-"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
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
