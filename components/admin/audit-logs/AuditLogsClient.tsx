"use client";

import { useEffect, useMemo, useState } from "react";
import type { AuditLogRecord } from "@/models/audit-log.model";
import AuditLogDetailsModal from "./AuditLogDetailsModal";
import Pagination from "@/components/ui/Pagination";

const PAGE_SIZE = 10;

export default function AuditLogsClient() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  async function loadLogs() {
    setLoading(true);

    const res = await fetch("/api/admin/audit-logs", {
      cache: "no-store",
    });

    const data = await res.json();

    if (Array.isArray(data)) {
      setLogs(data);
    } else {
      setLogs([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const roles = useMemo(() => {
    const uniqueRoles = logs.map((log) => log.actor_role).filter(Boolean);
    return ["All", ...Array.from(new Set(uniqueRoles))];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const text = `${log.actor_name ?? ""} ${log.actor_role ?? ""} ${
        log.action
      } ${log.entity_type ?? ""} ${log.entity_id ?? ""} ${
        log.details ?? ""
      }`.toLowerCase();

      const matchSearch = text.includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "All" || log.status === statusFilter;
      const matchRole = roleFilter === "All" || log.actor_role === roleFilter;

      return matchSearch && matchStatus && matchRole;
    });
  }, [logs, search, statusFilter, roleFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, roleFilter]);

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  const totalLogs = logs.length;
  const successLogs = logs.filter((log) => log.status === "Success").length;
  const warningLogs = logs.filter((log) => log.status === "Warning").length;
  const failedLogs = logs.filter(
    (log) => log.status === "Failed" || log.status === "Critical"
  ).length;

  return (
    <div className="space-y-6 text-slate-950">
      <div>
        <p className="text-sm font-semibold text-blue-600">System Activity</p>
 
        <p className="mt-1 text-sm text-slate-500">
          Track role-based actions across users, cases, evidence, and lab
          activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Logs" value={totalLogs} color="text-slate-950" />
        <StatCard label="Success" value={successLogs} color="text-emerald-600" />
        <StatCard label="Warning" value={warningLogs} color="text-amber-600" />
        <StatCard label="Failed/Critical" value={failedLogs} color="text-red-600" />
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actor, action, entity, details..."
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option>All</option>
            <option>Success</option>
            <option>Warning</option>
            <option>Failed</option>
            <option>Critical</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            {roles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-slate-500">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Actor</th>
              <th className="p-4">Role</th>
              <th className="p-4">Action</th>
              <th className="p-4">Entity</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
              <th className="p-4 text-right">Details</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500">
                  Loading audit logs...
                </td>
              </tr>
            )}

            {!loading &&
              paginatedLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-t border-slate-200 transition hover:bg-blue-50/60"
                >
                  <td className="p-4 font-semibold text-slate-950">#{log.id}</td>
                  <td className="p-4 text-slate-700">{log.actor_name || "-"}</td>
                  <td className="p-4 text-slate-600">{log.actor_role || "-"}</td>
                  <td className="p-4 font-medium text-slate-800">{log.action}</td>
                  <td className="p-4 text-slate-600">
                    {log.entity_type || "-"}
                    {log.entity_id ? ` #${log.entity_id}` : ""}
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                        log.status
                      )}`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString()
                      : "-"}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              ))}

            {!loading && filteredLogs.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500">
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <AuditLogDetailsModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
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

function statusClass(status: string) {
  if (status === "Success") return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  if (status === "Warning") return "border border-amber-300 bg-amber-50 text-amber-700";
  if (status === "Failed") return "border border-red-300 bg-red-50 text-red-700";
  if (status === "Critical") return "border border-purple-300 bg-purple-50 text-purple-700";
  return "border border-slate-300 bg-slate-50 text-slate-600";
}