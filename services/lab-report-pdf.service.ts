import PDFDocument from "pdfkit";
import { db } from "@/lib/db";
import type { LabReportItem } from "@/models/lab-report.model";

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

export async function getLabReportForPdf(
  technicianId: number,
  reportId: number
): Promise<LabReportItem | null> {
  const technician = await getActiveLabTechnician(technicianId);

  const [rows] = await db.query(
    `
    SELECT
      lr.id,
      lr.evidence_id,
      lr.analyzed_by,
      lr.analysis_type,
      lr.result,
      lr.conclusion,
      lr.created_at,

      e.case_id,
      c.case_code,
      c.title AS case_title,

      e.evidence_type,
      e.status AS evidence_status,
      e.submitted_by,
      e.file_hash,
      e.ipfs_cid,
      e.blockchain_tx_hash,
      e.blockchain_status
    FROM lab_results lr
    INNER JOIN evidence e
      ON e.id = lr.evidence_id
    INNER JOIN cases c
      ON c.id = e.case_id
    INNER JOIN case_team_assignments cta
      ON cta.case_id = c.id
    WHERE lr.id = ?
      AND cta.user_id = ?
      AND cta.role = 'Lab Technician'
      AND lr.analyzed_by IN (?, ?)
    LIMIT 1
    `,
    [reportId, technician.id, technician.full_name, technician.username]
  );

  return (rows as LabReportItem[])[0] || null;
}

export async function generateLabReportPdf(report: LabReportItem) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: `Lab Report ${report.id}`,
        Author: "Blockchain Evidence Management System",
        Subject: "Forensic Laboratory Analysis Report",
      },
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    drawTitle(doc, "FORENSIC LABORATORY REPORT");
    drawSubtitle(doc, "Blockchain Based Evidence Management System");

    doc.moveDown(1.2);

    drawSectionTitle(doc, "Report Information");
    drawRow(doc, "Report ID", `#${report.id}`);
    drawRow(doc, "Evidence ID", `#${report.evidence_id}`);
    drawRow(doc, "Analysis Type", report.analysis_type || "General Analysis");
    drawRow(doc, "Analyzed By", report.analyzed_by);
    drawRow(doc, "Conclusion", report.conclusion || "No Conclusion");
    drawRow(doc, "Created At", formatDate(report.created_at));

    drawSectionTitle(doc, "Case Information");
    drawRow(doc, "Case Code", report.case_code || "-");
    drawRow(doc, "Case Title", report.case_title || "-");

    drawSectionTitle(doc, "Evidence Information");
    drawRow(doc, "Evidence Type", report.evidence_type);
    drawRow(doc, "Evidence Status", report.evidence_status);
    drawRow(doc, "Submitted By", report.submitted_by || "-");
    drawLongRow(doc, "SHA-256 File Hash", report.file_hash);
    drawLongRow(doc, "IPFS CID", report.ipfs_cid || "-");
    drawLongRow(
      doc,
      "Blockchain Transaction Hash",
      report.blockchain_tx_hash || "-"
    );
    drawRow(doc, "Blockchain Status", report.blockchain_status || "Not Recorded");

    drawSectionTitle(doc, "Laboratory Analysis Result");
    drawParagraph(doc, report.result || "-");

    drawFooter(doc);

    doc.end();
  });
}

function drawTitle(doc: PDFKit.PDFDocument, text: string) {
  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .fillColor("#0f172a")
    .text(text, { align: "center" });
}

function drawSubtitle(doc: PDFKit.PDFDocument, text: string) {
  doc
    .moveDown(0.4)
    .fontSize(10)
    .font("Helvetica")
    .fillColor("#475569")
    .text(text, { align: "center" });
}

function drawSectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(1.2);

  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .fillColor("#047857")
    .text(title);

  doc
    .moveTo(doc.x, doc.y + 4)
    .lineTo(545, doc.y + 4)
    .strokeColor("#d1fae5")
    .stroke();

  doc.moveDown(0.7);
}

function drawRow(doc: PDFKit.PDFDocument, label: string, value: string) {
  const leftX = 50;
  const rightX = 210;
  const y = doc.y;

  doc.fontSize(10).font("Helvetica-Bold").fillColor("#334155").text(label, leftX, y, {
    width: 150,
  });

  doc.font("Helvetica").fillColor("#0f172a").text(value || "-", rightX, y, {
    width: 335,
  });

  doc.moveDown(0.7);
}

function drawLongRow(doc: PDFKit.PDFDocument, label: string, value: string) {
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#334155").text(label);

  doc
    .moveDown(0.2)
    .fontSize(8.5)
    .font("Courier")
    .fillColor("#0f172a")
    .text(value || "-", {
      width: 495,
      align: "left",
    });

  doc.moveDown(0.8);
}

function drawParagraph(doc: PDFKit.PDFDocument, text: string) {
  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor("#0f172a")
    .text(text || "-", {
      width: 495,
      align: "left",
      lineGap: 4,
    });
}

function drawFooter(doc: PDFKit.PDFDocument) {
  const bottom = 780;

  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#64748b")
    .text(
      "Generated by Blockchain Based Evidence Management System. This report contains evidence hash and blockchain proof information for integrity verification.",
      50,
      bottom,
      {
        align: "center",
        width: 495,
      }
    );
}

function formatDate(value: string) {
  if (!value) return "-";

  return new Date(value).toLocaleString();
}