"use client";

import type { AuditLogRecord } from "@/models/audit-log.model";

interface Props {
  log: AuditLogRecord | null;
  onClose: () => void;
}

export default function AuditLogDetailsModal({ log, onClose }: Props) {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-start justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-md sm:items-center">
      <div className="my-6 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 text-slate-950 shadow-2xl shadow-slate-500/30 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-blue-600">Audit Trail</p>
            <h2 className="mt-1 text-2xl font-bold">📜 Log Details</h2>
            <p className="mt-1 text-sm text-slate-500">
              Read-only system activity record.
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
            <Info label="Log ID" value={`#${log.id}`} />
            <Info label="Actor Name" value={log.actor_name || "-"} />
            <Info label="Actor Role" value={log.actor_role || "-"} />
            <Info label="Action" value={log.action} />
            <Info label="Entity Type" value={log.entity_type || "-"} />
            <Info label="Entity ID" value={log.entity_id || "-"} />
            <Info label="Status" value={log.status} />
            <Info label="IP Address" value={log.ip_address || "-"} />
            <Info
              label="Created At"
              value={
                log.created_at
                  ? new Date(log.created_at).toLocaleString()
                  : "-"
              }
            />
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Details
            </p>
            <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {log.details || "-"}
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