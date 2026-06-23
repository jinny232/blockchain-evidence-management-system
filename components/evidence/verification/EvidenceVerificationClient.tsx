"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import EvidenceTimeline from "@/components/evidence/EvidenceTimeline";
import StatusBadge from "@/components/ui/StatusBadge";
import type { EvidenceVerificationResponse } from "@/models/evidence-verification.model";

export default function EvidenceVerificationClient() {
  const [hash, setHash] = useState("");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<EvidenceVerificationResponse | null>(
    null
  );
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [hashingFile, setHashingFile] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const normalizedHash = useMemo(() => {
    return hash.trim().replace(/^0x/i, "").toLowerCase();
  }, [hash]);

  async function handleVerify() {
    setLoading(true);
    setError("");
    setResult(null);
    setSelectedEvidenceId(null);

    try {
      const res = await fetch("/api/evidence/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hash: normalizedHash,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to verify evidence.");
      } else {
        setResult(data);
        setSelectedEvidenceId(data.matches?.[0]?.id || null);
      }
    } catch {
      setError("Could not connect to server.");
    }

    setLoading(false);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setHashingFile(true);
    setError("");
    setResult(null);
    setSelectedEvidenceId(null);
    setFileName(file.name);

    try {
      const fileHash = await calculateSha256(file);
      setHash(fileHash);
    } catch {
      setError("Failed to calculate file hash.");
    }

    setHashingFile(false);
  }

  async function copyText(label: string, value: string | null | undefined) {
    if (!value) return;

    await navigator.clipboard.writeText(value);
    setCopied(label);

    setTimeout(() => setCopied(""), 1500);
  }

  const canVerify = /^[a-f0-9]{64}$/.test(normalizedHash);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-slate-950 via-blue-900 to-blue-600 p-7 text-white shadow-xl shadow-blue-200/70">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-200">
                EVELOCK
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                🔍 Evidence Verification
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50">
                Upload a file or paste a SHA-256 hash to check whether it
                matches a registered evidence record and blockchain transaction
                proof.
              </p>
            </div>

            <Link
              href="/admin"
              className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
            >
              Back to Dashboard
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="glass-card rounded-3xl p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-950">
              Verify Evidence Integrity
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You can paste an existing SHA-256 hash, or choose a local file.
              The browser calculates the SHA-256 hash without uploading the file
              content to the server.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Upload File
                </label>

                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-blue-700"
                />

                {fileName && (
                  <p className="mt-2 text-xs text-slate-500">
                    Selected file:{" "}
                    <span className="font-semibold text-slate-700">
                      {fileName}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  SHA-256 Hash
                </label>

                <textarea
                  value={hash}
                  onChange={(event) => {
                    setHash(event.target.value);
                    setResult(null);
                    setSelectedEvidenceId(null);
                  }}
                  rows={4}
                  placeholder="Paste SHA-256 hash here..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {normalizedHash && (
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        canVerify
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-red-300 bg-red-50 text-red-700"
                      }`}
                    >
                      {canVerify ? "Valid SHA-256 format" : "Invalid hash format"}
                    </span>
                  )}

                  {hashingFile && (
                    <span className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Calculating file hash...
                    </span>
                  )}
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={!canVerify || loading || hashingFile}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Verifying..." : "Verify Evidence"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHash("");
                    setFileName("");
                    setResult(null);
                    setError("");
                    setSelectedEvidenceId(null);
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-xl font-bold text-slate-950">
              Verification Rules
            </h2>

            <div className="mt-5 space-y-3">
              <RuleCard
                title="1. Hash Match"
                text="The entered hash must match the original evidence file hash."
              />
              <RuleCard
                title="2. Blockchain Proof"
                text="A recorded transaction hash improves trust and integrity proof."
              />
              <RuleCard
                title="3. Timeline Review"
                text="Matched evidence can be checked through its chain-of-custody timeline."
              />
            </div>
          </div>
        </section>

        {result && (
          <section
            className={`rounded-3xl border p-6 ${
              result.status === "Verified"
                ? "border-emerald-200 bg-emerald-50"
                : result.status === "Matched"
                ? "border-amber-200 bg-amber-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">
                  Verification Result
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  {result.status}
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
                  {result.message}
                </p>
              </div>

              <VerificationPill status={result.status} />
            </div>

            <div className="mt-5 rounded-2xl border border-white/60 bg-white/70 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Input Hash
                  </p>
                  <p className="mt-2 break-all font-mono text-sm leading-6 text-slate-800">
                    {result.input_hash}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => copyText("input-hash", result.input_hash)}
                  className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  {copied === "input-hash" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </section>
        )}

        {result && result.matches.length > 0 && (
          <section className="glass-card overflow-hidden rounded-3xl">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-slate-950">
                Matched Evidence Records
              </h2>

              <p className="text-sm text-slate-500">
                {result.matches.length} evidence record
                {result.matches.length === 1 ? "" : "s"} matched this hash.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-500">
                  <tr>
                    <th className="p-4">Evidence</th>
                    <th className="p-4">Case</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Blockchain</th>
                    <th className="p-4">Conclusion</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {result.matches.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-200 transition hover:bg-blue-50/60"
                    >
                      <td className="p-4">
                        <p className="font-bold text-slate-950">#{item.id}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          By {item.submitted_by || "-"}
                        </p>
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-slate-800">
                          {item.case_code || "-"}
                        </p>
                        <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500">
                          {item.case_title || "-"}
                        </p>
                      </td>

                      <td className="p-4 text-slate-700">
                        {item.evidence_type}
                      </td>

                      <td className="p-4">
                        <StatusBadge
                          status={item.evidence_status}
                          variant="evidence"
                        />
                      </td>

                      <td className="p-4">
                        <StatusBadge
                          status={item.blockchain_status}
                          variant="blockchain"
                        />
                      </td>

                      <td className="p-4">
                        <StatusBadge
                          status={item.latest_conclusion}
                          variant="conclusion"
                        />
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedEvidenceId(item.id)}
                            className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                          >
                            Timeline
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              copyText(
                                `tx-${item.id}`,
                                item.blockchain_tx_hash
                              )
                            }
                            disabled={!item.blockchain_tx_hash}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {copied === `tx-${item.id}` ? "Copied" : "Copy Tx"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {selectedEvidenceId && (
          <EvidenceTimeline evidenceId={selectedEvidenceId} tone="blue" />
        )}
      </main>
    </div>
  );
}

function RuleCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="font-bold text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function VerificationPill({
  status,
}: {
  status: "Verified" | "Matched" | "Not Found";
}) {
  if (status === "Verified") {
    return (
      <span className="rounded-full border border-emerald-300 bg-white px-4 py-2 text-sm font-bold text-emerald-700">
        ✅ Verified
      </span>
    );
  }

  if (status === "Matched") {
    return (
      <span className="rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-700">
        ⚠️ Matched Only
      </span>
    );
  }

  return (
    <span className="rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-700">
      ❌ Not Found
    </span>
  );
}

async function calculateSha256(file: File) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}