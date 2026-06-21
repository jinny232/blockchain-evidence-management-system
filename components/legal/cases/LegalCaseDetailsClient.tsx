"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LegalCaseDetails } from "@/models/legal-case.model";

export default function LegalCaseDetailsClient({
  caseId,
}: {
  caseId: string;
}) {
  const [legalCase, setLegalCase] = useState<LegalCaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCaseDetails() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/legal/cases/${caseId}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setLegalCase(null);
        setError(data.message || "Failed to load legal case details.");
      } else {
        setLegalCase(data);
      }
    } catch {
      setLegalCase(null);
      setError("Could not connect to server.");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCaseDetails();
  }, [caseId]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center text-slate-500">
        Loading legal case details...
      </div>
    );
  }

  if (error || !legalCase) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error || "Case not found."}
        </div>

        <Link
          href="/legal/cases"
          className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to Case Review
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-950">
      <section className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-slate-950 via-violet-900 to-violet-600 p-7 text-white shadow-xl shadow-violet-200/70">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/legal/cases"
              className="text-sm font-semibold text-violet-100 hover:text-white"
            >
              ← Back to Case Review
            </Link>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              {legalCase.case_code}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-violet-50">
              {legalCase.title}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-4 py-2 text-sm font-bold ${priorityClass(
                legalCase.priority
              )}`}
            >
              {legalCase.priority}
            </span>

            <span
              className={`rounded-full px-4 py-2 text-sm font-bold ${caseStatusClass(
                legalCase.status
              )}`}
            >
              {legalCase.status}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <InfoCard label="Total Evidence" value={String(legalCase.evidence_count || 0)} />
        <InfoCard label="Analyzed Evidence" value={String(legalCase.analyzed_evidence_count || 0)} />
        <InfoCard label="Lab Reports" value={String(legalCase.lab_report_count || 0)} />
        <InfoCard label="Lead Investigator" value={legalCase.lead_investigator || "-"} />
      </section>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-xl font-bold text-slate-950">Case Description</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {legalCase.description || "No description provided."}
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-xl font-bold text-slate-950">Assigned Team</h2>

          {legalCase.team.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No team members assigned.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {legalCase.team.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="font-bold text-slate-950">
                    {member.full_name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {member.role} • @{member.username}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-3xl p-6 xl:col-span-2">
          <h2 className="text-xl font-bold text-slate-950">
            Legal Readiness
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <ReadinessCard
              title="Evidence"
              value={legalCase.evidence_count > 0 ? "Available" : "Missing"}
              good={legalCase.evidence_count > 0}
            />
            <ReadinessCard
              title="Lab Analysis"
              value={legalCase.analyzed_evidence_count > 0 ? "Available" : "Pending"}
              good={legalCase.analyzed_evidence_count > 0}
            />
            <ReadinessCard
              title="Lab Report"
              value={legalCase.lab_report_count > 0 ? "Available" : "Pending"}
              good={legalCase.lab_report_count > 0}
            />
          </div>
        </div>
      </section>

      <section className="glass-card overflow-hidden rounded-3xl">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-bold text-slate-950">
            Case Evidence
          </h2>
          <p className="text-sm text-slate-500">
            Review file hash, IPFS CID, and blockchain transaction proof.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Evidence</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Submitted By</th>
                <th className="p-4">Blockchain</th>
                <th className="p-4">Hash</th>
              </tr>
            </thead>

            <tbody>
              {legalCase.evidence.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No evidence found for this case.
                  </td>
                </tr>
              ) : (
                legalCase.evidence.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-slate-200 transition hover:bg-violet-50/60"
                  >
                    <td className="p-4 font-bold text-slate-950">
                      #{item.id}
                    </td>

                    <td className="p-4 text-slate-700">
                      {item.evidence_type}
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

                    <td className="p-4 text-slate-600">
                      {item.submitted_by || "-"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${blockchainStatusClass(
                          item.blockchain_status
                        )}`}
                      >
                        {item.blockchain_status || "Not Recorded"}
                      </span>
                    </td>

                    <td className="max-w-[220px] truncate p-4 font-mono text-xs text-slate-500">
                      {item.file_hash}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-xl font-bold text-slate-950">Lab Reports</h2>

        {legalCase.labReports.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
            No lab reports submitted yet.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {legalCase.labReports.map((report) => (
              <div
                key={report.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-bold text-slate-950">
                      Report #{report.id} • Evidence #{report.evidence_id}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {report.analysis_type || "General Analysis"} by{" "}
                      {report.analyzed_by}
                    </p>
                  </div>

                  <span className="text-xs text-slate-400">
                    {formatDate(report.created_at)}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {report.result}
                </p>

                <p className="mt-4 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700">
                  Conclusion: {report.conclusion || "-"}
                </p>

                {report.attachment_name && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
                    <p className="font-semibold text-slate-950">
                      Attachment: {report.attachment_name}
                    </p>

                    <p className="mt-2 break-all font-mono text-xs text-slate-500">
                      Attachment SHA-256: {report.attachment_hash || "-"}
                    </p>

                    <p className="mt-1 break-all font-mono text-xs text-slate-500">
                      Attachment IPFS CID: {report.attachment_ipfs_cid || "-"}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <h2 className="mt-2 break-words text-lg font-bold text-slate-950">
        {value}
      </h2>
    </div>
  );
}

function ReadinessCard({
  title,
  value,
  good,
}: {
  title: string;
  value: string;
  good: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        good
          ? "border-emerald-200 bg-emerald-50"
          : "border-amber-200 bg-amber-50"
      }`}
    >
      <p className={good ? "text-emerald-700" : "text-amber-700"}>{title}</p>
      <p
        className={`mt-2 font-bold ${
          good ? "text-emerald-800" : "text-amber-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function priorityClass(priority: string) {
  if (priority === "Urgent") return "border border-red-300 bg-red-50 text-red-700";
  if (priority === "High") return "border border-orange-300 bg-orange-50 text-orange-700";
  if (priority === "Medium") return "border border-amber-300 bg-amber-50 text-amber-700";
  return "border border-slate-300 bg-slate-50 text-slate-600";
}

function caseStatusClass(status: string) {
  if (status === "Open") return "border border-blue-300 bg-blue-50 text-blue-700";
  if (status === "In Progress") return "border border-amber-300 bg-amber-50 text-amber-700";
  if (status === "Closed") return "border border-slate-300 bg-slate-50 text-slate-600";
  return "border border-slate-300 bg-slate-50 text-slate-600";
}

function evidenceStatusClass(status: string) {
  if (status === "Pending") return "border border-amber-300 bg-amber-50 text-amber-700";
  if (status === "Accepted") return "border border-blue-300 bg-blue-50 text-blue-700";
  if (status === "Analyzed") return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  if (status === "Rejected") return "border border-red-300 bg-red-50 text-red-700";
  return "border border-slate-300 bg-slate-50 text-slate-600";
}

function blockchainStatusClass(status: string | null) {
  if (status === "Recorded") return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  if (status === "Failed") return "border border-red-300 bg-red-50 text-red-700";
  return "border border-slate-300 bg-slate-50 text-slate-600";
}