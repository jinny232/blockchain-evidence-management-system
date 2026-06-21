"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/ui/Pagination";
import type { LabEvidenceItem } from "@/models/lab-evidence.model";
import {
  FilterSkeleton,
  PageHeaderSkeleton,
  StatCardsSkeleton,
  TableSkeleton,
} from "@/components/ui/LoadingSkeletons";
import StatusBadge from "@/components/ui/StatusBadge";

const PAGE_SIZE = 10;

export default function LabEvidenceClient() {
  const [evidence, setEvidence] = useState<LabEvidenceItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadEvidence() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/lab/evidence", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setEvidence([]);
        setError(data.message || "Failed to load evidence queue.");
      } else {
        setEvidence(Array.isArray(data) ? data : []);
      }
    } catch {
      setEvidence([]);
      setError("Could not connect to server.");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadEvidence();
  }, []);

  async function handleAccept(id: number) {
    setActionLoadingId(id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/lab/evidence/${id}/accept`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to accept evidence.");
      } else {
        setSuccess(`Evidence #${id} accepted successfully.`);
        await loadEvidence();
      }
    } catch {
      setError("Could not connect to server.");
    }

    setActionLoadingId(null);
  }

  const filteredEvidence = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return evidence.filter((item) => {
      const text = `${item.id} ${item.case_code || ""} ${
        item.case_title || ""
      } ${item.evidence_type} ${item.description || ""} ${
        item.file_hash || ""
      } ${item.blockchain_tx_hash || ""}`.toLowerCase();

      const matchSearch = text.includes(keyword);
      const matchStatus =
        statusFilter === "All" || item.status === statusFilter;
      const matchType =
        typeFilter === "All" || item.evidence_type === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [evidence, search, statusFilter, typeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filteredEvidence.length / PAGE_SIZE);

  const paginatedEvidence = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEvidence.slice(start, start + PAGE_SIZE);
  }, [filteredEvidence, currentPage]);

  const types = Array.from(new Set(evidence.map((item) => item.evidence_type)));

  const pending = evidence.filter((item) => item.status === "Pending").length;
  const accepted = evidence.filter((item) => item.status === "Accepted").length;
  const analyzed = evidence.filter((item) => item.status === "Analyzed").length;

  if (loading) {
  return (
    <div className="space-y-6 text-slate-950">
      <PageHeaderSkeleton tone="emerald" />
      <StatCardsSkeleton count={4} />
      <FilterSkeleton />
      <TableSkeleton columns={7} rows={6} />
    </div>
  );
}

  return (
    <div className="space-y-6 text-slate-950">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-950 p-7 text-white shadow-xl shadow-emerald-200/70">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative">
          <p className="text-sm font-semibold text-emerald-100">
            Laboratory Queue
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            🧪 Evidence Queue
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50">
            Review assigned evidence, accept custody, and submit analysis
            results.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Evidence" value={evidence.length} color="text-slate-950" />
        <StatCard label="Pending" value={pending} color="text-amber-600" />
        <StatCard label="Accepted" value={accepted} color="text-blue-600" />
        <StatCard label="Analyzed" value={analyzed} color="text-emerald-600" />
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

      <section className="glass-card rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search case, hash, transaction..."
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          >
            <option>All</option>
            <option>Pending</option>
            <option>Accepted</option>
            <option>Analyzed</option>
            <option>Rejected</option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          >
            <option>All</option>
            {types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="glass-card overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-slate-500">
            <tr>
              <th className="p-4">Evidence</th>
              <th className="p-4">Case</th>
              <th className="p-4">Type</th>
              <th className="p-4">Status</th>
              <th className="p-4">Blockchain</th>
              <th className="p-4">Reports</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
        
            {paginatedEvidence.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-200 transition hover:bg-emerald-50/60"
                >
                  <td className="p-4 font-semibold text-slate-950">
                    #{item.id}
                  </td>

                  <td className="p-4">
                    <p className="font-semibold text-slate-800">
                      {item.case_code || "-"}
                    </p>
                    <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500">
                      {item.case_title || "-"}
                    </p>
                  </td>

                  <td className="p-4 text-slate-700">{item.evidence_type}</td>

                  <td className="p-4">
                   <StatusBadge status={item.status} variant="evidence" />
                  </td>

                  <td className="p-4">
                   <StatusBadge status={item.blockchain_status} variant="blockchain" />
                  </td>

                  <td className="p-4 text-slate-600">
                    {Number(item.report_count || 0)}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      {item.status === "Pending" && (
                        <button
                          type="button"
                          onClick={() => handleAccept(item.id)}
                          disabled={actionLoadingId === item.id}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionLoadingId === item.id ? "Accepting..." : "✅ Accept"}
                        </button>
                      )}

                      <Link
                        href={`/lab/evidence/${item.id}`}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        👁️ Details
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

            {filteredEvidence.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  No evidence found.
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
