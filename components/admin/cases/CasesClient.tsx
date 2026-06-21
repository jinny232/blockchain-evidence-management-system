"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CaseRecord } from "@/models/case.model";
import CreateCaseModal from "./CreateCaseModal";
import EditCaseModal from "./EditCaseModal";
import Pagination from "@/components/ui/Pagination";

const PAGE_SIZE = 10;

export default function CasesClient() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  async function loadCases() {
    setLoading(true);

    const res = await fetch("/api/admin/cases", { cache: "no-store" });
    const data = await res.json();

    if (Array.isArray(data)) {
      setCases(data);
    } else {
      setCases([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCases();
  }, []);

  async function deleteCase(id: number) {
    const ok = confirm("Are you sure you want to delete this case?");
    if (!ok) return;

    await fetch(`/api/admin/cases/${id}`, {
      method: "DELETE",
    });

    loadCases();
  }

  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      const text = `${item.case_code} ${item.title} ${
        item.lead_investigator ?? ""
      }`.toLowerCase();

      const matchSearch = text.includes(search.toLowerCase());
      const matchStatus = status === "All" || item.status === status;

      return matchSearch && matchStatus;
    });
  }, [cases, search, status]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  const totalPages = Math.ceil(filteredCases.length / PAGE_SIZE);

  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCases.slice(start, start + PAGE_SIZE);
  }, [filteredCases, currentPage]);

  const totalCases = cases.length;
  const openCases = cases.filter((item) => item.status === "Open").length;
  const progressCases = cases.filter(
    (item) => item.status === "In Progress"
  ).length;
  const closedCases = cases.filter((item) => item.status === "Closed").length;

  return (
    <div className="space-y-6 text-slate-950">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            Investigation Control
          </p>
        
          <p className="mt-1 text-sm text-slate-500">
            Manage investigation cases and assigned investigators.
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
        >
          ➕ Create Case
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Cases" value={totalCases} color="text-slate-950" />
        <StatCard label="Open" value={openCases} color="text-blue-600" />
        <StatCard label="In Progress" value={progressCases} color="text-amber-600" />
        <StatCard label="Closed" value={closedCases} color="text-emerald-600" />
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search case code, title, investigator..."
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option>All</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Closed</option>
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-slate-500">
            <tr>
              <th className="p-4">Case Code</th>
              <th className="p-4">Title</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Status</th>
              <th className="p-4">Investigator</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  Loading cases...
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

                  <td className="p-4 text-slate-700">{item.title}</td>

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
                    {item.lead_investigator || "-"}
                  </td>

                  <td className="space-x-2 p-4 text-right">
                    <Link
                      href={`/admin/cases/${item.id}`}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                    >
                      👁️ View
                    </Link>

                    <button
                      onClick={() => setEditingCase(item)}
                      className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() => deleteCase(item.id)}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}

            {!loading && filteredCases.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No cases found.
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

      <CreateCaseModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={loadCases}
      />

      <EditCaseModal
        caseRecord={editingCase}
        onClose={() => setEditingCase(null)}
        onSaved={loadCases}
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

function priorityClass(priority: string) {
  if (priority === "Low") return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  if (priority === "Medium") return "border border-amber-300 bg-amber-50 text-amber-700";
  if (priority === "High") return "border border-orange-300 bg-orange-50 text-orange-700";
  if (priority === "Urgent") return "border border-red-300 bg-red-50 text-red-700";
  return "border border-slate-300 bg-slate-50 text-slate-600";
}

function caseStatusClass(status: string) {
  if (status === "Open") return "border border-blue-300 bg-blue-50 text-blue-700";
  if (status === "In Progress") return "border border-amber-300 bg-amber-50 text-amber-700";
  if (status === "Closed") return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  return "border border-slate-300 bg-slate-50 text-slate-600";
}