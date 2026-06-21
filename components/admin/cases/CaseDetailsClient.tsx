"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CaseDetailResponse } from "@/models/case-detail.model";
import type { AssignableRole } from "@/models/team-assignment.model";

const roles: AssignableRole[] = [
  "Investigator",
  "Lab Technician",
  "Lawyer",
  "Judge",
];

export default function CaseDetailsClient({ caseId }: { caseId: string }) {
  const [data, setData] = useState<CaseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCaseDetails() {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/cases/${caseId}/details`, {
      cache: "no-store",
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.message || "Failed to load case details.");
      setData(null);
    } else {
      setData(json);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCaseDetails();
  }, [caseId]);

  const teamByRole = useMemo(() => {
    const grouped: Record<AssignableRole, typeof data extends CaseDetailResponse ? CaseDetailResponse["team"] : []> = {
      Investigator: [],
      "Lab Technician": [],
      Lawyer: [],
      Judge: [],
    };

    if (!data) return grouped;

    roles.forEach((role) => {
      grouped[role] = data.team.filter((member) => member.role === role);
    });

    return grouped;
  }, [data]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center text-slate-500">
        Loading case details...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error || "Case not found."}
      </div>
    );
  }

  const caseRecord = data.caseRecord;

  return (
    <div className="space-y-6 text-slate-950">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            href="/admin/cases"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            ← Back to Case Registry
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {caseRecord.case_code}
            </h1>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass(
                caseRecord.priority
              )}`}
            >
              {caseRecord.priority}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                caseRecord.status
              )}`}
            >
              {caseRecord.status}
            </span>
          </div>

          <p className="mt-1 text-lg font-semibold text-slate-700">
            {caseRecord.title}
          </p>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            {caseRecord.description || "No description provided."}
          </p>
        </div>

        <Link
          href="/admin/team-assignments"
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
        >
          ⚙️ Manage Team
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Team Members" value={data.team.length} color="text-blue-600" />
        <StatCard label="Evidence" value={data.evidence.length} color="text-emerald-600" />
        <StatCard label="Audit Logs" value={data.auditLogs.length} color="text-purple-600" />
        <StatCard
          label="Lead Investigator"
          value={caseRecord.lead_investigator || "-"}
          text
        />
      </div>

      <section className="glass-card rounded-3xl p-5">
        <h2 className="text-xl font-bold">👨‍💼 Assigned Team</h2>
        <p className="mt-1 text-sm text-slate-500">
          Role-based team members assigned to this case.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roles.map((role) => {
            const members = teamByRole[role];

            return (
              <div
                key={role}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">
                    {role}
                  </h3>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${roleClass(role)}`}>
                    {members.length}
                  </span>
                </div>

                {members.length === 0 ? (
                  <p className="text-sm text-slate-400">No member</p>
                ) : (
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                      >
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {member.full_name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          @{member.username}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="glass-card overflow-hidden rounded-3xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-xl font-bold">🧾 Evidence</h2>
          <p className="text-sm text-slate-500">
            Evidence records linked to this case.
          </p>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-slate-500">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Type</th>
              <th className="p-4">Submitted By</th>
              <th className="p-4">Status</th>
              <th className="p-4">Hash</th>
              <th className="p-4">Created</th>
            </tr>
          </thead>

          <tbody>
            {data.evidence.map((item) => (
              <tr
                key={item.id}
                className="border-t border-slate-200 transition hover:bg-blue-50/60"
              >
                <td className="p-4 font-semibold">#{item.id}</td>
                <td className="p-4 text-slate-700">{item.evidence_type}</td>
                <td className="p-4 text-slate-600">
                  {item.submitted_by || "-"}
                </td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${evidenceStatusClass(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="max-w-[220px] truncate p-4 font-mono text-xs text-blue-700">
                  {item.file_hash || "-"}
                </td>
                <td className="p-4 text-slate-500">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}

            {data.evidence.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No evidence linked to this case.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="glass-card rounded-3xl p-5">
        <h2 className="text-xl font-bold">📜 Audit Timeline</h2>
        <p className="mt-1 text-sm text-slate-500">
          Recent activity related to this case.
        </p>

        <div className="mt-5 space-y-3">
          {data.auditLogs.map((log) => (
            <div
              key={log.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{log.action}</p>
                  <p className="text-sm text-slate-500">
                    {log.actor_name || "Unknown"} • {log.actor_role || "-"}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${auditStatusClass(
                    log.status
                  )}`}
                >
                  {log.status}
                </span>
              </div>

              {log.details && (
                <p className="mt-2 text-sm text-slate-600">{log.details}</p>
              )}

              <p className="mt-2 text-xs text-slate-400">
                {log.created_at ? new Date(log.created_at).toLocaleString() : "-"}
              </p>
            </div>
          ))}

          {data.auditLogs.length === 0 && (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
              No audit logs found for this case.
            </p>
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
  text,
}: {
  label: string;
  value: number | string;
  color?: string;
  text?: boolean;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <h2
        className={`mt-2 ${
          text ? "truncate text-lg" : "text-3xl"
        } font-bold ${color || "text-slate-950"}`}
      >
        {value}
      </h2>
    </div>
  );
}

function priorityClass(priority: string) {
  if (priority === "Low") return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  if (priority === "Medium") return "border border-amber-300 bg-amber-50 text-amber-700";
  if (priority === "High") return "border border-orange-300 bg-orange-50 text-orange-700";
  if (priority === "Urgent") return "border border-red-300 bg-red-50 text-red-700";
  return "border border-slate-300 bg-slate-50 text-slate-600";
}

function statusClass(status: string) {
  if (status === "Open") return "border border-blue-300 bg-blue-50 text-blue-700";
  if (status === "In Progress") return "border border-amber-300 bg-amber-50 text-amber-700";
  if (status === "Closed") return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  return "border border-slate-300 bg-slate-50 text-slate-600";
}

function evidenceStatusClass(status: string) {
  if (status === "Pending") return "border border-amber-300 bg-amber-50 text-amber-700";
  if (status === "Accepted") return "border border-blue-300 bg-blue-50 text-blue-700";
  if (status === "Analyzed") return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  if (status === "Rejected") return "border border-red-300 bg-red-50 text-red-700";
  return "border border-slate-300 bg-slate-50 text-slate-600";
}

function auditStatusClass(status: string) {
  if (status === "Success") return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  if (status === "Warning") return "border border-amber-300 bg-amber-50 text-amber-700";
  if (status === "Failed") return "border border-red-300 bg-red-50 text-red-700";
  if (status === "Critical") return "border border-purple-300 bg-purple-50 text-purple-700";
  return "border border-slate-300 bg-slate-50 text-slate-600";
}

function roleClass(role: AssignableRole) {
  if (role === "Investigator") return "border border-blue-300 bg-blue-50 text-blue-700";
  if (role === "Lab Technician") return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  if (role === "Lawyer") return "border border-amber-300 bg-amber-50 text-amber-700";
  if (role === "Judge") return "border border-purple-300 bg-purple-50 text-purple-700";
  return "border border-slate-300 bg-slate-50 text-slate-600";
}