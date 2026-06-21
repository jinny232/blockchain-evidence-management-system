import PDFDocument from "pdfkit";
import { db } from "@/lib/db";

type JudgeUser = {
  id: number;
  full_name: string;
  username: string;
  email: string | null;
};

export type JudgeVerdictPdfData = {
  id: number;
  judge_id: number;
  case_id: number;
  verdict_title: string;
  decision: string;
  verdict_summary: string;
  sentence_text: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;

  judge_name: string | null;
  judge_username: string | null;

  case_code: string | null;
  case_title: string | null;
};

async function getActiveJudge(judgeId: number) {
  const [rows] = await db.query(
    `
    SELECT id, full_name, username, email
    FROM users
    WHERE id = ?
      AND role = 'Judge'
      AND active = 1
    LIMIT 1
    `,
    [judgeId]
  );

  const users = rows as JudgeUser[];

  if (users.length === 0) {
    throw new Error("Judge account not found.");
  }

  return users[0];
}

export async function getJudgeVerdictForPdf(
  judgeId: number,
  verdictId: number
): Promise<JudgeVerdictPdfData | null> {
  await getActiveJudge(judgeId);

  const [rows] = await db.query(
    `
    SELECT
      cv.id,
      cv.judge_id,
      cv.case_id,
      cv.verdict_title,
      cv.decision,
      cv.verdict_summary,
      cv.sentence_text,
      cv.status,
      cv.created_at,
      cv.updated_at,

      u.full_name AS judge_name,
      u.username AS judge_username,

      c.case_code,
      c.title AS case_title
    FROM court_verdicts cv
    INNER JOIN users u
      ON u.id = cv.judge_id
    INNER JOIN cases c
      ON c.id = cv.case_id
    WHERE cv.id = ?
      AND cv.judge_id = ?
    LIMIT 1
    `,
    [verdictId, judgeId]
  );

  return (rows as JudgeVerdictPdfData[])[0] || null;
}

export async function generateJudgeVerdictPdf(verdict: JudgeVerdictPdfData) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: `Court Verdict ${verdict.id}`,
        Author: "Blockchain Evidence Management System",
        Subject: "Official Court Verdict Report",
      },
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    drawTitle(doc, "OFFICIAL COURT VERDICT");
    drawSubtitle(doc, "Blockchain Based Evidence Management System");

    doc.moveDown(1.2);

    drawSectionTitle(doc, "Verdict Information");
    drawRow(doc, "Verdict ID", `#${verdict.id}`);
    drawRow(doc, "Title", verdict.verdict_title);
    drawRow(doc, "Decision", verdict.decision);
    drawRow(doc, "Status", verdict.status || "Draft");
    drawRow(doc, "Created At", formatDate(verdict.created_at));
    drawRow(doc, "Updated At", formatDate(verdict.updated_at));

    drawSectionTitle(doc, "Case Information");
    drawRow(doc, "Case ID", `#${verdict.case_id}`);
    drawRow(doc, "Case Code", verdict.case_code || "-");
    drawRow(doc, "Case Title", verdict.case_title || "-");

    drawSectionTitle(doc, "Judge Information");
    drawRow(doc, "Judge ID", `#${verdict.judge_id}`);
    drawRow(doc, "Judge Name", verdict.judge_name || "-");
    drawRow(doc, "Username", verdict.judge_username || "-");

    drawSectionTitle(doc, "Verdict Summary");
    drawParagraph(doc, verdict.verdict_summary || "-");

    drawSectionTitle(doc, "Sentence / Court Order");
    drawParagraph(doc, verdict.sentence_text || "No sentence text provided.");

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
    .fillColor("#d97706")
    .text(title);

  doc
    .moveTo(doc.x, doc.y + 4)
    .lineTo(545, doc.y + 4)
    .strokeColor("#fde68a")
    .stroke();

  doc.moveDown(0.7);
}

function drawRow(doc: PDFKit.PDFDocument, label: string, value: string) {
  const leftX = 50;
  const rightX = 210;
  const y = doc.y;

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#334155")
    .text(label, leftX, y, {
      width: 150,
    });

  doc.font("Helvetica").fillColor("#0f172a").text(value || "-", rightX, y, {
    width: 335,
  });

  doc.moveDown(0.7);
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
      "Generated by Blockchain Based Evidence Management System.This document represents the official court verdict record stored in the system.",
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