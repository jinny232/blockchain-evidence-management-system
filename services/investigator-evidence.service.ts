import { createHash } from "crypto";
import type { ResultSetHeader } from "mysql2";
import { db } from "@/lib/db";
import { uploadFileToPinata } from "@/services/ipfs.service";
import { submitEvidenceToBlockchain } from "@/services/blockchain.service";
import type {
  InvestigatorEvidenceDetails,
  InvestigatorEvidenceListItem,
  InvestigatorEvidenceType,
  SubmittedEvidenceReceipt,
} from "@/models/investigator-evidence.model";

type InvestigatorUser = {
  id: number;
  full_name: string;
  username: string;
  email: string | null;
};

type AssignedCase = {
  id: number;
  case_code: string;
  title: string;
};

async function getActiveInvestigator(investigatorId: number) {
  const [userRows] = await db.query(
    `
    SELECT id, full_name, username, email
    FROM users
    WHERE id = ?
      AND role = 'Investigator'
      AND active = 1
    LIMIT 1
    `,
    [investigatorId]
  );

  const users = userRows as InvestigatorUser[];

  if (users.length === 0) {
    throw new Error("Investigator account not found.");
  }

  return users[0];
}

export async function getInvestigatorEvidence(
  investigatorId: number
): Promise<InvestigatorEvidenceListItem[]> {
  const investigator = await getActiveInvestigator(investigatorId);

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
      e.status,
      e.created_at,
      e.updated_at,
      e.blockchain_tx_hash,
      e.blockchain_status
    FROM evidence e
    LEFT JOIN cases c
      ON c.id = e.case_id
    WHERE e.submitted_by IN (?, ?)
    ORDER BY e.created_at DESC
    `,
    [investigator.full_name, investigator.username]
  );

  return rows as InvestigatorEvidenceListItem[];
}

export async function getInvestigatorEvidenceDetails(
  investigatorId: number,
  evidenceId: number
): Promise<InvestigatorEvidenceDetails | null> {
  const investigator = await getActiveInvestigator(investigatorId);

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
      e.status,
      e.created_at,
      e.updated_at,
      e.blockchain_tx_hash,
      e.blockchain_status
    FROM evidence e
    LEFT JOIN cases c
      ON c.id = e.case_id
    WHERE e.id = ?
      AND e.submitted_by IN (?, ?)
    LIMIT 1
    `,
    [evidenceId, investigator.full_name, investigator.username]
  );

  const evidence = rows as InvestigatorEvidenceDetails[];

  return evidence[0] || null;
}

export async function submitEvidenceByInvestigator(params: {
  investigatorId: number;
  caseId: number;
  evidenceType: InvestigatorEvidenceType;
  description: string | null;
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<SubmittedEvidenceReceipt> {
  const investigator = await getActiveInvestigator(params.investigatorId);

  const [caseRows] = await db.query(
    `
    SELECT
      c.id,
      c.case_code,
      c.title
    FROM cases c
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    WHERE c.id = ?
      AND cta.user_id = ?
      AND cta.role = 'Investigator'
    LIMIT 1
    `,
    [params.caseId, investigator.id]
  );

  const assignedCases = caseRows as AssignedCase[];

  if (assignedCases.length === 0) {
    throw new Error("This case is not assigned to you.");
  }

  const assignedCase = assignedCases[0];

  const fileHash = createHash("sha256")
    .update(params.fileBuffer)
    .digest("hex");

  let ipfsCid: string | null = null;

  try {
    ipfsCid = await uploadFileToPinata({
      buffer: params.fileBuffer,
      fileName: params.fileName,
      mimeType: params.mimeType,
    });
  } catch (error) {
    console.error("IPFS UPLOAD ERROR:", error);
    ipfsCid = null;
  }

  const [result] = await db.query<ResultSetHeader>(
    `
    INSERT INTO evidence (
      case_id,
      evidence_type,
      description,
      file_hash,
      ipfs_cid,
      submitted_by,
      status,
      blockchain_status
    )
    VALUES (?, ?, ?, ?, ?, ?, 'Pending', 'Not Recorded')
    `,
    [
      assignedCase.id,
      params.evidenceType,
      params.description,
      fileHash,
      ipfsCid,
      investigator.full_name,
    ]
  );

  const evidenceId = result.insertId;

  try {
    const blockchainResult = await submitEvidenceToBlockchain({
      caseCode: assignedCase.case_code,
      description: params.description,
      evidenceHash: fileHash,
    });

    if (blockchainResult) {
      await db.query(
        `
        UPDATE evidence
        SET
          blockchain_tx_hash = ?,
          blockchain_status = 'Recorded'
        WHERE id = ?
        `,
        [blockchainResult.txHash, evidenceId]
      );
    }
  } catch (error) {
    console.error("BLOCKCHAIN RECORD ERROR:", error);

    await db.query(
      `
      UPDATE evidence
      SET blockchain_status = 'Failed'
      WHERE id = ?
      `,
      [evidenceId]
    );
  }

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
      e.created_at,
      e.blockchain_tx_hash,
      e.blockchain_status
    FROM evidence e
    INNER JOIN cases c
      ON c.id = e.case_id
    WHERE e.id = ?
    LIMIT 1
    `,
    [evidenceId]
  );

  const evidence = (evidenceRows as SubmittedEvidenceReceipt[])[0];

  if (!evidence) {
    throw new Error("Evidence was saved but receipt could not be loaded.");
  }

  return evidence;
}