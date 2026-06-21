import { db } from "@/lib/db";
import type {
  EvidenceTimelineItem,
  EvidenceTimelineResponse,
} from "@/models/evidence-timeline.model";

type EvidenceRow = {
  id: number;
  case_id: number | null;
  case_code: string | null;
  case_title: string | null;
  evidence_type: string;
  description: string | null;
  file_hash: string | null;
  ipfs_cid: string | null;
  submitted_by: string | null;
  status: string;
  blockchain_tx_hash: string | null;
  blockchain_status: string | null;
  created_at: Date | string;
  updated_at: Date | string | null;
};

type LabResultRow = {
  id: number;
  evidence_id: number;
  analyzed_by: string;
  analysis_type: string | null;
  result: string;
  conclusion: string | null;
  created_at: Date | string;
};

type AuditLogRow = {
  id: number;
  actor_name: string | null;
  actor_role: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  status: string;
  details: string | null;
  ip_address: string | null;
  created_at: Date | string;
};

export async function getEvidenceTimeline(
  evidenceId: number
): Promise<EvidenceTimelineResponse | null> {
  const [evidenceRows] = await db.query(
    `
    SELECT
      e.id,
      e.case_id,
      c.case_code,
      c.title AS case_title,
      e.evidence_type,
      e.description,
      e.file_hash,
      e.ipfs_cid,
      e.submitted_by,
      e.status,
      e.blockchain_tx_hash,
      e.blockchain_status,
      e.created_at,
      e.updated_at
    FROM evidence e
    LEFT JOIN cases c
      ON c.id = e.case_id
    WHERE e.id = ?
    LIMIT 1
    `,
    [evidenceId]
  );

  const evidence = (evidenceRows as EvidenceRow[])[0];

  if (!evidence) {
    return null;
  }

  const timeline: EvidenceTimelineItem[] = [];

  timeline.push({
    id: `evidence-submitted-${evidence.id}`,
    type: "Submitted",
    title: "Evidence Submitted",
    description:
      evidence.description ||
      `${evidence.evidence_type} evidence was submitted to the system.`,
    actor_name: evidence.submitted_by,
    actor_role: "Investigator",
    status: "Success",
    created_at: toIsoString(evidence.created_at),
    metadata: {
      file_hash: evidence.file_hash,
      ipfs_cid: evidence.ipfs_cid,
    },
  });

  if (evidence.blockchain_tx_hash || evidence.blockchain_status) {
    timeline.push({
      id: `blockchain-${evidence.id}`,
      type: "Blockchain",
      title: "Blockchain Proof Recorded",
      description:
        "The evidence file hash was recorded on the blockchain for integrity verification.",
      actor_name: "System",
      actor_role: "Blockchain",
      status: evidence.blockchain_status || "Recorded",
      created_at: toIsoString(evidence.updated_at || evidence.created_at),
      metadata: {
        file_hash: evidence.file_hash,
        blockchain_tx_hash: evidence.blockchain_tx_hash,
        blockchain_status: evidence.blockchain_status,
      },
    });
  }

  const [labRows] = await db.query(
    `
    SELECT
      id,
      evidence_id,
      analyzed_by,
      analysis_type,
      result,
      conclusion,
      created_at
    FROM lab_results
    WHERE evidence_id = ?
    ORDER BY created_at ASC
    `,
    [evidenceId]
  );

  const labResults = labRows as LabResultRow[];

  for (const report of labResults) {
    timeline.push({
      id: `lab-result-${report.id}`,
      type: "Analyzed",
      title: "Lab Analysis Submitted",
      description: report.result,
      actor_name: report.analyzed_by,
      actor_role: "Lab Technician",
      status: report.conclusion || "Analyzed",
      created_at: toIsoString(report.created_at),
      metadata: {
        analysis_type: report.analysis_type,
        conclusion: report.conclusion,
      },
    });
  }

  const [auditRows] = await db.query(
    `
    SELECT
      id,
      actor_name,
      actor_role,
      action,
      entity_type,
      entity_id,
      status,
      details,
      ip_address,
      created_at
    FROM audit_logs
    WHERE
      (
        entity_type = 'Evidence'
        AND entity_id IN (?, ?)
      )
      OR details LIKE ?
      OR details LIKE ?
      OR details LIKE ?
    ORDER BY created_at ASC
    `,
    [
      String(evidenceId),
      `#${evidenceId}`,
      `%evidence #${evidenceId}%`,
      `%Evidence #${evidenceId}%`,
      `%evidence ${evidenceId}%`,
    ]
  );

  const auditLogs = auditRows as AuditLogRow[];

  for (const log of auditLogs) {
    timeline.push({
      id: `audit-${log.id}`,
      type: getAuditTimelineType(log.action),
      title: log.action,
      description: log.details || "System audit event recorded.",
      actor_name: log.actor_name,
      actor_role: log.actor_role,
      status: log.status,
      created_at: toIsoString(log.created_at),
      metadata: {
        ip_address: log.ip_address,
      },
    });
  }

  const uniqueTimeline = removeDuplicateTimelineItems(timeline).sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return {
    evidence_id: evidence.id,
    case_id: evidence.case_id,
    case_code: evidence.case_code,
    case_title: evidence.case_title,
    evidence_type: evidence.evidence_type,
    current_status: evidence.status,
    timeline: uniqueTimeline,
  };
}

function getAuditTimelineType(action: string): EvidenceTimelineItem["type"] {
  const text = action.toLowerCase();

  if (text.includes("accept")) return "Accepted";
  if (text.includes("analy") || text.includes("lab")) return "Analyzed";
  if (text.includes("blockchain")) return "Blockchain";
  if (text.includes("submit")) return "Submitted";

  return "Audit";
}

function removeDuplicateTimelineItems(items: EvidenceTimelineItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.type}-${item.title}-${item.created_at}-${item.actor_name}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function toIsoString(value: Date | string | null | undefined) {
  if (!value) {
    return new Date().toISOString();
  }

  return new Date(value).toISOString();
}