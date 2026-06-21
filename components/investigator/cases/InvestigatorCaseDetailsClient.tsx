"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/ui/Pagination";
import type {
  InvestigatorCaseDetailResponse,
  InvestigatorCaseTeamMember,
  InvestigatorTeamRole,
} from "@/models/investigator-case.model";

const roles: InvestigatorTeamRole[] = [
  "Investigator",
  "Lab Technician",
  "Lawyer",
  "Judge",
];

const EVIDENCE_PAGE_SIZE = 10;

export default function InvestigatorCaseDetailsClient({
  caseId,
}: {
  caseId: string;
}) {
  const [data, setData] = useState<InvestigatorCaseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [evidencePage, setEvidencePage] = useState(1);

  async function loadCaseDetails() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/investigator/cases/${caseId}`, {
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok) {
        setData(null);
        setError(json.message || "Failed to load case details.");
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
    loadCaseDetails();
  }, [caseId]);

  useEffect(() => {
    setEvidencePage(1);
  }, [caseId]);

  const groupedTeam = useMemo(() => {
    const grouped: Record<InvestigatorTeamRole, InvestigatorCaseTeamMember[]> = {
      Investigator: [],
      "Lab Technician": [],
      Lawyer: [],
      Judge: [],
    };

    if (!data) return grouped;

    data.team.forEach((member) => {
      if (member.role in grouped) {
        grouped[member.role].push(member);
      }
    });

    return grouped;
  }, [data]);

  const totalEvidencePages = data
    ? Math.ceil(data.evidence.length / EVIDENCE_PAGE_SIZE)
    : 0;

  const paginatedEvidence = useMemo(() => {
    if (!data) return [];

    const start = (evidencePage - 1) * EVIDENCE_PAGE_SIZE;

    return data.evidence.slice(start, start + EVIDENCE_PAGE_SIZE);
  }, [data, evidencePage]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center text-slate-500">
        Loading case details...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error || "Could not load case details."}
        </div>

        <Link
          href="/investigator/cases"
          className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to My Cases
        </Link>
      </div>
    );
  }

  const caseRecord = data.caseRecord;

  const pendingEvidence = data.evidence.filter(
    (item) => item.status === "Pending"
  ).length;

  const analyzedEvidence = data.evidence.filter(
    (item) => item.status === "Analyzed"
  ).length;

  return (
    <div className="space-y-6 text-slate-950">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href="/investigator/cases"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to My Cases
          </Link>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {caseRecord.case_code}
          </h1>

          <p className="mt-1 text-sm text-slate-500">{caseRecord.title}</p>
        </div>

        <Link
          href={`/investigator/evidence/submit?caseId=${caseRecord.id}`}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
        >
          ➕ Submit Evidence
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Evidence"
          value={data.evidence.length}
          color="text-slate-950"
        />
        <StatCard
          label="Pending"
          value={pendingEvidence}
          color="text-amber-600"
        />
        <StatCard
          label="Analyzed"
          value={analyzedEvidence}
          color="text-emerald-600"
        />
        <StatCard
          label="Team Members"
          value={data.team.length}
          color="text-blue-600"
        />
      </section>

      <section className="glass-card rounded-3xl p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Case Information
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              {caseRecord.title}
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              {caseRecord.description || "No description provided."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass(
                caseRecord.priority
              )}`}
            >
              {caseRecord.priority}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${caseStatusClass(
                caseRecord.status
              )}`}
            >
              {caseRecord.status}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <InfoBox
            label="Lead Investigator"
            value={caseRecord.lead_investigator || "-"}
          />
          <InfoBox label="Created At" value={formatDate(caseRecord.created_at)} />
          <InfoBox label="Updated At" value={formatDate(caseRecord.updated_at)} />
        </div>
      </section>

      <section className="glass-card rounded-3xl p-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-950">Assigned Team</h2>
          <p className="text-sm text-slate-500">
            Read-only team members assigned to this case.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roles.map((role) => {
            const members = groupedTeam[role];

            return (
              <div
                key={role}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-800">
                    {role}
                  </h3>

                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${roleClass(
                      role
                    )}`}
                  >
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
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Case Evidence</h2>
            <p className="text-sm text-slate-500">
              Evidence records connected with this case.
            </p>
          </div>

          <p className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
            Total: {data.evidence.length}
          </p>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-slate-500">
            <tr>
              <th className="p-4">Evidence</th>
              <th className="p-4">Type</th>
              <th className="p-4">Submitted By</th>
              <th className="p-4">Hash</th>
              <th className="p-4">IPFS CID</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
            </tr>
          </thead>

          <tbody>
            {data.evidence.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  No evidence submitted for this case yet.
                </td>
              </tr>
            ) : (
              paginatedEvidence.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-200 transition hover:bg-blue-50/60"
                >
                  <td className="p-4 font-semibold text-slate-950">
                    #{item.id}
                  </td>
                  <td className="p-4 text-slate-700">{item.evidence_type}</td>
                  <td className="p-4 text-slate-600">
                    {item.submitted_by || "-"}
                  </td>
                  <td className="max-w-[180px] truncate p-4 font-mono text-xs text-slate-500">
                    {item.file_hash || "-"}
                  </td>
                  <td className="max-w-[180px] truncate p-4 font-mono text-xs text-slate-500">
                    {item.ipfs_cid || "-"}
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
                  <td className="p-4 text-slate-500">
                    {formatDate(item.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={evidencePage}
          totalPages={totalEvidencePages}
          onPageChange={setEvidencePage}
        />
      </section>

      <section className="glass-card rounded-3xl p-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-950">
            Recent Case Activity
          </h2>
          <p className="text-sm text-slate-500">
            Latest audit activity related to this case.
          </p>
        </div>

        {data.auditLogs.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No activity found for this case.
          </p>
        ) : (
          <div className="space-y-3">
            {data.auditLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {log.action}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {log.actor_name || "Unknown"} • {log.actor_role || "-"}
                    </p>
                    {log.details && (
                      <p className="mt-2 text-sm text-slate-600">
                        {log.details}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${auditStatusClass(
                        log.status
                      )}`}
                    >
                      {log.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "-";

  return new Date(value).toLocaleString();
}

function priorityClass(priority: string) {
  if (priority === "Low") {
    return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  }

  if (priority === "Medium") {
    return "border border-amber-300 bg-amber-50 text-amber-700";
  }

  if (priority === "High") {
    return "border border-orange-300 bg-orange-50 text-orange-700";
  }

  if (priority === "Urgent") {
    return "border border-red-300 bg-red-50 text-red-700";
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
    return "border border-emerald-300 bg-emerald-50 text-emerald-700";
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

function auditStatusClass(status: string) {
  if (status === "Success") {
    return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  }

  if (status === "Warning") {
    return "border border-amber-300 bg-amber-50 text-amber-700";
  }

  if (status === "Failed") {
    return "border border-red-300 bg-red-50 text-red-700";
  }

  if (status === "Critical") {
    return "border border-purple-300 bg-purple-50 text-purple-700";
  }

  return "border border-slate-300 bg-slate-50 text-slate-600";
}

function roleClass(role: InvestigatorTeamRole) {
  if (role === "Investigator") {
    return "border border-blue-300 bg-blue-50 text-blue-700";
  }

  if (role === "Lab Technician") {
    return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  }

  if (role === "Lawyer") {
    return "border border-amber-300 bg-amber-50 text-amber-700";
  }

  if (role === "Judge") {
    return "border border-purple-300 bg-purple-50 text-purple-700";
  }

  return "border border-slate-300 bg-slate-50 text-slate-600";
}