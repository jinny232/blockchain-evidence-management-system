"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { InvestigatorDashboardResponse } from "@/models/investigator-dashboard.model";

export default function InvestigatorDashboardClient() {
  const [data, setData] = useState<InvestigatorDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/investigator/dashboard", {
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message || "Failed to load dashboard.");
        setData(null);
      } else {
        setData(json);
      }
    } catch {
      setError("Could not connect to server.");
      setData(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center text-slate-500">
        Loading investigator dashboard...
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
      <section className="glass-card rounded-3xl p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Welcome back, Investigator
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              🕵️ {data.investigator.full_name}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Monitor assigned cases, submit evidence, and track lab progress.
            </p>
          </div>

          <Link
            href="/investigator/evidence/submit"
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
          >
            ➕ Submit Evidence
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Assigned Cases"
          value={stats.assignedCases}
          sub={`${stats.openCases} open`}
          color="text-blue-600"
        />
        <StatCard
          label="Submitted Evidence"
          value={stats.submittedEvidence}
          sub="your uploads"
          color="text-slate-950"
        />
        <StatCard
          label="Pending Evidence"
          value={stats.pendingEvidence}
          sub="waiting for lab"
          color="text-amber-600"
        />
        <StatCard
          label="Analyzed Evidence"
          value={stats.analyzedEvidence}
          sub="lab completed"
          color="text-emerald-600"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
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
          label="Rejected"
          value={stats.rejectedEvidence}
          className="border-red-300 bg-red-50 text-red-700"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <DashboardPanel
          title="Recent Assigned Cases"
          description="Latest cases assigned to you"
          href="/investigator/cases"
        >
          {data.recentCases.length === 0 ? (
            <EmptyText text="No assigned cases yet." />
          ) : (
            <div className="space-y-3">
              {data.recentCases.map((item) => (
                <Link
                  key={item.id}
                  href={`/investigator/cases/${item.id}`}
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
          title="Recent Submitted Evidence"
          description="Your latest evidence records"
          href="/investigator/evidence"
        >
          {data.recentEvidence.length === 0 ? (
            <EmptyText text="No evidence submitted yet." />
          ) : (
            <div className="space-y-3">
              {data.recentEvidence.map((item) => (
                <Link
                  key={item.id}
                  href={`/investigator/evidence/${item.id}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-blue-50/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        #{item.id} • {item.evidence_type}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.case_code || "No case"}{" "}
                        {item.case_title ? `• ${item.case_title}` : ""}
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
                </Link>
              ))}
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Recent Activity"
          description="Your latest audit activity"
          href="/investigator/activity"
        >
          {data.recentActivity.length === 0 ? (
            <EmptyText text="No activity found." />
          ) : (
            <div className="space-y-3">
              {data.recentActivity.map((item) => (
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
                        {item.entity_type || "Activity"}
                        {item.entity_id ? ` #${item.entity_id}` : ""}
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
        <QuickAction href="/investigator/cases" title="My Cases" icon="📁" />
        <QuickAction
          href="/investigator/evidence/submit"
          title="Submit Evidence"
          icon="🧾"
        />
        <QuickAction
          href="/investigator/evidence"
          title="My Evidence"
          icon="🔍"
        />
        <QuickAction
          href="/investigator/activity"
          title="My Activity"
          icon="📜"
        />
      </section>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-xl font-bold text-slate-950">
          Investigator Workflow
        </h2>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <WorkflowStep number="1" title="Open Case" text="View assigned case." />
          <WorkflowStep number="2" title="Submit Evidence" text="Upload file and details." />
          <WorkflowStep number="3" title="Hash + IPFS" text="System stores proof." />
          <WorkflowStep number="4" title="Lab Review" text="Track lab status." />
        </div>
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
  children: ReactNode;
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
      <p className="mt-1 text-sm text-blue-600">Open →</p>
    </Link>
  );
}

function WorkflowStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
        {number}
      </div>
      <p className="mt-3 font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
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

function auditStatusClass(status: string) {
  if (status === "Success") {
    return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  }

  if (status === "Warning") {
    return "border border-amber-300 bg-amber-50 text-amber-700";
  }

  if (status === "Failed") {
    return "border border-red-300 bg-red-50 text-red-700";
  }

  if (status === "Critical") {
    return "border border-purple-300 bg-purple-50 text-purple-700";
  }

  return "border border-slate-300 bg-slate-50 text-slate-600";
}