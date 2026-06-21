import { db } from "@/lib/db";
import type {
  EvidenceVerificationMatch,
  EvidenceVerificationResponse,
} from "@/models/evidence-verification.model";

export async function verifyEvidenceHash(
  hash: string
): Promise<EvidenceVerificationResponse> {
  const normalizedHash = normalizeHash(hash);

  const [rows] = await db.query(
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
      e.status AS evidence_status,
      e.blockchain_tx_hash,
      e.blockchain_status,
      e.created_at,
      e.updated_at,
      COUNT(DISTINCT lr.id) AS report_count,
      MAX(lr.conclusion) AS latest_conclusion
    FROM evidence e
    LEFT JOIN cases c
      ON c.id = e.case_id
    LEFT JOIN lab_results lr
      ON lr.evidence_id = e.id
    WHERE LOWER(e.file_hash) = ?
    GROUP BY
      e.id,
      e.case_id,
      c.case_code,
      c.title,
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
    ORDER BY e.created_at DESC
    `,
    [normalizedHash]
  );

  const matches = rows as EvidenceVerificationMatch[];

  if (matches.length === 0) {
    return {
      input_hash: normalizedHash,
      status: "Not Found",
      verified: false,
      matched: false,
      message:
        "No evidence record matched this hash. The file may not be registered in the system, or the hash is incorrect.",
      matches: [],
    };
  }

  const hasBlockchainProof = matches.some((item) => {
    const blockchainStatus = (item.blockchain_status || "").toLowerCase();

    return (
      Boolean(item.blockchain_tx_hash) &&
      (blockchainStatus === "recorded" ||
        blockchainStatus === "confirmed" ||
        blockchainStatus === "success")
    );
  });

  if (hasBlockchainProof) {
    return {
      input_hash: normalizedHash,
      status: "Verified",
      verified: true,
      matched: true,
      message:
        "Hash matched an evidence record and blockchain transaction proof exists.",
      matches,
    };
  }

  return {
    input_hash: normalizedHash,
    status: "Matched",
    verified: false,
    matched: true,
    message:
      "Hash matched an evidence record, but blockchain proof is missing or not recorded.",
    matches,
  };
}

function normalizeHash(value: string) {
  return value.trim().replace(/^0x/i, "").toLowerCase();
}