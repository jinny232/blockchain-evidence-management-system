import { createHash } from "crypto";
import { uploadFileToPinata } from "@/services/ipfs.service";
import { db } from "@/lib/db";
import type {
  LabEvidenceDetails,
  LabEvidenceItem,
  LabResult,
  SubmitLabResultInput,
} from "@/models/lab-evidence.model";


type LabTechnicianUser = {
  id: number;
  full_name: string;
  username: string;
  email: string | null;
};

async function getActiveLabTechnician(technicianId: number) {
  const [rows] = await db.query(
    `
    SELECT id, full_name, username, email
    FROM users
    WHERE id = ?
      AND role = 'Lab Technician'
      AND active = 1
    LIMIT 1
    `,
    [technicianId]
  );

  const users = rows as LabTechnicianUser[];

  if (users.length === 0) {
    throw new Error("Lab technician account not found.");
  }

  return users[0];
}

export async function getLabEvidenceQueue(
  technicianId: number
): Promise<LabEvidenceItem[]> {
  await getActiveLabTechnician(technicianId);

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
      e.blockchain_tx_hash,
      e.blockchain_status,
      e.created_at,
      e.updated_at,
      COUNT(DISTINCT lr.id) AS report_count,
      MAX(lr.conclusion) AS latest_conclusion
    FROM evidence e
    INNER JOIN cases c
      ON c.id = e.case_id
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    LEFT JOIN lab_results lr
      ON lr.evidence_id = e.id
    WHERE cta.user_id = ?
      AND cta.role = 'Lab Technician'
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
    [technicianId]
  );

  return rows as LabEvidenceItem[];
}

export async function getLabEvidenceDetails(
  technicianId: number,
  evidenceId: number
): Promise<LabEvidenceDetails | null> {
  await getActiveLabTechnician(technicianId);

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
      e.blockchain_tx_hash,
      e.blockchain_status,
      e.created_at,
      e.updated_at,
      COUNT(DISTINCT lr.id) AS report_count,
      MAX(lr.conclusion) AS latest_conclusion
    FROM evidence e
    INNER JOIN cases c
      ON c.id = e.case_id
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    LEFT JOIN lab_results lr
      ON lr.evidence_id = e.id
    WHERE e.id = ?
      AND cta.user_id = ?
      AND cta.role = 'Lab Technician'
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
    LIMIT 1
    `,
    [evidenceId, technicianId]
  );

  const evidence = (rows as LabEvidenceItem[])[0];

  if (!evidence) {
    return null;
  }

  const [reportRows] = await db.query(
    `
    SELECT
  id,
  evidence_id,
  analyzed_by,
  analysis_type,
  result,
  conclusion,
  attachment_name,
  attachment_mime_type,
  attachment_size,
  attachment_hash,
  attachment_ipfs_cid,
  created_at
FROM lab_results
    WHERE evidence_id = ?
    ORDER BY created_at DESC
    `,
    [evidenceId]
  );

  return {
    ...evidence,
    reports: reportRows as LabResult[],
  };
}

export async function acceptLabEvidence(
  technicianId: number,
  evidenceId: number
) {
  const technician = await getActiveLabTechnician(technicianId);

  const evidence = await getLabEvidenceDetails(technician.id, evidenceId);

  if (!evidence) {
    throw new Error("Evidence not found or not assigned to you.");
  }

  if (evidence.status !== "Pending") {
    throw new Error("Only Pending evidence can be accepted.");
  }

  await db.query(
    `
    UPDATE evidence
    SET status = 'Accepted'
    WHERE id = ?
    `,
    [evidenceId]
  );

  return {
    technician,
    evidence: await getLabEvidenceDetails(technician.id, evidenceId),
  };
}

export async function submitLabResult(
  technicianId: number,
  evidenceId: number,
  input: SubmitLabResultInput
) {
  const technician = await getActiveLabTechnician(technicianId);

  const evidence = await getLabEvidenceDetails(technician.id, evidenceId);

  if (!evidence) {
    throw new Error("Evidence not found or not assigned to you.");
  }

  if (evidence.status !== "Accepted") {
    throw new Error("Only Accepted evidence can be analyzed.");
  }

  let attachmentName: string | null = null;
  let attachmentMimeType: string | null = null;
  let attachmentSize: number | null = null;
  let attachmentHash: string | null = null;
  let attachmentIpfsCid: string | null = null;

  if (input.attachment) {
    attachmentName = input.attachment.fileName;
    attachmentMimeType = input.attachment.mimeType;
    attachmentSize = input.attachment.size;

    attachmentHash = createHash("sha256")
      .update(input.attachment.buffer)
      .digest("hex");

    try {
      attachmentIpfsCid = await uploadFileToPinata({
        buffer: input.attachment.buffer,
        fileName: input.attachment.fileName,
        mimeType: input.attachment.mimeType,
      });
    } catch (error) {
      console.error("LAB REPORT ATTACHMENT IPFS ERROR:", error);
      attachmentIpfsCid = null;
    }
  }

  await db.query(
    `
    INSERT INTO lab_results (
      evidence_id,
      analyzed_by,
      analysis_type,
      result,
      conclusion,
      attachment_name,
      attachment_mime_type,
      attachment_size,
      attachment_hash,
      attachment_ipfs_cid
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      evidenceId,
      technician.full_name,
      input.analysis_type,
      input.result,
      input.conclusion,
      attachmentName,
      attachmentMimeType,
      attachmentSize,
      attachmentHash,
      attachmentIpfsCid,
    ]
  );

  await db.query(
    `
    UPDATE evidence
    SET status = 'Analyzed'
    WHERE id = ?
    `,
    [evidenceId]
  );

  return {
    technician,
    evidence: await getLabEvidenceDetails(technician.id, evidenceId),
  };
}