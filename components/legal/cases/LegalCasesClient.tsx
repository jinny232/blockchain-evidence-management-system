"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/ui/Pagination";
import type { LegalCaseItem } from "@/models/legal-case.model";

const PAGE_SIZE = 10;

export default function LegalCasesClient() {
  const [cases, setCases] = useState<LegalCaseItem[]>([]);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCases() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/legal/cases", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setCases([]);
        setError(data.message || "Failed to load legal cases.");
      } else {
        setCases(Array.isArray(data) ? data : []);
      }
    } catch {
      setCases([]);
      setError("Could not connect to server.");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCases();
  }, []);

  const filteredCases = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return cases.filter((item) => {
      const text = `${item.case_code} ${item.title} ${
        item.description || ""
      } ${item.lead_investigator || ""}`.toLowerCase();

      const matchSearch = text.includes(keyword);
      const matchPriority =
        priorityFilter === "All" || item.priority === priorityFilter;
      const matchStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchSearch && matchPriority && matchStatus;
    });
  }, [cases, search, priorityFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, priorityFilter, statusFilter]);

  const totalPages = Math.ceil(filteredCases.length / PAGE_SIZE);

  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCases.slice(start, start + PAGE_SIZE);
  }, [filteredCases, currentPage]);

  const open = cases.filter((item) => item.status === "Open").length;
  const inProgress = cases.filter((item) => item.status === "In Progress").length;
  const closed = cases.filter((item) => item.status === "Closed").length;

  return (
    <div className="space-y-6 text-slate-950">
      <section className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-700 via-indigo-800 to-slate-950 p-7 text-white shadow-xl shadow-violet-200/70">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="relative">
          <p className="text-sm font-semibold text-violet-100">
            Legal Review
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            ⚖ Case Review
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-50">
            Review assigned cases, evidence counts, and lab report readiness.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Cases" value={cases.length} color="text-slate-950" />
        <StatCard label="Open" value={open} color="text-blue-600" />
        <StatCard label="In Progress" value={inProgress} color="text-amber-600" />
        <StatCard label="Closed" value={closed} color="text-slate-600" />
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
            placeholder="Search case code, title, investigator..."
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          />

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          >
            <option>All</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Urgent</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          >
            <option>All</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Closed</option>
          </select>
        </div>
      </section>

      <section className="glass-card overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-slate-500">
            <tr>
              <th className="p-4">Case</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Status</th>
              <th className="p-4">Evidence</th>
              <th className="p-4">Analyzed</th>
              <th className="p-4">Reports</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  Loading legal cases...
                </td>
              </tr>
            )}

            {!loading &&
              paginatedCases.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-200 transition hover:bg-violet-50/60"
                >
                  <td className="p-4">
                    <p className="font-bold text-slate-950">
                      {item.case_code}
                    </p>
                    <p className="mt-1 max-w-[260px] truncate text-xs text-slate-500">
                      {item.title}
                    </p>
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${caseStatusClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="p-4 text-slate-700">
                    {Number(item.evidence_count || 0)}
                  </td>

                  <td className="p-4 text-slate-700">
                    {Number(item.analyzed_evidence_count || 0)}
                  </td>

                  <td className="p-4 text-slate-700">
                    {Number(item.lab_report_count || 0)}
                  </td>

                  <td className="p-4 text-right">
                    <Link
                      href={`/legal/cases/${item.id}`}
                      className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100"
                    >
                      👁️ Review
                    </Link>
                  </td>
                </tr>
              ))}

            {!loading && filteredCases.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  No legal cases found.
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

function priorityClass(priority: string) {
  if (priority === "Urgent") return "border border-red-300 bg-red-50 text-red-700";
  if (priority === "High") return "border border-orange-300 bg-orange-50 text-orange-700";
  if (priority === "Medium") return "border border-amber-300 bg-amber-50 text-amber-700";
  return "border border-slate-300 bg-slate-50 text-slate-600";
}

function caseStatusClass(status: string) {
  if (status === "Open") return "border border-blue-300 bg-blue-50 text-blue-700";
  if (status === "In Progress") return "border border-amber-300 bg-amber-50 text-amber-700";
  if (status === "Closed") return "border border-slate-300 bg-slate-50 text-slate-600";
  return "border border-slate-300 bg-slate-50 text-slate-600";
}