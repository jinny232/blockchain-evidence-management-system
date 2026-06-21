"use client";

import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/ui/Pagination";
import type { LabReportItem } from "@/models/lab-report.model";
import LabReportDetailsModal from "@/components/lab/reports/LabReportDetailsModal";
import {
  FilterSkeleton,
  PageHeaderSkeleton,
  StatCardsSkeleton,
  TableSkeleton,
} from "@/components/ui/LoadingSkeletons";
import StatusBadge from "@/components/ui/StatusBadge";

const PAGE_SIZE = 10;

export default function LabReportsClient() {
  const [reports, setReports] = useState<LabReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<LabReportItem | null>(
    null
  );
  const [search, setSearch] = useState("");
  const [analysisFilter, setAnalysisFilter] = useState("All");
  const [conclusionFilter, setConclusionFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReports() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/lab/reports", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setReports([]);
        setError(data.message || "Failed to load lab reports.");
      } else {
        setReports(Array.isArray(data) ? data : []);
      }
    } catch {
      setReports([]);
      setError("Could not connect to server.");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadReports();
  }, []);

  const analysisTypes = useMemo(() => {
    return Array.from(
      new Set(
        reports
          .map((report) => report.analysis_type || "General Analysis")
          .filter(Boolean)
      )
    );
  }, [reports]);

  const conclusions = useMemo(() => {
    return Array.from(
      new Set(
        reports.map((report) => report.conclusion || "No Conclusion").filter(Boolean)
      )
    );
  }, [reports]);

  const filteredReports = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return reports.filter((report) => {
      const analysisType = report.analysis_type || "General Analysis";
      const conclusion = report.conclusion || "No Conclusion";

      const text = `${report.id} ${report.evidence_id} ${
        report.case_code || ""
      } ${report.case_title || ""} ${report.evidence_type} ${analysisType} ${
        report.result
      } ${conclusion} ${report.file_hash} ${
        report.blockchain_tx_hash || ""
      }`.toLowerCase();

      const matchSearch = text.includes(keyword);
      const matchAnalysis =
        analysisFilter === "All" || analysisType === analysisFilter;
      const matchConclusion =
        conclusionFilter === "All" || conclusion === conclusionFilter;

      return matchSearch && matchAnalysis && matchConclusion;
    });
  }, [reports, search, analysisFilter, conclusionFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, analysisFilter, conclusionFilter]);

  const totalPages = Math.ceil(filteredReports.length / PAGE_SIZE);

  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredReports.slice(start, start + PAGE_SIZE);
  }, [filteredReports, currentPage]);

  const total = reports.length;
  const valid = reports.filter((item) =>
    (item.conclusion || "").toLowerCase().includes("valid")
  ).length;
  const tampered = reports.filter((item) =>
    (item.conclusion || "").toLowerCase().includes("tampered")
  ).length;
  const inconclusive = reports.filter((item) =>
    (item.conclusion || "").toLowerCase().includes("inconclusive")
  ).length;

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
            Laboratory Reports
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            📑 Lab Reports
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50">
            View all analysis reports you submitted for assigned evidence.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Reports" value={total} color="text-slate-950" />
        <StatCard label="Valid" value={valid} color="text-emerald-600" />
        <StatCard label="Tampered" value={tampered} color="text-red-600" />
        <StatCard label="Inconclusive" value={inconclusive} color="text-amber-600" />
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
            placeholder="Search report, evidence, case, hash..."
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />

          <select
            value={analysisFilter}
            onChange={(event) => setAnalysisFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          >
            <option>All</option>
            {analysisTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          <select
            value={conclusionFilter}
            onChange={(event) => setConclusionFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          >
            <option>All</option>
            {conclusions.map((conclusion) => (
              <option key={conclusion}>{conclusion}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="glass-card overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-slate-500">
            <tr>
              <th className="p-4">Report</th>
              <th className="p-4">Case</th>
              <th className="p-4">Evidence</th>
              <th className="p-4">Analysis</th>
              <th className="p-4">Conclusion</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
       

            {paginatedReports.map((report) => (
                <tr
                  key={report.id}
                  className="border-t border-slate-200 transition hover:bg-emerald-50/60"
                >
                  <td className="p-4">
                    <p className="font-bold text-slate-950">#{report.id}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      By {report.analyzed_by}
                    </p>
                  </td>

                  <td className="p-4">
                    <p className="font-semibold text-slate-800">
                      {report.case_code || "-"}
                    </p>
                    <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500">
                      {report.case_title || "-"}
                    </p>
                  </td>

                  <td className="p-4">
                    <p className="font-semibold text-slate-800">
                      Evidence #{report.evidence_id}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {report.evidence_type}
                    </p>
                  </td>

                  <td className="p-4 text-slate-700">
                    {report.analysis_type || "General Analysis"}
                  </td>

                  <td className="p-4">
                    <StatusBadge status={report.conclusion} variant="conclusion" />
                  </td>

                  <td className="p-4 text-slate-500">
                    {formatDate(report.created_at)}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
  <button
    type="button"
    onClick={() => setSelectedReport(report)}
    className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
  >
    👁️ Details
  </button>

  <a
    href={`/api/lab/reports/${report.id}/pdf`}
    target="_blank"
    rel="noreferrer"
    className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
  >
    📄 PDF
  </a>
</div>
                  </td>
                </tr>
              ))}

            {filteredReports.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  No lab reports found.
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

      {selectedReport && (
        <LabReportDetailsModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
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

function formatDate(value: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

