"use client";

import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/ui/Pagination";
import type {
  LegalEvidenceDetails,
  LegalEvidenceItem,
} from "@/models/legal-evidence.model";
import LegalEvidenceDetailsModal from "@/components/legal/evidence/LegalEvidenceDetailsModal";

const PAGE_SIZE = 10;

export default function LegalEvidenceClient() {
  const [evidence, setEvidence] = useState<LegalEvidenceItem[]>([]);
  const [selectedEvidence, setSelectedEvidence] =
    useState<LegalEvidenceDetails | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [blockchainFilter, setBlockchainFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [detailsLoadingId, setDetailsLoadingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function loadEvidence() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/legal/evidence", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setEvidence([]);
        setError(data.message || "Failed to load legal evidence.");
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

  async function openDetails(id: number) {
    setDetailsLoadingId(id);
    setError("");

    try {
      const res = await fetch(`/api/legal/evidence/${id}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load evidence details.");
      } else {
        setSelectedEvidence(data);
      }
    } catch {
      setError("Could not connect to server.");
    }

    setDetailsLoadingId(null);
  }

  const evidenceTypes = useMemo(() => {
    return Array.from(
      new Set(evidence.map((item) => item.evidence_type).filter(Boolean))
    );
  }, [evidence]);

  const filteredEvidence = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return evidence.filter((item) => {
      const text = `${item.id} ${item.case_code || ""} ${
        item.case_title || ""
      } ${item.evidence_type} ${item.description || ""} ${
        item.file_hash
      } ${item.ipfs_cid || ""} ${item.blockchain_tx_hash || ""} ${
        item.submitted_by || ""
      } ${item.latest_conclusion || ""}`.toLowerCase();

      const matchSearch = text.includes(keyword);
      const matchStatus =
        statusFilter === "All" || item.status === statusFilter;
      const matchType =
        typeFilter === "All" || item.evidence_type === typeFilter;
      const matchBlockchain =
        blockchainFilter === "All" ||
        (item.blockchain_status || "Not Recorded") === blockchainFilter;

      return matchSearch && matchStatus && matchType && matchBlockchain;
    });
  }, [evidence, search, statusFilter, typeFilter, blockchainFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter, blockchainFilter]);

  const totalPages = Math.ceil(filteredEvidence.length / PAGE_SIZE);

  const paginatedEvidence = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEvidence.slice(start, start + PAGE_SIZE);
  }, [filteredEvidence, currentPage]);

  const total = evidence.length;
  const pending = evidence.filter((item) => item.status === "Pending").length;
  const analyzed = evidence.filter((item) => item.status === "Analyzed").length;
  const recorded = evidence.filter(
    (item) => item.blockchain_status === "Recorded"
  ).length;

  return (
    <div className="space-y-6 text-slate-950">
      <section className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-700 via-indigo-800 to-slate-950 p-7 text-white shadow-xl shadow-violet-200/70">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="relative">
          <p className="text-sm font-semibold text-violet-100">
            Legal Evidence Review
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            🧾 Evidence Review
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-50">
            Review evidence, blockchain proof, IPFS CID, and lab conclusions
            from cases assigned to you.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Evidence" value={total} color="text-slate-950" />
        <StatCard label="Pending" value={pending} color="text-amber-600" />
        <StatCard label="Analyzed" value={analyzed} color="text-emerald-600" />
        <StatCard label="Blockchain Recorded" value={recorded} color="text-violet-600" />
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <section className="glass-card rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search evidence, case, hash, CID..."
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
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
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          >
            <option>All</option>
            {evidenceTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          <select
            value={blockchainFilter}
            onChange={(event) => setBlockchainFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          >
            <option>All</option>
            <option>Recorded</option>
            <option>Not Recorded</option>
            <option>Failed</option>
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
              <th className="p-4">Lab Reports</th>
              <th className="p-4">Conclusion</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500">
                  Loading legal evidence...
                </td>
              </tr>
            )}

            {!loading &&
              paginatedEvidence.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-200 transition hover:bg-violet-50/60"
                >
                  <td className="p-4">
                    <p className="font-bold text-slate-950">#{item.id}</p>
                    <p className="mt-1 max-w-[180px] truncate font-mono text-xs text-slate-500">
                      {item.file_hash}
                    </p>
                  </td>

                  <td className="p-4">
                    <p className="font-semibold text-slate-800">
                      {item.case_code || "-"}
                    </p>
                    <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500">
                      {item.case_title || "-"}
                    </p>
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

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${blockchainStatusClass(
                        item.blockchain_status
                      )}`}
                    >
                      {item.blockchain_status || "Not Recorded"}
                    </span>
                  </td>

                  <td className="p-4 text-slate-700">
                    {Number(item.lab_report_count || 0)}
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${conclusionClass(
                        item.latest_conclusion
                      )}`}
                    >
                      {item.latest_conclusion || "No Conclusion"}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => openDetails(item.id)}
                      disabled={detailsLoadingId === item.id}
                      className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100 disabled:opacity-60"
                    >
                      {detailsLoadingId === item.id ? "Loading..." : "👁️ Review"}
                    </button>
                  </td>
                </tr>
              ))}

            {!loading && filteredEvidence.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500">
                  No legal evidence found.
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

      {selectedEvidence && (
        <LegalEvidenceDetailsModal
          evidence={selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
        />
      )}
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

function evidenceStatusClass(status: string) {
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

function blockchainStatusClass(status: string | null) {
  if (status === "Recorded") {
    return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  }

  if (status === "Failed") {
    return "border border-red-300 bg-red-50 text-red-700";
  }

  return "border border-slate-300 bg-slate-50 text-slate-600";
}

function conclusionClass(value: string | null) {
  const text = (value || "").toLowerCase();

  if (text.includes("valid") || text.includes("match")) {
    return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  }

  if (text.includes("tampered") || text.includes("invalid")) {
    return "border border-red-300 bg-red-50 text-red-700";
  }

  if (text.includes("inconclusive")) {
    return "border border-amber-300 bg-amber-50 text-amber-700";
  }

  return "border border-slate-300 bg-slate-50 text-slate-600";
}