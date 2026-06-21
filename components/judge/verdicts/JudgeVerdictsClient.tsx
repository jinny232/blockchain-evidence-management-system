"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Pagination from "@/components/ui/Pagination";
import type {
  JudgeVerdict,
  JudgeVerdictCaseOption,
  JudgeVerdictDecision,
  JudgeVerdictStatus,
  JudgeVerdictsResponse,
} from "@/models/judge-verdict.model";

const PAGE_SIZE = 10;

const decisions: JudgeVerdictDecision[] = [
  "Guilty",
  "Not Guilty",
  "Dismissed",
  "Pending Further Review",
  "Other",
];

const statuses: JudgeVerdictStatus[] = ["Draft", "Final", "Archived"];

type FormState = {
  case_id: string;
  verdict_title: string;
  decision: JudgeVerdictDecision;
  verdict_summary: string;
  sentence_text: string;
  status: JudgeVerdictStatus;
};

const emptyForm: FormState = {
  case_id: "",
  verdict_title: "",
  decision: "Pending Further Review",
  verdict_summary: "",
  sentence_text: "",
  status: "Draft",
};

export default function JudgeVerdictsClient() {
  const [verdicts, setVerdicts] = useState<JudgeVerdict[]>([]);
  const [cases, setCases] = useState<JudgeVerdictCaseOption[]>([]);
  const [selectedVerdict, setSelectedVerdict] = useState<JudgeVerdict | null>(
    null
  );
  const [editingVerdict, setEditingVerdict] = useState<JudgeVerdict | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [search, setSearch] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadVerdicts() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/judge/verdicts", {
        cache: "no-store",
      });

      const data = (await res.json()) as
        | JudgeVerdictsResponse
        | { message: string };

      if (!res.ok) {
        setVerdicts([]);
        setCases([]);
        setError("message" in data ? data.message : "Failed to load verdicts.");
      } else {
        const payload = data as JudgeVerdictsResponse;
        setVerdicts(Array.isArray(payload.verdicts) ? payload.verdicts : []);
        setCases(Array.isArray(payload.cases) ? payload.cases : []);
      }
    } catch {
      setVerdicts([]);
      setCases([]);
      setError("Could not connect to server.");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadVerdicts();
  }, []);

  const filteredVerdicts = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return verdicts.filter((verdict) => {
      const text = `${verdict.id} ${verdict.verdict_title} ${
        verdict.decision
      } ${verdict.verdict_summary} ${verdict.sentence_text || ""} ${
        verdict.case_code
      } ${verdict.case_title}`.toLowerCase();

      const matchSearch = text.includes(keyword);
      const matchDecision =
        decisionFilter === "All" || verdict.decision === decisionFilter;
      const matchStatus =
        statusFilter === "All" || verdict.status === statusFilter;

      return matchSearch && matchDecision && matchStatus;
    });
  }, [verdicts, search, decisionFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, decisionFilter, statusFilter]);

  const totalPages = Math.ceil(filteredVerdicts.length / PAGE_SIZE);

  const paginatedVerdicts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredVerdicts.slice(start, start + PAGE_SIZE);
  }, [filteredVerdicts, currentPage]);

  const total = verdicts.length;
  const final = verdicts.filter((verdict) => verdict.status === "Final").length;
  const draft = verdicts.filter((verdict) => verdict.status === "Draft").length;
  const archived = verdicts.filter(
    (verdict) => verdict.status === "Archived"
  ).length;

  async function deleteVerdict(verdict: JudgeVerdict) {
    const confirmed = window.confirm(
      `Delete verdict "${verdict.verdict_title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/judge/verdicts/${verdict.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to delete verdict.");
      } else {
        setSuccess("Verdict deleted successfully.");
        await loadVerdicts();
      }
    } catch {
      setError("Could not connect to server.");
    }

    setActionLoading(false);
  }

  return (
    <div className="space-y-6 text-slate-950">
      <section className="relative overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-slate-950 via-amber-900 to-amber-500 p-7 text-white shadow-xl shadow-amber-200/70">
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-100">
              Court Decision
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              🧑‍⚖️ Verdicts
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-50">
              Create draft or final court verdicts for assigned cases.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
          >
            + New Verdict
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Verdicts" value={total} color="text-slate-950" />
        <StatCard label="Draft" value={draft} color="text-amber-600" />
        <StatCard label="Final" value={final} color="text-emerald-600" />
        <StatCard label="Archived" value={archived} color="text-slate-600" />
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
            placeholder="Search verdict, case, decision..."
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
          />

          <select
            value={decisionFilter}
            onChange={(event) => setDecisionFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
          >
            <option>All</option>
            {decisions.map((decision) => (
              <option key={decision}>{decision}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
          >
            <option>All</option>
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="glass-card overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-slate-500">
            <tr>
              <th className="p-4">Verdict</th>
              <th className="p-4">Case</th>
              <th className="p-4">Decision</th>
              <th className="p-4">Status</th>
              <th className="p-4">Updated</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  Loading verdicts...
                </td>
              </tr>
            )}

            {!loading &&
              paginatedVerdicts.map((verdict) => (
                <tr
                  key={verdict.id}
                  className="border-t border-slate-200 transition hover:bg-amber-50/60"
                >
                  <td className="p-4">
                    <p className="font-bold text-slate-950">
                      {verdict.verdict_title}
                    </p>
                    <p className="mt-1 line-clamp-1 max-w-[320px] text-xs text-slate-500">
                      {verdict.verdict_summary}
                    </p>
                  </td>

                  <td className="p-4">
                    <p className="font-semibold text-slate-800">
                      {verdict.case_code}
                    </p>
                    <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                      {verdict.case_title}
                    </p>
                  </td>

                  <td className="p-4">
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {verdict.decision}
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${verdictStatusClass(
                        verdict.status
                      )}`}
                    >
                      {verdict.status}
                    </span>
                  </td>

                  <td className="p-4 text-slate-500">
                    {formatDate(verdict.updated_at)}
                  </td>

                  <td className="p-4">
  <div className="flex justify-end gap-2">
    <button
      type="button"
      onClick={() => setSelectedVerdict(verdict)}
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
    >
      👁️ Details
    </button>

    <a
      href={`/api/judge/verdicts/${verdict.id}/pdf`}
      target="_blank"
      rel="noreferrer"
      className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
    >
      📄 PDF
    </a>

    <button
      type="button"
      onClick={() => setEditingVerdict(verdict)}
      className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
    >
      ✏️ Edit
    </button>

    <button
      type="button"
      onClick={() => deleteVerdict(verdict)}
      disabled={actionLoading}
      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-60"
    >
      🗑️ Delete
    </button>
  </div>
</td>
                </tr>
              ))}

            {!loading && filteredVerdicts.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No verdicts found.
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

      {showCreateModal && (
        <VerdictFormModal
          title="Create Verdict"
          cases={cases}
          initialForm={emptyForm}
          submitLabel="Create Verdict"
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (form) => {
            await saveVerdict("/api/judge/verdicts", "POST", form, () => {
              setShowCreateModal(false);
            });
          }}
          loading={actionLoading}
        />
      )}

      {editingVerdict && (
        <VerdictFormModal
          title="Edit Verdict"
          cases={cases}
          initialForm={verdictToForm(editingVerdict)}
          submitLabel="Save Changes"
          onClose={() => setEditingVerdict(null)}
          onSubmit={async (form) => {
            await saveVerdict(
              `/api/judge/verdicts/${editingVerdict.id}`,
              "PUT",
              form,
              () => {
                setEditingVerdict(null);
              }
            );
          }}
          loading={actionLoading}
        />
      )}

      {selectedVerdict && (
        <VerdictDetailsModal
          verdict={selectedVerdict}
          onClose={() => setSelectedVerdict(null)}
        />
      )}
    </div>
  );

  async function saveVerdict(
    url: string,
    method: "POST" | "PUT",
    form: FormState,
    onSuccess: () => void
  ) {
    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toPayload(form)),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to save verdict.");
      } else {
        setSuccess("Verdict saved successfully.");
        onSuccess();
        await loadVerdicts();
      }
    } catch {
      setError("Could not connect to server.");
    }

    setActionLoading(false);
  }
}

