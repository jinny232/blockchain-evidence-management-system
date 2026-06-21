"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { InvestigatorCaseListItem } from "@/models/investigator-case.model";
import type {
  InvestigatorEvidenceType,
  SubmittedEvidenceReceipt,
} from "@/models/investigator-evidence.model";

const evidenceTypes: InvestigatorEvidenceType[] = [
  "Image",
  "Document",
  "Video",
  "Audio",
  "Disk Image",
  "Network Log",
  "Other",
];

export default function SubmitEvidenceClient() {
  const searchParams = useSearchParams();
  const caseIdFromUrl = searchParams.get("caseId") || "";

  const [cases, setCases] = useState<InvestigatorCaseListItem[]>([]);
  const [caseId, setCaseId] = useState(caseIdFromUrl);
  const [evidenceType, setEvidenceType] =
    useState<InvestigatorEvidenceType>("Document");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loadingCases, setLoadingCases] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [receipt, setReceipt] = useState<SubmittedEvidenceReceipt | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  async function loadCases() {
    setLoadingCases(true);
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

    setLoadingCases(false);
  }

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (!caseIdFromUrl) return;

    const exists = cases.some((item) => String(item.id) === caseIdFromUrl);

    if (exists) {
      setCaseId(caseIdFromUrl);
    }
  }, [caseIdFromUrl, cases]);

  const selectedCase = useMemo(() => {
    return cases.find((item) => String(item.id) === caseId) || null;
  }, [cases, caseId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setReceipt(null);

    if (!caseId) {
      setError("Please choose a case.");
      return;
    }

    if (!file) {
      setError("Please choose an evidence file.");
      return;
    }

    const formData = new FormData();
    formData.append("caseId", caseId);
    formData.append("evidenceType", evidenceType);
    formData.append("description", description);
    formData.append("file", file);

    setSubmitting(true);

    try {
      const res = await fetch("/api/investigator/evidence", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to submit evidence.");
        setSubmitting(false);
        return;
      }

      setSuccessMessage("Evidence submitted successfully.");
      setReceipt(data.evidence);
      setDescription("");
      setFile(null);
      setFileInputKey((current) => current + 1);
    } catch {
      setError("Could not connect to server.");
    }

    setSubmitting(false);
  }

  return (
    <div className="space-y-7 text-slate-950">
      <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-950 p-7 text-white shadow-xl shadow-blue-200/70">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-100">
              Evidence Collection
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              🧾 Submit Evidence
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50">
              Upload evidence for an assigned case. The system generates a
              SHA-256 hash, saves the evidence as Pending, and records the proof
              on Ganache blockchain.
            </p>
          </div>

          <Link
            href="/investigator/cases"
            className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
          >
            ← My Cases
          </Link>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="glass-card rounded-3xl p-6 lg:col-span-2">
          <div className="mb-6 grid gap-3 md:grid-cols-3">
            <StepCard
              number="01"
              title="Choose Case"
              text="Select assigned case"
            />
            <StepCard
              number="02"
              title="Upload File"
              text="Generate file hash"
            />
            <StepCard
              number="03"
              title="Blockchain"
              text="Record proof"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                {successMessage}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Assigned Case
                </label>

                <select
                  value={caseId}
                  onChange={(event) => setCaseId(event.target.value)}
                  disabled={loadingCases || cases.length === 0}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">
                    {loadingCases
                      ? "Loading assigned cases..."
                      : cases.length === 0
                      ? "No assigned cases"
                      : "Choose assigned case"}
                  </option>

                  {cases.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.case_code} — {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Evidence Type
                </label>

                <select
                  value={evidenceType}
                  onChange={(event) =>
                    setEvidenceType(
                      event.target.value as InvestigatorEvidenceType
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  {evidenceTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                placeholder="Describe where the evidence came from, what it contains, and why it is related to the case..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50/60 p-5">
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Evidence File
              </label>

              <input
                key={fileInputKey}
                type="file"
                onChange={(event) => {
                  const selected = event.target.files?.[0] || null;
                  setFile(selected);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-blue-300"
              />

              <p className="mt-3 text-xs text-slate-500">
                Maximum file size: 50MB. The original file is hashed on the
                server before saving the evidence record.
              </p>

              {file && (
                <div className="mt-4 rounded-2xl border border-blue-200 bg-white p-4">
                  <p className="text-sm font-bold text-blue-800">
                    📎 Selected File
                  </p>
                  <p className="mt-1 break-all text-sm text-blue-700">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-blue-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                    {file.type || "Unknown type"}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || loadingCases || cases.length === 0}
              className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
            >
              {submitting ? "Submitting and Recording..." : "Submit Evidence"}
            </button>
          </form>
        </div>

        <aside className="space-y-5">
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-lg font-bold text-slate-950">
              🔐 Chain of Custody
            </h2>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <RuleItem text="Only assigned investigators can submit evidence." />
              <RuleItem text="Evidence starts with Pending status." />
              <RuleItem text="SHA-256 hash protects file integrity." />
              <RuleItem text="Blockchain transaction stores proof record." />
            </div>
          </div>

          {selectedCase ? (
            <div className="glass-card rounded-3xl p-6">
              <p className="text-sm font-semibold text-blue-600">
                Selected Case
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-950">
                {selectedCase.case_code}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {selectedCase.title}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass(
                    selectedCase.priority
                  )}`}
                >
                  {selectedCase.priority}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${caseStatusClass(
                    selectedCase.status
                  )}`}
                >
                  {selectedCase.status}
                </span>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-6 text-sm text-slate-500">
              Choose a case to see case information here.
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-xl">
            <p className="text-sm font-semibold text-cyan-300">
              Ganache Status
            </p>
            <h3 className="mt-2 text-lg font-bold">Local Blockchain Ready</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              After submit, your app calls the CriminalEvidence smart contract
              and saves the transaction hash to MySQL.
            </p>
          </div>
        </aside>
      </section>

      {receipt && (
        <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-xl shadow-emerald-100">
          <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-100">
                  Evidence Receipt
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  Evidence #{receipt.id} submitted
                </h2>
                <p className="mt-1 text-sm text-emerald-50">
                  Hash generated, database record created, and blockchain proof
                  saved.
                </p>
              </div>

              <span className="rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-bold text-white">
                {receipt.status}
              </span>
            </div>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
            <ReceiptItem label="Case Code" value={receipt.case_code} />
            <ReceiptItem label="Case Title" value={receipt.case_title} />
            <ReceiptItem label="Evidence Type" value={receipt.evidence_type} />
            <ReceiptItem label="Submitted By" value={receipt.submitted_by} />
            <ReceiptItem
              label="Submitted Date"
              value={new Date(receipt.created_at).toLocaleString()}
            />
            <ReceiptItem
              label="IPFS CID"
              value={receipt.ipfs_cid || "Not uploaded / PINATA_JWT missing"}
            />
            <ReceiptItem
              label="Blockchain Status"
              value={receipt.blockchain_status || "Not Recorded"}
            />
            <ReceiptItem
              label="Transaction Hash"
              value={receipt.blockchain_tx_hash || "-"}
            />
          </div>

          <div className="mx-6 mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              SHA-256 File Hash
            </p>
            <p className="mt-2 break-all font-mono text-sm text-slate-800">
              {receipt.file_hash}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-200 bg-slate-50 p-6">
            <Link
              href={`/investigator/cases/${receipt.case_id}`}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
            >
              View Case Details
            </Link>

            <button
              type="button"
              onClick={() => setReceipt(null)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Submit Another
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function StepCard({
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
      <p className="text-xs font-bold text-blue-600">{number}</p>
      <h3 className="mt-1 font-bold text-slate-950">{title}</h3>
      <p className="mt-1 text-xs text-slate-500">{text}</p>
    </div>
  );
}

function RuleItem({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
        ✓
      </span>
      <p>{text}</p>
    </div>
  );
}

function ReceiptItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {value || "-"}
      </p>
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