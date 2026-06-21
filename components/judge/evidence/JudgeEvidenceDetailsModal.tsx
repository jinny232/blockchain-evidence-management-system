"use client";

import type { JudgeEvidenceDetails } from "@/models/judge-evidence.model";
import EvidenceTimeline from "@/components/evidence/EvidenceTimeline";

export default function JudgeEvidenceDetailsModal({
  evidence,
  onClose,
}: {
  evidence: JudgeEvidenceDetails;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="dark-scrollbar max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/90 p-6 backdrop-blur">
          <div>
            <p className="text-sm font-semibold text-amber-600">
              Judge Evidence Review
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Evidence #{evidence.id}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {evidence.case_code || "-"} • {evidence.case_title || "-"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 p-6">
          <section className="grid gap-4 md:grid-cols-4">
            <InfoCard label="Evidence Type" value={evidence.evidence_type} />
            <InfoCard label="Status" value={evidence.status} />
            <InfoCard label="Submitted By" value={evidence.submitted_by || "-"} />
            <InfoCard label="Created At" value={formatDate(evidence.created_at)} />
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-bold text-slate-950">Description</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {evidence.description || "No description provided."}
            </p>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <ProofBox title="SHA-256 File Hash" value={evidence.file_hash} />
            <ProofBox
              title="Blockchain Transaction Hash"
              value={evidence.blockchain_tx_hash || "-"}
            />
            <ProofBox title="IPFS CID" value={evidence.ipfs_cid || "-"} />

            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
              <p className="text-sm font-semibold text-amber-300">
                Blockchain Status
              </p>
              <h3 className="mt-3 text-xl font-bold">
                {evidence.blockchain_status || "Not Recorded"}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                This helps the judge verify the evidence file hash recorded on
                blockchain.
              </p>
            </div>
          </section>

          <EvidenceTimeline evidenceId={evidence.id} tone="amber" />

          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <h3 className="text-xl font-bold text-slate-950">Lab Reports</h3>

            {evidence.reports.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                No lab report attached yet.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {evidence.reports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <p className="font-bold text-slate-950">
                      Report #{report.id}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {report.analysis_type || "General Analysis"} by{" "}
                      {report.analyzed_by}
                    </p>

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
                        <p className="mt-2 break-all font-mono text-xs text-slate-500">
                          Attachment SHA-256: {report.attachment_hash || "-"}
                        </p>
                        <p className="mt-1 break-all font-mono text-xs text-slate-500">
                          Attachment IPFS CID:{" "}
                          {report.attachment_ipfs_cid || "-"}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 break-words font-bold text-slate-950">{value}</p>
    </div>
  );
}

function ProofBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
      <p className="text-sm font-semibold text-amber-300">{title}</p>
      <p className="mt-3 break-all font-mono text-sm leading-6 text-slate-200">
        {value}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}