"use client";

import { useEffect, useState } from "react";
import type { CaseRecord } from "@/models/case.model";

interface Props {
  caseRecord: CaseRecord | null;
  onClose: () => void;
  onSaved: () => void;
}

interface Investigator {
  id: number;
  full_name: string;
}

export default function EditCaseModal({ caseRecord, onClose, onSaved }: Props) {
  const [investigators, setInvestigators] = useState<Investigator[]>([]);
  const [investigatorError, setInvestigatorError] = useState("");

  const [form, setForm] = useState({
    case_code: "",
    title: "",
    description: "",
    priority: "Medium",
    status: "Open",
    lead_investigator: "",
  });

  useEffect(() => {
    fetch("/api/admin/investigators")
      .then((res) => res.json())
      .then((data) => {
        setInvestigators(Array.isArray(data) ? data : []);
      });
  }, []);

  useEffect(() => {
    if (caseRecord) {
      setForm({
        case_code: caseRecord.case_code,
        title: caseRecord.title,
        description: caseRecord.description || "",
        priority: caseRecord.priority,
        status: caseRecord.status,
        lead_investigator: caseRecord.lead_investigator || "",
      });

      setInvestigatorError("");
    }
  }, [caseRecord]);

  if (!caseRecord) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const typedInvestigator = form.lead_investigator.trim();

    if (!typedInvestigator) {
      setInvestigatorError("Please select or type an investigator.");
      return;
    }

    const investigatorExists = investigators.some(
      (inv) =>
        inv.full_name.trim().toLowerCase() === typedInvestigator.toLowerCase()
    );

    if (!investigatorExists) {
      setInvestigatorError("This investigator does not exist.");
      return;
    }

    await fetch(`/api/admin/cases/${caseRecord.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        lead_investigator: typedInvestigator,
      }),
    });

    setInvestigatorError("");
    onSaved();
    onClose();
  }

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-start justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-md sm:items-center">
      <form
        onSubmit={submit}
        className="my-6 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 text-slate-950 shadow-2xl shadow-slate-500/30 backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Investigation Control
            </p>
            <h2 className="mt-1 text-2xl font-bold">✏️ Edit Case</h2>
            <p className="mt-1 text-sm text-slate-500">
              Update case information and assigned investigator.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-600 hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Case Code
            </label>
            <input
              className={inputClass}
              value={form.case_code}
              onChange={(e) => setForm({ ...form, case_code: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Case Title
            </label>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Description
            </label>
            <textarea
              className={`${inputClass} min-h-24 resize-none`}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Priority
              </label>
              <select
                className={inputClass}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Status
              </label>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Assign Investigator
            </label>

            <input
              list="edit-investigator-list"
              placeholder="Type or select investigator"
              className={inputClass}
              value={form.lead_investigator}
              onChange={(e) => {
                setForm({ ...form, lead_investigator: e.target.value });
                setInvestigatorError("");
              }}
            />

            <datalist id="edit-investigator-list">
              {investigators.map((inv) => (
                <option key={inv.id} value={inv.full_name} />
              ))}
            </datalist>

            {investigatorError && (
              <p className="mt-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {investigatorError}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-white/90 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700">
            Update Case
          </button>
        </div>
      </form>
    </div>
  );
}