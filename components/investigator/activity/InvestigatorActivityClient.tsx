"use client";

import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/ui/Pagination";
import type { InvestigatorActivityLog } from "@/models/investigator-activity.model";
import {
  FilterSkeleton,
  PageHeaderSkeleton,
  StatCardsSkeleton,
  TableSkeleton,
} from "@/components/ui/LoadingSkeletons";
import StatusBadge from "@/components/ui/StatusBadge";

const PAGE_SIZE = 10;

export default function InvestigatorActivityClient() {
  const [logs, setLogs] = useState<InvestigatorActivityLog[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [entityFilter, setEntityFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadActivity() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/investigator/activity", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setLogs([]);
        setError(data.message || "Failed to load activity logs.");
      } else {
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch {
      setLogs([]);
      setError("Could not connect to server.");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadActivity();
  }, []);

  const entityTypes = useMemo(() => {
    return Array.from(
      new Set(logs.map((log) => log.entity_type).filter(Boolean))
    ) as string[];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return logs.filter((log) => {
      const text = `${log.action} ${log.entity_type || ""} ${
        log.entity_id || ""
      } ${log.status} ${log.details || ""} ${
        log.ip_address || ""
      }`.toLowerCase();

      const matchSearch = text.includes(keyword);

      const matchStatus =
        statusFilter === "All" || log.status === statusFilter;

      const matchEntity =
        entityFilter === "All" || log.entity_type === entityFilter;

      return matchSearch && matchStatus && matchEntity;
    });
  }, [logs, search, statusFilter, entityFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, entityFilter]);

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  const total = logs.length;
  const success = logs.filter((log) => log.status === "Success").length;
  const failed = logs.filter((log) => log.status === "Failed").length;
  const warnings = logs.filter((log) => log.status === "Warning").length;

  if (loading) {
    return (
      <div className="space-y-6 text-slate-950">
        <PageHeaderSkeleton tone="blue" />
        <StatCardsSkeleton count={4} />
        <FilterSkeleton />
        <TableSkeleton columns={6} rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-950">
      <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-slate-950 via-blue-900 to-blue-600 p-7 text-white shadow-xl shadow-blue-200/70">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-200">
            Investigator
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            📜 My Activity
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50">
            Review your investigation actions, evidence submissions, failed
            actions, and blockchain-related audit events.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Logs" value={total} color="text-slate-950" />
        <StatCard label="Success" value={success} color="text-emerald-600" />
        <StatCard label="Warnings" value={warnings} color="text-amber-600" />
        <StatCard label="Failed" value={failed} color="text-red-600" />
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <section className="glass-card rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search action, details, entity, IP..."
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option>All</option>
            <option>Success</option>
            <option>Warning</option>
            <option>Failed</option>
            <option>Critical</option>
          </select>

          <select
            value={entityFilter}
            onChange={(event) => setEntityFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option>All</option>
            {entityTypes.map((entity) => (
              <option key={entity}>{entity}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="glass-card overflow-hidden rounded-2xl">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-bold text-slate-950">
            Activity Timeline
          </h2>

          <p className="text-sm text-slate-500">
            Showing {filteredLogs.length} matching activity record
            {filteredLogs.length === 1 ? "" : "s"}.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-500">
              <tr>
                <th className="p-4">Action</th>
                <th className="p-4">Entity</th>
                <th className="p-4">Status</th>
                <th className="p-4">Details</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>

            <tbody>
              {paginatedLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-t border-slate-200 transition hover:bg-blue-50/60"
                >
                  <td className="p-4">
                    <p className="font-semibold text-slate-950">
                      {log.action}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      #{log.id} • {log.actor_name || "Unknown"}
                    </p>
                  </td>

                  <td className="p-4">
                    <p className="font-semibold text-slate-800">
                      {log.entity_type || "-"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {log.entity_id || "-"}
                    </p>
                  </td>

                  <td className="p-4">
                  <StatusBadge status={log.status} variant="activity" />
                  </td>

                  <td className="max-w-[420px] p-4 text-slate-600">
                    <p className="line-clamp-3">{log.details || "-"}</p>
                  </td>

                  <td className="p-4 font-mono text-xs text-slate-500">
                    {log.ip_address || "-"}
                  </td>

                  <td className="p-4 text-slate-500">
                    {formatDate(log.created_at)}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
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

function formatDate(value: string) {
  if (!value) return "-";

  return new Date(value).toLocaleString();
}

