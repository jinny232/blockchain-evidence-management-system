"use client";

import type { EvidenceRecord } from "@/models/evidence.model";

interface Props {
  evidence: EvidenceRecord | null;
  onClose: () => void;
}

export default function EvidenceDetailsModal({ evidence, onClose }: Props) {
  if (!evidence) return null;

  function statusClass(status: string) {
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

  const ipfsUrl = evidence.ipfs_cid
    ? `https://gateway.pinata.cloud/ipfs/${evidence.ipfs_cid}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-start justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-md sm:items-center">
      <div className="my-6 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 text-slate-950 shadow-2xl shadow-slate-500/30 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Evidence Monitor
            </p>
            <h2 className="mt-1 text-2xl font-bold">🧾 Evidence Details</h2>
            <p className="mt-1 text-sm text-slate-500">
              Read-only evidence tracking information.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-600 hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Evidence ID" value={`#${evidence.id}`} />
            <Info label="Case ID" value={String(evidence.case_id ?? "-")} />
            <Info label="Evidence Type" value={evidence.evidence_type || "-"} />
            <Info label="Submitted By" value={evidence.submitted_by || "-"} />
            <Info label="User Role" value={evidence.user_role || "-"} />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Status
              </p>
              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                  evidence.status
                )}`}
              >
                {evidence.status}
              </span>
            </div>

            <Info
              label="Created At"
              value={
                evidence.created_at
                  ? new Date(evidence.created_at).toLocaleString()
                  : "-"
              }
            />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                IPFS CID
              </p>

              {ipfsUrl ? (
                <a
                  href={ipfsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block break-all font-mono text-xs text-blue-700 hover:underline"
                >
                  {evidence.ipfs_cid}
                </a>
              ) : (
                <p className="mt-2 text-sm text-slate-700">-</p>
              )}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              File Hash
            </p>
            <p className="break-all rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-blue-700">
              {evidence.file_hash || "-"}
            </p>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Description
            </p>
            <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {evidence.description || "-"}
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-white/90 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}