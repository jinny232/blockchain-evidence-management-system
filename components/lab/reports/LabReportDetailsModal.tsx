"use client";

import type { LabReportItem } from "@/models/lab-report.model";

export default function LabReportDetailsModal({
  report,
  onClose,
}: {
  report: LabReportItem;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="dark-scrollbar max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/90 p-6 backdrop-blur">
          <div>
            <p className="text-sm font-semibold text-emerald-600">
              Lab Report Details
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Report #{report.id}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Evidence #{report.evidence_id} • {report.case_code || "-"}
            </p>
          </div>

          <div className="flex gap-2">
  <a
    href={`/api/lab/reports/${report.id}/pdf`}
    target="_blank"
    rel="noreferrer"
    className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100"
  >
    📄 PDF
  </a>

  <button
    type="button"
    onClick={onClose}
    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
  >
    ✕
  </button>
</div>
        </div>

        <div className="space-y-6 p-6">
          <section className="grid gap-4 md:grid-cols-3">
            <InfoCard
              label="Analysis Type"
              value={report.analysis_type || "General Analysis"}
            />
            <InfoCard label="Conclusion" value={report.conclusion || "-"} />
            <InfoCard label="Created At" value={formatDate(report.created_at)} />
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-bold text-slate-950">
              Analysis Result
            </h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {report.result}
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <InfoCard label="Case Code" value={report.case_code || "-"} />
            <InfoCard label="Case Title" value={report.case_title || "-"} />
            <InfoCard label="Evidence Type" value={report.evidence_type} />
            <InfoCard label="Evidence Status" value={report.evidence_status} />
            <InfoCard label="Submitted By" value={report.submitted_by || "-"} />
            <InfoCard
              label="Blockchain Status"
              value={report.blockchain_status || "Not Recorded"}
            />
          </section>

          <section className="space-y-4">
            <ProofBox title="SHA-256 File Hash" value={report.file_hash} />
            <ProofBox
              title="Blockchain Transaction Hash"
              value={report.blockchain_tx_hash || "-"}
            />
            <ProofBox title="IPFS CID" value={report.ipfs_cid || "-"} />
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
      <p className="text-sm font-semibold text-emerald-300">{title}</p>
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