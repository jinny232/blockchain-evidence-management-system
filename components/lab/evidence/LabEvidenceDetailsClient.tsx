"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { LabEvidenceDetails } from "@/models/lab-evidence.model";
import { DetailsPageSkeleton } from "@/components/ui/LoadingSkeletons";
import StatusBadge from "@/components/ui/StatusBadge";
import EvidenceTimeline from "@/components/evidence/EvidenceTimeline";

export default function LabEvidenceDetailsClient({
  evidenceId,
}: {
  evidenceId: string;
}) {
  const [evidence, setEvidence] = useState<LabEvidenceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);

  const [analysisType, setAnalysisType] = useState("General Analysis");
  const [result, setResult] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState("");

  async function loadEvidence() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/lab/evidence/${evidenceId}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setEvidence(null);
        setError(data.message || "Failed to load evidence details.");
      } else {
        setEvidence(data);
      }
    } catch {
      setEvidence(null);
      setError("Could not connect to server.");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadEvidence();
  }, [evidenceId]);

  async function handleAccept() {
    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/lab/evidence/${evidenceId}/accept`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to accept evidence.");
      } else {
        setSuccess("Evidence accepted successfully.");
        await loadEvidence();
      }
    } catch {
      setError("Could not connect to server.");
    }

    setActionLoading(false);
  }

  async function handleSubmitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      formData.append("analysis_type", analysisType);
      formData.append("result", result);
      formData.append("conclusion", conclusion);

      if (attachment) {
        formData.append("attachment", attachment);
      }

      const res = await fetch(`/api/lab/evidence/${evidenceId}/report`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to submit lab report.");
      } else {
        setSuccess("Lab report submitted successfully.");
        setShowReportForm(false);
        setResult("");
        setConclusion("");
        setAttachment(null);
        await loadEvidence();
      }
    } catch {
      setError("Could not connect to server.");
    }

    setActionLoading(false);
  }

  async function copyText(label: string, value: string | null) {
    if (!value || value === "-") return;

    await navigator.clipboard.writeText(value);
    setCopied(label);

    setTimeout(() => setCopied(""), 1500);
  }

  function handleAttachmentChange(file: File | null) {
    setError("");

    if (!file) {
      setAttachment(null);
      return;
    }

    const lowerName = file.name.toLowerCase();

    const blockedExtensions = [
      ".exe",
      ".bat",
      ".cmd",
      ".sh",
      ".js",
      ".msi",
      ".dll",
    ];

    const isBlocked = blockedExtensions.some((ext) =>
      lowerName.endsWith(ext)
    );

    if (isBlocked) {
      setAttachment(null);
      setError("Executable files are not allowed for lab reports.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setAttachment(null);
      setError("Attachment is too large. Maximum size is 25MB.");
      return;
    }

    setAttachment(file);
  }

  if (loading) {
  return <DetailsPageSkeleton tone="emerald" />;
  }

  if (error && !evidence) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>

        <Link
          href="/lab/evidence"
          className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to Evidence Queue
        </Link>
      </div>
    );
  }

  if (!evidence) return null;

  return (
    <div className="space-y-6 text-slate-950">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-slate-950 via-emerald-900 to-emerald-600 p-7 text-white shadow-xl shadow-emerald-200/70">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/lab/evidence"
              className="text-sm font-semibold text-emerald-100 hover:text-white"
            >
              ← Back to Evidence Queue
            </Link>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Evidence #{evidence.id}
            </h1>

            <p className="mt-2 text-sm text-emerald-50">
              {evidence.case_code || "-"} • {evidence.case_title || "-"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status={evidence.status} variant="evidence" size="md" />

            {evidence.status === "Pending" && (
              <button
                type="button"
                onClick={handleAccept}
                disabled={actionLoading}
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 disabled:opacity-60"
              >
                {actionLoading ? "Accepting..." : "✅ Accept Evidence"}
              </button>
            )}

            {evidence.status === "Accepted" && (
              <button
                type="button"
                onClick={() => setShowReportForm(true)}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
              >
                🧪 Submit Report
              </button>
            )}
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Evidence Type" value={evidence.evidence_type} />
        <InfoCard label="Submitted By" value={evidence.submitted_by || "-"} />
        <InfoCard label="Created At" value={formatDate(evidence.created_at)} />
      </section>
    
      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-xl font-bold text-slate-950">Description</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {evidence.description || "No description provided."}
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <ProofBox
          title="SHA-256 File Hash"
          value={evidence.file_hash}
          buttonLabel={copied === "hash" ? "Copied" : "Copy Hash"}
          onCopy={() => copyText("hash", evidence.file_hash)}
        />

        <ProofBox
          title="Blockchain Transaction Hash"
          value={evidence.blockchain_tx_hash || "-"}
          buttonLabel={copied === "tx" ? "Copied" : "Copy Tx"}
          onCopy={() => copyText("tx", evidence.blockchain_tx_hash)}
        />

        <ProofBox
          title="IPFS CID"
          value={evidence.ipfs_cid || "-"}
          buttonLabel={copied === "ipfs" ? "Copied" : "Copy CID"}
          onCopy={() => copyText("ipfs", evidence.ipfs_cid)}
        />

        <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-xl">
          <p className="text-sm font-semibold text-cyan-300">
            Blockchain Proof
          </p>
          <h2 className="mt-2 text-xl font-bold">
            {evidence.blockchain_status || "Not Recorded"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Transaction hash proves the investigator-submitted evidence hash was
            recorded on Ganache.
          </p>
        </div>
      </section>

      {showReportForm && (
        <section className="glass-card rounded-3xl p-6">
          <h2 className="text-xl font-bold text-slate-950">
            Submit Lab Report
          </h2>

          <form onSubmit={handleSubmitReport} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Analysis Type
              </label>
              <input
                value={analysisType}
                onChange={(event) => setAnalysisType(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Result
              </label>
              <textarea
                value={result}
                onChange={(event) => setResult(event.target.value)}
                rows={5}
                required
                placeholder="Write lab findings and analysis result..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Conclusion
              </label>
              <input
                value={conclusion}
                onChange={(event) => setConclusion(event.target.value)}
                placeholder="Valid / Tampered / Inconclusive / Match Found..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Report Attachment
              </label>

              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt,.csv,.xlsx"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  handleAttachmentChange(file);
                }}
                className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:border-emerald-400"
              />

              <p className="mt-2 text-xs text-slate-500">
                Allowed: PDF, image, DOC/DOCX, TXT, CSV, XLSX. Maximum size:
                25MB. Executable files are blocked.
              </p>

              {attachment && (
                <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  Selected: {attachment.name} ({formatFileSize(attachment.size)}
                  )
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={actionLoading}
                className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-60"
              >
                {actionLoading ? "Submitting..." : "Submit Report"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowReportForm(false);
                  setAttachment(null);
                }}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <EvidenceTimeline evidenceId={evidenceId} tone="emerald" />

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-xl font-bold text-slate-950">Lab Reports</h2>

        {evidence.reports.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
            No lab report submitted yet.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {evidence.reports.map((report) => (
              <div
                key={report.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-bold text-slate-950">
                      {report.analysis_type || "General Analysis"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      By {report.analyzed_by}
                    </p>
                  </div>

                  <span className="text-xs text-slate-400">
                    {formatDate(report.created_at)}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {report.result}
                </p>

                <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  Conclusion: {report.conclusion || "-"}
                </p>

                {report.attachment_name && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
                    <p className="font-semibold text-slate-950">
                      Attachment: {report.attachment_name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Type: {report.attachment_mime_type || "-"} • Size:{" "}
                      {formatFileSize(report.attachment_size || 0)}
                    </p>

                    <p className="mt-2 break-all font-mono text-xs text-slate-500">
                      SHA-256: {report.attachment_hash || "-"}
                    </p>

                    <p className="mt-1 break-all font-mono text-xs text-slate-500">
                      IPFS CID: {report.attachment_ipfs_cid || "-"}
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

function ProofBox({
  title,
  value,
  buttonLabel,
  onCopy,
}: {
  title: string;
  value: string;
  buttonLabel: string;
  onCopy: () => void;
}) {
  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-600">{title}</p>
          <p className="mt-3 break-all font-mono text-sm leading-6 text-slate-700">
            {value || "-"}
          </p>
        </div>

        <button
          type="button"
          onClick={onCopy}
          disabled={!value || value === "-"}
          className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatFileSize(size: number) {
  if (!size) return "-";

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

