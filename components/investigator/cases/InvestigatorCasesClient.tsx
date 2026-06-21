"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/ui/Pagination";
import type { InvestigatorCaseListItem } from "@/models/investigator-case.model";

const PAGE_SIZE = 10;

export default function InvestigatorCasesClient() {
  const [cases, setCases] = useState<InvestigatorCaseListItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  async function loadCases() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/investigator/cases", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setCases([]);
        setError(data.message || "Failed to load assigned cases.");
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
      const matchStatus =
        statusFilter === "All" || item.status === statusFilter;
      const matchPriority =
        priorityFilter === "All" || item.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [cases, search, statusFilter, priorityFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, priorityFilter]);

  const totalPages = Math.ceil(filteredCases.length / PAGE_SIZE);

  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCases.slice(start, start + PAGE_SIZE);
  }, [filteredCases, currentPage]);

  const assignedCases = cases.length;
  const openCases = cases.filter((item) => item.status === "Open").length;
  const progressCases = cases.filter(
    (item) => item.status === "In Progress"
  ).length;
  const closedCases = cases.filter((item) => item.status === "Closed").length;

  return (
    <div className="space-y-6 text-slate-950">
      <div>
        <p className="text-sm font-semibold text-blue-600">
          Assigned Investigation
        </p>
        <h1 className="text-3xl font-bold tracking-tight">📁 My Cases</h1>
        <p className="mt-1 text-sm text-slate-500">
          View only the cases assigned to you by the admin team.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Assigned Cases" value={assignedCases} color="text-slate-950" />
        <StatCard label="Open" value={openCases} color="text-blue-600" />
        <StatCard label="In Progress" value={progressCases} color="text-amber-600" />
        <StatCard label="Closed" value={closedCases} color="text-emerald-600" />
      </div>

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
            placeholder="Search case code, title, description..."
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option>All</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option>All</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Urgent</option>
          </select>
        </div>
      </section>

      <section className="glass-card overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-slate-500">
            <tr>
              <th className="p-4">Case Code</th>
              <th className="p-4">Title</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Status</th>
              <th className="p-4">Evidence</th>
              <th className="p-4">Team</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  Loading assigned cases...
                </td>
              </tr>
            )}

            {!loading &&
              paginatedCases.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-200 transition hover:bg-blue-50/60"
                >
                  <td className="p-4 font-semibold text-slate-950">
                    {item.case_code}
                  </td>

                  <td className="p-4">
                    <p className="font-medium text-slate-800">{item.title}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                      {item.description || "No description"}
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

                  <td className="p-4 text-slate-600">
                    {Number(item.evidence_count || 0)}
                  </td>

                  <td className="p-4 text-slate-600">
                    {Number(item.team_count || 0)}
                  </td>

                  <td className="p-4 text-right">
                    <Link
                      href={`/investigator/cases/${item.id}`}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                    >
                      👁️ View Details
                    </Link>
                  </td>
                </tr>
              ))}

            {!loading && filteredCases.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  No assigned cases found.
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
  if (priority === "Low") {
    return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  }

  if (priority === "Medium") {
    return "border border-amber-300 bg-amber-50 text-amber-700";
  }

  if (priority === "High") {
    return "border border-orange-300 bg-orange-50 text-orange-700";
  }

  if (priority === "Urgent") {
    return "border border-red-300 bg-red-50 text-red-700";
  }

  return "border border-slate-300 bg-slate-50 text-slate-600";
}

function caseStatusClass(status: string) {
  if (status === "Open") {
    return "border border-blue-300 bg-blue-50 text-blue-700";
  }

  if (status === "In Progress") {
    return "border border-amber-300 bg-amber-50 text-amber-700";
  }

  if (status === "Closed") {
    return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  }

  return "border border-slate-300 bg-slate-50 text-slate-600";
}