function VerdictFormModal({
  title,
  cases,
  initialForm,
  submitLabel,
  onClose,
  onSubmit,
  loading,
}: {
  title: string;
  cases: JudgeVerdictCaseOption[];
  initialForm: FormState;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (form: FormState) => Promise<void>;
  loading: boolean;
}) {
  const [form, setForm] = useState<FormState>(initialForm);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="dark-scrollbar max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/90 p-6 backdrop-blur">
          <div>
            <p className="text-sm font-semibold text-amber-600">
              Court Verdict
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <FormField label="Case">
            <select
              required
              value={form.case_id}
              onChange={(event) =>
                setForm({ ...form, case_id: event.target.value })
              }
              className="input-field"
            >
              <option value="">Choose case</option>
              {cases.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.case_code} — {item.title} — Evidence:{" "}
                  {item.evidence_count} — Reports: {item.lab_report_count} —
                  Notes: {item.legal_note_count}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Verdict Title">
            <input
              required
              value={form.verdict_title}
              onChange={(event) =>
                setForm({ ...form, verdict_title: event.target.value })
              }
              placeholder="Example: Final judgment for case C-001"
              className="input-field"
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Decision">
              <select
                value={form.decision}
                onChange={(event) =>
                  setForm({
                    ...form,
                    decision: event.target.value as JudgeVerdictDecision,
                  })
                }
                className="input-field"
              >
                {decisions.map((decision) => (
                  <option key={decision}>{decision}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Status">
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target.value as JudgeVerdictStatus,
                  })
                }
                className="input-field"
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Verdict Summary">
            <textarea
              required
              rows={6}
              value={form.verdict_summary}
              onChange={(event) =>
                setForm({ ...form, verdict_summary: event.target.value })
              }
              placeholder="Write final reasoning based on evidence, lab reports, and legal notes..."
              className="input-field resize-none"
            />
          </FormField>

          <FormField label="Sentence / Court Order">
            <textarea
              rows={4}
              value={form.sentence_text}
              onChange={(event) =>
                setForm({ ...form, sentence_text: event.target.value })
              }
              placeholder="Optional sentence, order, or next court instruction..."
              className="input-field resize-none"
            />
          </FormField>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            If status is set to <b>Final</b>, the related case will be marked as{" "}
            <b>Closed</b>.
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-200 hover:bg-amber-400 disabled:opacity-60"
            >
              {loading ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VerdictDetailsModal({
  verdict,
  onClose,
}: {
  verdict: JudgeVerdict;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="dark-scrollbar max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/90 p-6 backdrop-blur">
          <div>
            <p className="text-sm font-semibold text-amber-600">
              Verdict Details
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              {verdict.verdict_title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {verdict.case_code} • {verdict.case_title}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <InfoBox label="Decision" value={verdict.decision} />
            <InfoBox label="Status" value={verdict.status} />
            <InfoBox label="Updated" value={formatDate(verdict.updated_at)} />
          </div>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-bold text-slate-950">Verdict Summary</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {verdict.verdict_summary}
            </p>
          </section>

          <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-bold text-amber-900">Sentence / Court Order</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-amber-800">
              {verdict.sentence_text || "No sentence/order provided."}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 break-words font-bold text-slate-950">{value}</p>
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

function verdictToForm(verdict: JudgeVerdict): FormState {
  return {
    case_id: String(verdict.case_id),
    verdict_title: verdict.verdict_title,
    decision: verdict.decision,
    verdict_summary: verdict.verdict_summary,
    sentence_text: verdict.sentence_text || "",
    status: verdict.status,
  };
}

function toPayload(form: FormState) {
  return {
    case_id: Number(form.case_id),
    verdict_title: form.verdict_title,
    decision: form.decision,
    verdict_summary: form.verdict_summary,
    sentence_text: form.sentence_text.trim() ? form.sentence_text.trim() : null,
    status: form.status,
  };
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function verdictStatusClass(status: string) {
  if (status === "Final") {
    return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  }

  if (status === "Draft") {
    return "border border-amber-300 bg-amber-50 text-amber-700";
  }

  if (status === "Archived") {
    return "border border-slate-300 bg-slate-50 text-slate-600";
  }

  return "border border-slate-300 bg-slate-50 text-slate-600";
}