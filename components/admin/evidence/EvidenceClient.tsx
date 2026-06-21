"use client";

import { useEffect, useMemo, useState } from "react";
import type { EvidenceRecord } from "@/models/evidence.model";
import EvidenceDetailsModal from "./EvidenceDetailsModal";
import Pagination from "@/components/ui/Pagination";

const PAGE_SIZE = 10;

export default function EvidenceClient() {
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [selectedEvidence, setSelectedEvidence] =
    useState<EvidenceRecord | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  async function loadEvidence() {
    setLoading(true);

    const res = await fetch("/api/admin/evidence", {
      cache: "no-store",
    });

    const data = await res.json();

    if (Array.isArray(data)) {
      setEvidence(data);
    } else {
      setEvidence([]);
    }

    setLoading(false);
  }

  async function openDetails(id: number) {
    const res = await fetch(`/api/admin/evidence/${id}`, {
      cache: "no-store",
    });

    const data = await res.json();

    if (res.ok) {
      setSelectedEvidence(data);
    }
  }

  useEffect(() => {
    loadEvidence();
  }, []);

  const evidenceTypes = useMemo(() => {
    const types = evidence.map((item) => item.evidence_type).filter(Boolean);
    return ["All", ...Array.from(new Set(types))];
  }, [evidence]);

  const filteredEvidence = useMemo(() => {
    return evidence.filter((item) => {
      const text = `${item.case_id} ${item.submitted_by ?? ""} ${
        item.evidence_type
      } ${item.description ?? ""} ${item.file_hash ?? ""}`.toLowerCase();

      const matchSearch = text.includes(search.toLowerCase());
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

  const totalCount = evidence.length;
  const pendingCount = evidence.filter((item) => item.status === "Pending").length;
  const acceptedCount = evidence.filter(
    (item) => item.status === "Accepted"
  ).length;
  const analyzedCount = evidence.filter(
    (item) => item.status === "Analyzed"
  ).length;

  return (
    <div className="space-y-6 text-slate-950">
      <div>
        <p className="text-sm font-semibold text-blue-600">Evidence Monitor</p>
       
        <p className="mt-1 text-sm text-slate-500">
          Monitor evidence records and track role-based actions. Admin cannot
          change evidence status.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Evidence" value={totalCount} color="text-slate-950" />
        <StatCard label="Pending" value={pendingCount} color="text-amber-600" />
        <StatCard label="Accepted" value={acceptedCount} color="text-blue-600" />
        <StatCard label="Analyzed" value={analyzedCount} color="text-emerald-600" />
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search case, uploader, type, hash..."
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option>All</option>
            <option>Pending</option>
            <option>Accepted</option>
            <option>Analyzed</option>
            <option>Rejected</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            {evidenceTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-slate-500">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Case ID</th>
              <th className="p-4">Type</th>
              <th className="p-4">Submitted By</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
              <th className="p-4 text-right">Details</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500">
                  Loading evidence...
                </td>
              </tr>
            )}

            {!loading &&
              paginatedEvidence.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-200 transition hover:bg-blue-50/60"
                >
                  <td className="p-4 font-semibold text-slate-950">#{item.id}</td>
                  <td className="p-4 text-slate-700">{item.case_id}</td>
                  <td className="p-4 text-slate-700">{item.evidence_type}</td>
                  <td className="p-4 text-slate-600">{item.submitted_by || "-"}</td>
                  <td className="p-4 text-slate-600">{item.user_role || "-"}</td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="p-4 text-slate-500">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : "-"}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => openDetails(item.id)}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              ))}

            {!loading && filteredEvidence.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500">
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
      </div>

      <EvidenceDetailsModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
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
  if (status === "Pending") return "border border-amber-300 bg-amber-50 text-amber-700";
  if (status === "Accepted") return "border border-blue-300 bg-blue-50 text-blue-700";
  if (status === "Analyzed") return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  if (status === "Rejected") return "border border-red-300 bg-red-50 text-red-700";
  return "border border-slate-300 bg-slate-50 text-slate-600";
}