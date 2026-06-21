"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Pagination from "@/components/ui/Pagination";
import type {
  LegalNote,
  LegalNoteCaseOption,
  LegalNoteEvidenceOption,
  LegalNoteStatus,
  LegalNoteType,
  LegalNotesResponse,
} from "@/models/legal-note.model";

const PAGE_SIZE = 10;

const noteTypes: LegalNoteType[] = [
  "Case Opinion",
  "Evidence Remark",
  "Court Preparation",
  "Objection",
  "Other",
];

const noteStatuses: LegalNoteStatus[] = ["Draft", "Final", "Archived"];

type FormState = {
  case_id: string;
  evidence_id: string;
  note_type: LegalNoteType;
  title: string;
  content: string;
  recommendation: string;
  status: LegalNoteStatus;
};

const emptyForm: FormState = {
  case_id: "",
  evidence_id: "",
  note_type: "Case Opinion",
  title: "",
  content: "",
  recommendation: "",
  status: "Draft",
};

export default function LegalNotesClient() {
  const [notes, setNotes] = useState<LegalNote[]>([]);
  const [cases, setCases] = useState<LegalNoteCaseOption[]>([]);
  const [evidence, setEvidence] = useState<LegalNoteEvidenceOption[]>([]);

  const [selectedNote, setSelectedNote] = useState<LegalNote | null>(null);
  const [editingNote, setEditingNote] = useState<LegalNote | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadNotes() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/legal/notes", {
        cache: "no-store",
      });

      const data = (await res.json()) as LegalNotesResponse | { message: string };

      if (!res.ok) {
        setNotes([]);
        setCases([]);
        setEvidence([]);
        setError("message" in data ? data.message : "Failed to load notes.");
      } else {
        const payload = data as LegalNotesResponse;
        setNotes(Array.isArray(payload.notes) ? payload.notes : []);
        setCases(Array.isArray(payload.cases) ? payload.cases : []);
        setEvidence(Array.isArray(payload.evidence) ? payload.evidence : []);
      }
    } catch {
      setNotes([]);
      setCases([]);
      setEvidence([]);
      setError("Could not connect to server.");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadNotes();
  }, []);

  const filteredNotes = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return notes.filter((note) => {
      const text = `${note.id} ${note.title} ${note.content} ${
        note.recommendation || ""
      } ${note.note_type} ${note.status} ${note.case_code || ""} ${
        note.case_title || ""
      } ${note.evidence_type || ""} ${
        note.evidence_hash || ""
      }`.toLowerCase();

      const matchSearch = text.includes(keyword);
      const matchType = typeFilter === "All" || note.note_type === typeFilter;
      const matchStatus =
        statusFilter === "All" || note.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [notes, search, typeFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filteredNotes.length / PAGE_SIZE);

  const paginatedNotes = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredNotes.slice(start, start + PAGE_SIZE);
  }, [filteredNotes, currentPage]);

  const total = notes.length;
  const draft = notes.filter((note) => note.status === "Draft").length;
  const final = notes.filter((note) => note.status === "Final").length;
  const archived = notes.filter((note) => note.status === "Archived").length;

  async function deleteNote(note: LegalNote) {
    const confirmed = window.confirm(
      `Delete legal note "${note.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/legal/notes/${note.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to delete legal note.");
      } else {
        setSuccess("Legal note deleted successfully.");
        await loadNotes();
      }
    } catch {
      setError("Could not connect to server.");
    }

    setActionLoading(false);
  }

  return (
    <div className="space-y-6 text-slate-950">
      <section className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-700 via-indigo-800 to-slate-950 p-7 text-white shadow-xl shadow-violet-200/70">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-violet-100">
              Legal Opinion Workspace
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              📝 Legal Notes
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-50">
              Write legal remarks, evidence opinions, objections, and court
              preparation notes for assigned cases.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
          >
            + New Legal Note
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Notes" value={total} color="text-slate-950" />
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
            placeholder="Search title, content, case, evidence..."
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          />

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          >
            <option>All</option>
            {noteTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          >
            <option>All</option>
            {noteStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="glass-card overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-slate-500">
            <tr>
              <th className="p-4">Note</th>
              <th className="p-4">Target</th>
              <th className="p-4">Type</th>
              <th className="p-4">Status</th>
              <th className="p-4">Updated</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  Loading legal notes...
                </td>
              </tr>
            )}

            {!loading &&
              paginatedNotes.map((note) => (
                <tr
                  key={note.id}
                  className="border-t border-slate-200 transition hover:bg-violet-50/60"
                >
                  <td className="p-4">
                    <p className="font-bold text-slate-950">{note.title}</p>
                    <p className="mt-1 line-clamp-1 max-w-[320px] text-xs text-slate-500">
                      {note.content}
                    </p>
                  </td>

                  <td className="p-4">
                    <p className="font-semibold text-slate-800">
                      {note.case_code || "-"}
                    </p>
                    <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                      {note.evidence_id
                        ? `Evidence #${note.evidence_id} • ${
                            note.evidence_type || "-"
                          }`
                        : note.case_title || "-"}
                    </p>
                  </td>

                  <td className="p-4">
                    <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                      {note.note_type}
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${noteStatusClass(
                        note.status
                      )}`}
                    >
                      {note.status}
                    </span>
                  </td>

                  <td className="p-4 text-slate-500">
                    {formatDate(note.updated_at)}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedNote(note)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        👁️ Details
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingNote(note)}
                        className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteNote(note)}
                        disabled={actionLoading}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-60"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {!loading && filteredNotes.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No legal notes found.
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
        <LegalNoteFormModal
          title="Create Legal Note"
          cases={cases}
          evidence={evidence}
          initialForm={emptyForm}
          submitLabel="Create Note"
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (form) => {
            setActionLoading(true);
            setError("");
            setSuccess("");

            try {
              const res = await fetch("/api/legal/notes", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(toPayload(form)),
              });

              const data = await res.json();

              if (!res.ok || !data.success) {
                setError(data.message || "Failed to create legal note.");
              } else {
                setSuccess("Legal note created successfully.");
                setShowCreateModal(false);
                await loadNotes();
              }
            } catch {
              setError("Could not connect to server.");
            }

            setActionLoading(false);
          }}
          loading={actionLoading}
        />
      )}

      {editingNote && (
        <LegalNoteFormModal
          title="Edit Legal Note"
          cases={cases}
          evidence={evidence}
          initialForm={noteToForm(editingNote)}
          submitLabel="Save Changes"
          onClose={() => setEditingNote(null)}
          onSubmit={async (form) => {
            setActionLoading(true);
            setError("");
            setSuccess("");

            try {
              const res = await fetch(`/api/legal/notes/${editingNote.id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(toPayload(form)),
              });

              const data = await res.json();

              if (!res.ok || !data.success) {
                setError(data.message || "Failed to update legal note.");
              } else {
                setSuccess("Legal note updated successfully.");
                setEditingNote(null);
                await loadNotes();
              }
            } catch {
              setError("Could not connect to server.");
            }

            setActionLoading(false);
          }}
          loading={actionLoading}
        />
      )}

      {selectedNote && (
        <LegalNoteDetailsModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
        />
      )}
    </div>
  );
}

function LegalNoteFormModal({
  title,
  cases,
  evidence,
  initialForm,
  submitLabel,
  onClose,
  onSubmit,
  loading,
}: {
  title: string;
  cases: LegalNoteCaseOption[];
  evidence: LegalNoteEvidenceOption[];
  initialForm: FormState;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (form: FormState) => Promise<void>;
  loading: boolean;
}) {
  const [form, setForm] = useState<FormState>(initialForm);

  const evidenceForCase = evidence.filter(
    (item) => String(item.case_id) === form.case_id
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="dark-scrollbar max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/90 p-6 backdrop-blur">
          <div>
            <p className="text-sm font-semibold text-violet-600">
              Legal Note
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
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Case">
              <select
                required
                value={form.case_id}
                onChange={(event) =>
                  setForm({
                    ...form,
                    case_id: event.target.value,
                    evidence_id: "",
                  })
                }
                className="input-field"
              >
                <option value="">Choose case</option>
                {cases.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.case_code} — {item.title}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Evidence">
              <select
                value={form.evidence_id}
                onChange={(event) =>
                  setForm({ ...form, evidence_id: event.target.value })
                }
                className="input-field"
                disabled={!form.case_id}
              >
                <option value="">Case note only</option>
                {evidenceForCase.map((item) => (
                  <option key={item.id} value={item.id}>
                    Evidence #{item.id} — {item.evidence_type} — {item.status}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Note Type">
              <select
                value={form.note_type}
                onChange={(event) =>
                  setForm({
                    ...form,
                    note_type: event.target.value as LegalNoteType,
                  })
                }
                className="input-field"
              >
                {noteTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Status">
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target.value as LegalNoteStatus,
                  })
                }
                className="input-field"
              >
                {noteStatuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Title">
            <input
              required
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              placeholder="Example: Evidence admissibility opinion"
              className="input-field"
            />
          </FormField>

          <FormField label="Content">
            <textarea
              required
              rows={6}
              value={form.content}
              onChange={(event) =>
                setForm({ ...form, content: event.target.value })
              }
              placeholder="Write legal observation, argument, or case opinion..."
              className="input-field resize-none"
            />
          </FormField>

          <FormField label="Recommendation">
            <textarea
              rows={4}
              value={form.recommendation}
              onChange={(event) =>
                setForm({ ...form, recommendation: event.target.value })
              }
              placeholder="Optional recommendation for court preparation..."
              className="input-field resize-none"
            />
          </FormField>

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
              className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 hover:bg-violet-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LegalNoteDetailsModal({
  note,
  onClose,
}: {
  note: LegalNote;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="dark-scrollbar max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/90 p-6 backdrop-blur">
          <div>
            <p className="text-sm font-semibold text-violet-600">
              Legal Note Details
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              {note.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {note.case_code || "-"}{" "}
              {note.evidence_id ? `• Evidence #${note.evidence_id}` : ""}
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
            <InfoBox label="Type" value={note.note_type} />
            <InfoBox label="Status" value={note.status} />
            <InfoBox label="Updated" value={formatDate(note.updated_at)} />
          </div>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-bold text-slate-950">Content</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {note.content}
            </p>
          </section>

          <section className="rounded-3xl border border-violet-200 bg-violet-50 p-5">
            <h3 className="font-bold text-violet-900">Recommendation</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-violet-800">
              {note.recommendation || "No recommendation provided."}
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

function noteToForm(note: LegalNote): FormState {
  return {
    case_id: note.case_id ? String(note.case_id) : "",
    evidence_id: note.evidence_id ? String(note.evidence_id) : "",
    note_type: note.note_type,
    title: note.title,
    content: note.content,
    recommendation: note.recommendation || "",
    status: note.status,
  };
}

function toPayload(form: FormState) {
  return {
    case_id: Number(form.case_id),
    evidence_id: form.evidence_id ? Number(form.evidence_id) : null,
    note_type: form.note_type,
    title: form.title,
    content: form.content,
    recommendation: form.recommendation.trim()
      ? form.recommendation.trim()
      : null,
    status: form.status,
  };
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function noteStatusClass(status: string) {
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