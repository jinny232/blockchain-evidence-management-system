"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/ui/Pagination";
import type { InvestigatorEvidenceListItem } from "@/models/investigator-evidence.model";

const PAGE_SIZE = 10;

export default function InvestigatorEvidenceClient() {
  const [evidence, setEvidence] = useState<InvestigatorEvidenceListItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [blockchainFilter, setBlockchainFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEvidence() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/investigator/evidence", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setEvidence([]);
        setError(data.message || "Failed to load evidence.");
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

  const types = Array.from(new Set(evidence.map((item) => item.evidence_type)));

  return (
    <div className="space-y-6 text-slate-950">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            Evidence Records
          </p>
          <h1 className="text-3xl font-bold tracking-tight">🧾 My Evidence</h1>
          <p className="mt-1 text-sm text-slate-500">
            View evidence you submitted, including file hash and blockchain
            transaction proof.
          </p>
        </div>

        <Link
          href="/investigator/evidence/submit"
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
        >
          ➕ Submit Evidence
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Evidence" value={total} color="text-slate-950" />
        <StatCard label="Pending" value={pending} color="text-amber-600" />
        <StatCard label="Analyzed" value={analyzed} color="text-emerald-600" />
        <StatCard label="On Blockchain" value={recorded} color="text-blue-600" />
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
            placeholder="Search case, hash, tx hash..."
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
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
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option>All</option>
            {types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          <select
            value={blockchainFilter}
            onChange={(event) => setBlockchainFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
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
              <th className="p-4">Transaction</th>
              <th className="p-4">Created</th>
              <th className="p-4 text-right">Action</th>
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
                  <td className="p-4 font-semibold text-slate-950">
                    #{item.id}
                  </td>

                  <td className="p-4">
                    <p className="font-semibold text-slate-800">
                      {item.case_code || "-"}
                    </p>
                    <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500">
                      {item.case_title || "No case title"}
                    </p>
                  </td>

                  <td className="p-4 text-slate-700">{item.evidence_type}</td>

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

                  <td className="max-w-[170px] truncate p-4 font-mono text-xs text-slate-500">
                    {shortHash(item.blockchain_tx_hash)}
                  </td>

                  <td className="p-4 text-slate-500">
                    {formatDate(item.created_at)}
                  </td>

                  <td className="p-4 text-right">
                    <Link
                      href={`/investigator/evidence/${item.id}`}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                    >
                      👁️ Details
                    </Link>
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

function shortHash(value: string | null) {
  if (!value) return "-";
  if (value.length <= 18) return value;
  return `${value.slice(0, 10)}...${value.slice(-8)}`;
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