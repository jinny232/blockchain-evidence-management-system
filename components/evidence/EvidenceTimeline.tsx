"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { EvidenceTimelineResponse } from "@/models/evidence-timeline.model";

type TimelineTone = "blue" | "emerald" | "purple" | "amber" | "rose";

interface EvidenceTimelineProps {
  evidenceId: string | number;
  tone?: TimelineTone;
}

const toneClasses: Record<
  TimelineTone,
  {
    dot: string;
    line: string;
    title: string;
    cardHover: string;
  }
> = {
  blue: {
    dot: "bg-blue-600 ring-blue-100",
    line: "bg-blue-100",
    title: "text-blue-700",
    cardHover: "hover:border-blue-200 hover:bg-blue-50/50",
  },
  emerald: {
    dot: "bg-emerald-600 ring-emerald-100",
    line: "bg-emerald-100",
    title: "text-emerald-700",
    cardHover: "hover:border-emerald-200 hover:bg-emerald-50/50",
  },
  purple: {
    dot: "bg-purple-600 ring-purple-100",
    line: "bg-purple-100",
    title: "text-purple-700",
    cardHover: "hover:border-purple-200 hover:bg-purple-50/50",
  },
  amber: {
    dot: "bg-amber-500 ring-amber-100",
    line: "bg-amber-100",
    title: "text-amber-700",
    cardHover: "hover:border-amber-200 hover:bg-amber-50/50",
  },
  rose: {
    dot: "bg-rose-600 ring-rose-100",
    line: "bg-rose-100",
    title: "text-rose-700",
    cardHover: "hover:border-rose-200 hover:bg-rose-50/50",
  },
};

export default function EvidenceTimeline({
  evidenceId,
  tone = "blue",
}: EvidenceTimelineProps) {
  const [data, setData] = useState<EvidenceTimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const theme = toneClasses[tone];

  async function loadTimeline() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/evidence/${evidenceId}/timeline`, {
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok) {
        setData(null);
        setError(json.message || "Failed to load timeline.");
      } else {
        setData(json);
      }
    } catch {
      setData(null);
      setError("Could not connect to server.");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTimeline();
  }, [evidenceId]);

  if (loading) {
    return (
      <section className="glass-card rounded-3xl p-6">
        <div className="animate-pulse space-y-5">
          <div className="h-6 w-48 rounded-full bg-slate-200" />
          <div className="h-4 w-72 max-w-full rounded-full bg-slate-200" />

          {[1, 2, 3].map((item) => (
            <div key={item} className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-slate-200" />
              <div className="flex-1 rounded-2xl border border-slate-200 p-4">
                <div className="h-5 w-44 rounded-full bg-slate-200" />
                <div className="mt-3 h-4 w-full rounded-full bg-slate-200" />
                <div className="mt-2 h-4 w-2/3 rounded-full bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </section>
    );
  }

  if (!data) return null;

  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className={`text-sm font-bold uppercase tracking-[0.3em] ${theme.title}`}>
            Chain of Custody
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            Evidence Timeline
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Evidence #{data.evidence_id} • {data.case_code || "No Case Code"} •{" "}
            {data.evidence_type}
          </p>
        </div>

        <StatusBadge status={data.current_status} variant="evidence" size="md" />
      </div>

      {data.timeline.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
          No timeline events found for this evidence.
        </div>
      ) : (
        <div className="relative mt-6 space-y-5">
          <div
            className={`absolute left-5 top-3 h-[calc(100%-1.5rem)] w-0.5 ${theme.line}`}
          />

          {data.timeline.map((item, index) => (
            <div key={item.id} className="relative flex gap-4">
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ring-8 ${theme.dot}`}
              >
                {timelineIcon(item.type)}
              </div>

              <div
                className={`w-full rounded-2xl border border-slate-200 bg-white p-5 transition ${theme.cardHover}`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-bold text-slate-950">
                      {index + 1}. {item.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(item.created_at)}
                    </p>
                  </div>

                  <StatusBadge
                    status={item.status}
                    variant={item.type === "Blockchain" ? "blockchain" : "activity"}
                  />
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {item.description}
                </p>

                <div className="mt-4 grid gap-3 text-xs md:grid-cols-2">
                  <TimelineMeta label="Actor" value={item.actor_name || "-"} />
                  <TimelineMeta label="Role" value={item.actor_role || "-"} />

                  {item.metadata?.analysis_type && (
                    <TimelineMeta
                      label="Analysis Type"
                      value={item.metadata.analysis_type}
                    />
                  )}

                  {item.metadata?.conclusion && (
                    <TimelineMeta
                      label="Conclusion"
                      value={item.metadata.conclusion}
                    />
                  )}

                  {item.metadata?.ip_address && (
                    <TimelineMeta
                      label="IP Address"
                      value={item.metadata.ip_address}
                    />
                  )}
                </div>

                {(item.metadata?.file_hash ||
                  item.metadata?.ipfs_cid ||
                  item.metadata?.blockchain_tx_hash) && (
                  <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    {item.metadata?.file_hash && (
                      <ProofText label="File Hash" value={item.metadata.file_hash} />
                    )}

                    {item.metadata?.ipfs_cid && (
                      <ProofText label="IPFS CID" value={item.metadata.ipfs_cid} />
                    )}

                    {item.metadata?.blockchain_tx_hash && (
                      <ProofText
                        label="Blockchain Tx"
                        value={item.metadata.blockchain_tx_hash}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function TimelineMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <span className="font-semibold text-slate-500">{label}: </span>
      <span className="font-bold text-slate-800">{value}</span>
    </div>
  );
}

function ProofText({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-semibold text-slate-500">{label}</p>
      <p className="mt-1 break-all font-mono text-xs leading-5 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function timelineIcon(type: string) {
  if (type === "Submitted") return "📤";
  if (type === "Blockchain") return "⛓️";
  if (type === "Accepted") return "✅";
  if (type === "Analyzed") return "🧪";
  if (type === "Updated") return "✏️";

  return "📌";
}

function formatDate(value: string) {
  if (!value) return "-";

  return new Date(value).toLocaleString();
}