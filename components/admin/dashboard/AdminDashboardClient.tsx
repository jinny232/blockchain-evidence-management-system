"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AdminDashboardResponse } from "@/models/admin-dashboard.model";

export default function AdminDashboardClient() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/dashboard", {
      cache: "no-store",
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.message || "Failed to load dashboard.");
      setData(null);
    } else {
      setData(json);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error || "Could not load dashboard."}
      </div>
    );
  }

  const stats = data.stats;

  return (
    <div className="space-y-6 text-slate-950">
      <div>
        <p className="text-sm font-semibold text-blue-600">Command Overview</p>
           <p className="mt-1 text-sm text-slate-500">
          Monitor users, cases, evidence status, and recent system activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          sub={`${stats.activeUsers} active`}
          color="text-blue-600"
        />
        <StatCard
          label="Total Cases"
          value={stats.totalCases}
          sub={`${stats.openCases} open`}
          color="text-purple-600"
        />
        <StatCard
          label="Total Evidence"
          value={stats.totalEvidence}
          sub={`${stats.pendingEvidence} pending`}
          color="text-emerald-600"
        />
        <StatCard
          label="Audit Logs"
          value={stats.totalAuditLogs}
          sub="system activity"
          color="text-amber-600"
        />
      </div>

      <section className="grid gap-4 lg:grid-cols-4">
        <EvidenceStatusCard
          label="Pending"
          value={stats.pendingEvidence}
          className="border-amber-300 bg-amber-50 text-amber-700"
        />
        <EvidenceStatusCard
          label="Accepted"
          value={stats.acceptedEvidence}
          className="border-blue-300 bg-blue-50 text-blue-700"
        />
        <EvidenceStatusCard
          label="Analyzed"
          value={stats.analyzedEvidence}
          className="border-emerald-300 bg-emerald-50 text-emerald-700"
        />
        <Link
          href="/admin/evidence"
          className="glass-card rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70"
        >
          <p className="text-sm text-slate-500">Evidence Monitor</p>
          <p className="mt-3 text-lg font-bold text-blue-600">
            Open Evidence →
          </p>
        </Link>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <DashboardPanel
          title="Recent Cases"
          description="Latest investigation records"
          href="/admin/cases"
        >
          {data.recentCases.length === 0 ? (
            <EmptyText text="No recent cases." />
          ) : (
            <div className="space-y-3">
              {data.recentCases.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/cases/${item.id}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-blue-50/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.case_code}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.title}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${caseStatusClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Recent Evidence"
          description="Latest uploaded records"
          href="/admin/evidence"
        >
          {data.recentEvidence.length === 0 ? (
            <EmptyText text="No recent evidence." />
          ) : (
            <div className="space-y-3">
              {data.recentEvidence.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        #{item.id} • {item.evidence_type}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Case ID: {item.case_id || "-"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${evidenceStatusClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Recent Audit Logs"
          description="Latest system activity"
          href="/admin/audit-logs"
        >
          {data.recentAuditLogs.length === 0 ? (
            <EmptyText text="No recent audit logs." />
          ) : (
            <div className="space-y-3">
              {data.recentAuditLogs.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.action}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.actor_name || "Unknown"} •{" "}
                        {item.actor_role || "-"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${auditStatusClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardPanel>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <QuickAction href="/admin/users" title="Manage Users" icon="👥" />
        <QuickAction href="/admin/cases" title="Case Registry" icon="📁" />
        <QuickAction
          href="/admin/team-assignments"
          title="Team Assignment"
          icon="👨‍💼"
        />
        <QuickAction href="/admin/audit-logs" title="Audit Logs" icon="📜" />
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number;
  sub: string;
  color: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <h2 className={`mt-2 text-3xl font-bold ${color}`}>{value}</h2>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </div>
  );
}

function EvidenceStatusCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${className}`}>
      <p className="text-sm font-medium">{label}</p>
      <h2 className="mt-2 text-3xl font-bold">{value}</h2>
    </div>
  );
}

function DashboardPanel({
  title,
  description,
  href,
  children,
}: {
  title: string;
  description: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-card rounded-3xl p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>

        <Link href={href} className="text-sm font-semibold text-blue-600">
          View →
        </Link>
      </div>

      {children}
    </section>
  );
}

function QuickAction({
  href,
  title,
  icon,
}: {
  href: string;
  title: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="glass-card rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70"
    >
      <div className="text-3xl">{icon}</div>
      <p className="mt-3 font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-blue-600">Open module →</p>
    </Link>
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
      {text}
    </p>
  );
}

function caseStatusClass(status: string) {
  if (status === "Open") return "border border-blue-300 bg-blue-50 text-blue-700";
  if (status === "In Progress") return "border border-amber-300 bg-amber-50 text-amber-700";
  if (status === "Closed") return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  return "border border-slate-300 bg-slate-50 text-slate-600";
}

function evidenceStatusClass(status: string) {
  if (status === "Pending") return "border border-amber-300 bg-amber-50 text-amber-700";
  if (status === "Accepted") return "border border-blue-300 bg-blue-50 text-blue-700";
  if (status === "Analyzed") return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  if (status === "Rejected") return "border border-red-300 bg-red-50 text-red-700";
  return "border border-slate-300 bg-slate-50 text-slate-600";
}

function auditStatusClass(status: string) {
  if (status === "Success") return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  if (status === "Warning") return "border border-amber-300 bg-amber-50 text-amber-700";
  if (status === "Failed") return "border border-red-300 bg-red-50 text-red-700";
  if (status === "Critical") return "border border-purple-300 bg-purple-50 text-purple-700";
  return "border border-slate-300 bg-slate-50 text-slate-600";
}