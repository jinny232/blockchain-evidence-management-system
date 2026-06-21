"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { InvestigatorEvidenceDetails } from "@/models/investigator-evidence.model";
import EvidenceTimeline from "@/components/evidence/EvidenceTimeline";

export default function InvestigatorEvidenceDetailsClient({
  evidenceId,
}: {
  evidenceId: string;
}) {
  const [evidence, setEvidence] = useState<InvestigatorEvidenceDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  async function loadEvidence() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/investigator/evidence/${evidenceId}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setEvidence(null);
        setError(data.message || "Failed to load evidence details.");
      } else {
        setEvidence(data);
      }
    } catch {
      setEvidence(null);
      setError("Could not connect to server.");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadEvidence();
  }, [evidenceId]);

  async function copyText(label: string, value: string | null) {
    if (!value) return;

    await navigator.clipboard.writeText(value);
    setCopied(label);

    setTimeout(() => {
      setCopied("");
    }, 1500);
  }

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center text-slate-500">
        Loading evidence details...
      </div>
    );
  }

  if (error || !evidence) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error || "Could not load evidence details."}
        </div>

        <Link
          href="/investigator/evidence"
          className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to My Evidence
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-950">
      <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-slate-950 via-blue-900 to-blue-600 p-7 text-white shadow-xl shadow-blue-200/70">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/investigator/evidence"
              className="text-sm font-semibold text-blue-100 hover:text-white"
            >
              ← Back to My Evidence
            </Link>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Evidence #{evidence.id}
            </h1>

            <p className="mt-2 text-sm text-blue-50">
              {evidence.case_code || "-"} • {evidence.case_title || "-"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-4 py-2 text-sm font-bold ${evidenceStatusClass(
                evidence.status
              )}`}
            >
              {evidence.status}
            </span>

            <span
              className={`rounded-full px-4 py-2 text-sm font-bold ${blockchainStatusClass(
                evidence.blockchain_status
              )}`}
            >
              {evidence.blockchain_status || "Not Recorded"}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Evidence Type" value={evidence.evidence_type} />
        <InfoCard label="Submitted By" value={evidence.submitted_by || "-"} />
        <InfoCard label="Created At" value={formatDate(evidence.created_at)} />
      </section>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-xl font-bold text-slate-950">
          Evidence Description
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {evidence.description || "No description provided."}
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <ProofBox
          title="SHA-256 File Hash"
          value={evidence.file_hash}
          buttonLabel={copied === "hash" ? "Copied" : "Copy Hash"}
          onCopy={() => copyText("hash", evidence.file_hash)}
        />

        <ProofBox
          title="Blockchain Transaction Hash"
          value={evidence.blockchain_tx_hash || "-"}
          buttonLabel={copied === "tx" ? "Copied" : "Copy Tx Hash"}
          onCopy={() => copyText("tx", evidence.blockchain_tx_hash)}
        />

        <ProofBox
          title="IPFS CID"
          value={evidence.ipfs_cid || "-"}
          buttonLabel={copied === "ipfs" ? "Copied" : "Copy CID"}
          onCopy={() => copyText("ipfs", evidence.ipfs_cid)}
        />

        <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-xl">
          <p className="text-sm font-semibold text-cyan-300">
            Blockchain Proof
          </p>
          <h2 className="mt-2 text-xl font-bold">Ganache Record</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            The transaction hash proves that this evidence hash was submitted to
            the CriminalEvidence smart contract.
          </p>
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold">
            Status: {evidence.blockchain_status || "Not Recorded"}
          </p>
        </div>
      </section>

      <EvidenceTimeline evidenceId={evidenceId} tone="blue" />

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-xl font-bold text-slate-950">Case Link</h2>
        <p className="mt-2 text-sm text-slate-500">
          This evidence belongs to the following case.
        </p>

        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold text-slate-950">
              {evidence.case_code || "-"}
            </p>
            <p className="text-sm text-slate-500">
              {evidence.case_title || "-"}
            </p>
          </div>

          {evidence.case_id && (
            <Link
              href={`/investigator/cases/${evidence.case_id}`}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
            >
              View Case
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <h2 className="mt-2 break-words text-lg font-bold text-slate-950">
        {value}
      </h2>
    </div>
  );
}

function ProofBox({
  title,
  value,
  buttonLabel,
  onCopy,
}: {
  title: string;
  value: string;
  buttonLabel: string;
  onCopy: () => void;
}) {
  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-600">{title}</p>
          <p className="mt-3 break-all font-mono text-sm leading-6 text-slate-700">
            {value || "-"}
          </p>
        </div>

        <button
          type="button"
          onClick={onCopy}
          disabled={!value || value === "-"}
          className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
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

function blockchainStatusClass(status: string | null) {
  if (status === "Recorded") {
    return "border border-emerald-300 bg-emerald-50 text-emerald-700";
  }

  if (status === "Failed") {
    return "border border-red-300 bg-red-50 text-red-700";
  }

  return "border border-slate-300 bg-slate-50 text-slate-600";
}