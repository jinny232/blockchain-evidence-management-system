import { db } from "@/lib/db";
import type {
  TrustedAssistantAction,
  TrustedAssistantCard,
  TrustedAssistantResponse,
} from "@/models/trusted-assistant.model";
import {
  understandTrustedAssistantQuestion,
  type TrustedAssistantNlpResult,
} from "@/services/trusted-assistant-nlp.service";

type UserRole = "Admin" | "Investigator" | "Lab Technician" | "Lawyer" | "Judge";

interface AssistantSession {
  userId: number;
  role: UserRole;
}

type CaseRow = {
  id: number;
  case_code: string | null;
  title: string | null;
};

type EvidenceRow = {
  id: number;
  case_id: number | null;
  case_code: string | null;
  case_title: string | null;
  evidence_type: string;
  status: string;
  file_hash: string;
  blockchain_status: string | null;
  blockchain_tx_hash: string | null;
  submitted_by: string | null;
};

type TeamRow = {
  case_id: number;
  case_code: string | null;
  case_title: string | null;
  user_id: number;
  full_name: string;
  username: string;
  role: string;
};

type LabReportRow = {
  id: number;
  evidence_id: number;
  case_id: number | null;
  case_code: string | null;
  case_title: string | null;
  analysis_type: string | null;
  conclusion: string | null;
  analyzed_by: string;
};

type VerdictRow = {
  id: number;
  case_id: number;
  case_code: string | null;
  case_title: string | null;
  verdict_title: string;
  decision: string;
  status: string | null;
};

export async function askTrustedAssistant(
  question: string,
  session: AssistantSession
): Promise<TrustedAssistantResponse> {
  const cleanQuestion = question.trim();

  const nlp = await understandTrustedAssistantQuestion(cleanQuestion);

  let cards: TrustedAssistantCard[] = [];

  if (nlp.intent === "SEARCH_CASE") {
    cards = await searchCases(nlp, session);
  }

  if (nlp.intent === "SEARCH_EVIDENCE") {
    cards = await searchEvidence(nlp, session);
  }

  if (nlp.intent === "SEARCH_TEAM") {
    cards = await searchTeams(nlp, session);
  }

  if (nlp.intent === "SEARCH_LAB_REPORT") {
    cards = await searchLabReports(nlp, session);
  }

  if (nlp.intent === "SEARCH_VERDICT") {
    cards = await searchVerdicts(nlp, session);
  }

  if (
    nlp.intent === "EXPLAIN_HASH" ||
    nlp.intent === "EXPLAIN_BLOCKCHAIN" ||
    nlp.intent === "EXPLAIN_IPFS" ||
    nlp.intent === "EXPLAIN_WORKFLOW" ||
    nlp.intent === "EXPLAIN_VERIFICATION" ||
    nlp.intent === "EXPLAIN_STATUS"
  ) {
    cards = getHelpCardsByIntent(nlp, session.role);
  }

  if (cards.length === 0) {
    return {
      answer:
        "I could not find a matching record. Try asking naturally with a case code, evidence hash, case title, team member name, report keyword, or verdict keyword.",
      cards: [
        {
          type: "help",
          title: "Search Tips",
          subtitle: "Trusted Assistant understands natural questions.",
          description:
            "Try: show me my assigned team, who works on case C-1001, show pending evidence, find fire case, where can I verify evidence, or explain blockchain proof.",
          status: "Help",
          actions: [
            {
              label: "Open Verify Evidence",
              href: "/verify",
              variant: "primary",
            },
          ],
        },
      ],
      suggestions: defaultSuggestions(session.role),
    };
  }

  return {
    answer: createAnswerText(nlp, cards.length),
    cards: cards.slice(0, 8),
    suggestions: defaultSuggestions(session.role),
  };
}

async function searchCases(
  nlp: TrustedAssistantNlpResult,
  session: AssistantSession
) {
  const params: unknown[] = [];
  let accessJoin = "";
  let accessWhere = "1 = 1";

  if (session.role !== "Admin") {
    accessJoin = `
      INNER JOIN case_team_assignments access_cta
        ON access_cta.case_id = c.id
    `;
    accessWhere = `
      access_cta.user_id = ?
      AND access_cta.role = ?
    `;
    params.push(session.userId, session.role);
  }

  const searchValue = nlp.caseCode || nlp.searchText;
  const keywordWhere = searchValue
    ? `
      AND (
        c.case_code LIKE ?
        OR c.title LIKE ?
      )
    `
    : "";

  const keywordParams = searchValue ? [`%${searchValue}%`, `%${searchValue}%`] : [];

  const [rows] = await db.query(
    `
    SELECT DISTINCT
      c.id,
      c.case_code,
      c.title
    FROM cases c
    ${accessJoin}
    WHERE ${accessWhere}
    ${keywordWhere}
    ORDER BY c.id DESC
    LIMIT 5
    `,
    [...params, ...keywordParams]
  );

  return (rows as CaseRow[]).map((item) => {
    const actions: TrustedAssistantAction[] = [
      {
        label: "Open Case Details",
        href: getCaseHref(session.role, item.id),
        variant: "primary",
      },
      {
        label: "Verify Evidence",
        href: "/verify",
        variant: "secondary",
      },
    ];

    return {
      type: "case",
      title: item.case_code || `Case #${item.id}`,
      subtitle: item.title || "Untitled case",
      description: "Matching case record found.",
      status: null,
      metadata: [
        { label: "Case ID", value: `#${item.id}` },
        { label: "Case Code", value: item.case_code || "-" },
      ],
      actions,
    } satisfies TrustedAssistantCard;
  });
}

async function searchEvidence(
  nlp: TrustedAssistantNlpResult,
  session: AssistantSession
) {
  const params: unknown[] = [];
  let accessJoin = "";
  let accessWhere = "1 = 1";

  if (session.role !== "Admin") {
    accessJoin = `
      INNER JOIN case_team_assignments access_cta
        ON access_cta.case_id = e.case_id
    `;
    accessWhere = `
      access_cta.user_id = ?
      AND access_cta.role = ?
    `;
    params.push(session.userId, session.role);
  }

  const conditions: string[] = [];
  const conditionParams: unknown[] = [];

  if (nlp.evidenceId) {
    conditions.push("e.id = ?");
    conditionParams.push(nlp.evidenceId);
  }

  if (nlp.evidenceHash) {
    conditions.push("e.file_hash LIKE ?");
    conditionParams.push(`%${nlp.evidenceHash}%`);
  }

  if (nlp.caseCode) {
    conditions.push("c.case_code LIKE ?");
    conditionParams.push(`%${nlp.caseCode}%`);
  }

  if (nlp.status) {
    conditions.push("e.status = ?");
    conditionParams.push(nlp.status);
  }

  if (nlp.searchText) {
    conditions.push(`
      (
        CAST(e.id AS CHAR) LIKE ?
        OR e.file_hash LIKE ?
        OR e.description LIKE ?
        OR e.evidence_type LIKE ?
        OR c.case_code LIKE ?
        OR c.title LIKE ?
      )
    `);

    const keyword = `%${nlp.searchText}%`;
    conditionParams.push(keyword, keyword, keyword, keyword, keyword, keyword);
  }

  const keywordWhere =
    conditions.length > 0 ? `AND (${conditions.join(" OR ")})` : "";

  const [rows] = await db.query(
    `
    SELECT DISTINCT
      e.id,
      e.case_id,
      c.case_code,
      c.title AS case_title,
      e.evidence_type,
      e.status,
      e.file_hash,
      e.blockchain_status,
      e.blockchain_tx_hash,
      e.submitted_by
    FROM evidence e
    LEFT JOIN cases c
      ON c.id = e.case_id
    ${accessJoin}
    WHERE ${accessWhere}
    ${keywordWhere}
    ORDER BY e.id DESC
    LIMIT 5
    `,
    [...params, ...conditionParams]
  );

  return (rows as EvidenceRow[]).map((item) => {
    return {
      type: "evidence",
      title: `Evidence #${item.id}`,
      subtitle: `${item.case_code || "No Case Code"} • ${item.evidence_type}`,
      description: `Submitted by ${item.submitted_by || "Unknown"}.`,
      status: item.status,
      metadata: [
        { label: "Case", value: item.case_title || "-" },
        { label: "Blockchain", value: item.blockchain_status || "Not Recorded" },
        { label: "Hash", value: shorten(item.file_hash) },
      ],
      actions: [
        {
          label: "Open Evidence Details",
          href: getEvidenceHref(session.role, item.id),
          variant: "primary",
        },
        {
          label: "Verify Hash",
          href: "/verify",
          variant: "success",
        },
      ],
    } satisfies TrustedAssistantCard;
  });
}

async function searchTeams(
  nlp: TrustedAssistantNlpResult,
  session: AssistantSession
) {
  const params: unknown[] = [];

  let accessJoin = "";
  let accessWhere = "1 = 1";

  if (session.role !== "Admin") {
    accessJoin = `
      INNER JOIN case_team_assignments access_cta
        ON access_cta.case_id = c.id
    `;
    accessWhere = `
      access_cta.user_id = ?
      AND access_cta.role = ?
    `;
    params.push(session.userId, session.role);
  }

  const searchValue = nlp.caseCode || nlp.searchText;

  const keywordWhere = searchValue
    ? `
      AND (
        c.case_code LIKE ?
        OR c.title LIKE ?
        OR u.full_name LIKE ?
        OR u.username LIKE ?
        OR team_cta.role LIKE ?
      )
    `
    : "";

  const keywordParams = searchValue
    ? [
        `%${searchValue}%`,
        `%${searchValue}%`,
        `%${searchValue}%`,
        `%${searchValue}%`,
        `%${searchValue}%`,
      ]
    : [];

  const [rows] = await db.query(
    `
    SELECT DISTINCT
      c.id AS case_id,
      c.case_code,
      c.title AS case_title,
      u.id AS user_id,
      u.full_name,
      u.username,
      team_cta.role
    FROM case_team_assignments team_cta
    INNER JOIN cases c
      ON c.id = team_cta.case_id
    INNER JOIN users u
      ON u.id = team_cta.user_id
    ${accessJoin}
    WHERE ${accessWhere}
    ${keywordWhere}
    ORDER BY c.id DESC, team_cta.role ASC
    LIMIT 10
    `,
    [...params, ...keywordParams]
  );

  return (rows as TeamRow[]).map((item) => {
    return {
      type: "team",
      title: item.full_name,
      subtitle: `${item.role} • ${item.case_code || "No Case Code"}`,
      description: item.case_title || "Assigned case member.",
      status: item.role,
      metadata: [
        { label: "Username", value: item.username },
        { label: "Case", value: item.case_code || "-" },
        { label: "Case Title", value: item.case_title || "-" },
      ],
      actions: [
        {
          label: "Open Case Details",
          href: getCaseHref(session.role, item.case_id),
          variant: "primary",
        },
      ],
    } satisfies TrustedAssistantCard;
  });
}

async function searchLabReports(
  nlp: TrustedAssistantNlpResult,
  session: AssistantSession
) {
  const params: unknown[] = [];

  let accessJoin = "";
  let accessWhere = "1 = 1";

  if (session.role !== "Admin") {
    accessJoin = `
      INNER JOIN case_team_assignments access_cta
        ON access_cta.case_id = e.case_id
    `;
    accessWhere = `
      access_cta.user_id = ?
      AND access_cta.role = ?
    `;
    params.push(session.userId, session.role);
  }

  const searchValue = nlp.caseCode || nlp.searchText;
  const conditions: string[] = [];
  const conditionParams: unknown[] = [];

  if (nlp.status) {
    conditions.push("lr.conclusion LIKE ?");
    conditionParams.push(`%${nlp.status}%`);
  }

  if (searchValue) {
    conditions.push(`
      (
        CAST(lr.id AS CHAR) LIKE ?
        OR CAST(lr.evidence_id AS CHAR) LIKE ?
        OR lr.analysis_type LIKE ?
        OR lr.conclusion LIKE ?
        OR lr.result LIKE ?
        OR lr.analyzed_by LIKE ?
        OR c.case_code LIKE ?
        OR c.title LIKE ?
      )
    `);

    const keyword = `%${searchValue}%`;
    conditionParams.push(
      keyword,
      keyword,
      keyword,
      keyword,
      keyword,
      keyword,
      keyword,
      keyword
    );
  }

  const keywordWhere =
    conditions.length > 0 ? `AND (${conditions.join(" OR ")})` : "";

  const [rows] = await db.query(
    `
    SELECT DISTINCT
      lr.id,
      lr.evidence_id,
      e.case_id,
      c.case_code,
      c.title AS case_title,
      lr.analysis_type,
      lr.conclusion,
      lr.analyzed_by
    FROM lab_results lr
    INNER JOIN evidence e
      ON e.id = lr.evidence_id
    INNER JOIN cases c
      ON c.id = e.case_id
    ${accessJoin}
    WHERE ${accessWhere}
    ${keywordWhere}
    ORDER BY lr.id DESC
    LIMIT 5
    `,
    [...params, ...conditionParams]
  );

  return (rows as LabReportRow[]).map((item) => {
    return {
      type: "lab_report",
      title: `Lab Report #${item.id}`,
      subtitle: `${item.case_code || "No Case Code"} • Evidence #${
        item.evidence_id
      }`,
      description: `Analyzed by ${item.analyzed_by}.`,
      status: item.conclusion || "No Conclusion",
      metadata: [
        { label: "Analysis Type", value: item.analysis_type || "General Analysis" },
        { label: "Case", value: item.case_title || "-" },
      ],
      actions: [
        {
          label: "Open Evidence Details",
          href: getEvidenceHref(session.role, item.evidence_id),
          variant: "primary",
        },
        {
          label: "Verify Evidence",
          href: "/verify",
          variant: "success",
        },
      ],
    } satisfies TrustedAssistantCard;
  });
}

async function searchVerdicts(
  nlp: TrustedAssistantNlpResult,
  session: AssistantSession
) {
  const params: unknown[] = [];

  let accessWhere = "1 = 1";
  let accessJoin = "";

  if (session.role === "Judge") {
    accessWhere = "cv.judge_id = ?";
    params.push(session.userId);
  } else if (session.role !== "Admin") {
    accessJoin = `
      INNER JOIN case_team_assignments access_cta
        ON access_cta.case_id = cv.case_id
    `;
    accessWhere = `
      access_cta.user_id = ?
      AND access_cta.role = ?
    `;
    params.push(session.userId, session.role);
  }

  const searchValue = nlp.caseCode || nlp.searchText;
  const conditions: string[] = [];
  const conditionParams: unknown[] = [];

  if (nlp.status) {
    conditions.push("cv.status = ?");
    conditionParams.push(nlp.status);
  }

  if (searchValue) {
    conditions.push(`
      (
        CAST(cv.id AS CHAR) LIKE ?
        OR cv.verdict_title LIKE ?
        OR cv.decision LIKE ?
        OR cv.verdict_summary LIKE ?
        OR cv.sentence_text LIKE ?
        OR c.case_code LIKE ?
        OR c.title LIKE ?
      )
    `);

    const keyword = `%${searchValue}%`;
    conditionParams.push(
      keyword,
      keyword,
      keyword,
      keyword,
      keyword,
      keyword,
      keyword
    );
  }

  const keywordWhere =
    conditions.length > 0 ? `AND (${conditions.join(" OR ")})` : "";

  const [rows] = await db.query(
    `
    SELECT DISTINCT
      cv.id,
      cv.case_id,
      c.case_code,
      c.title AS case_title,
      cv.verdict_title,
      cv.decision,
      cv.status
    FROM court_verdicts cv
    INNER JOIN cases c
      ON c.id = cv.case_id
    ${accessJoin}
    WHERE ${accessWhere}
    ${keywordWhere}
    ORDER BY cv.id DESC
    LIMIT 5
    `,
    [...params, ...conditionParams]
  );

  return (rows as VerdictRow[]).map((item) => {
    const actions: TrustedAssistantAction[] = [
      {
        label: session.role === "Judge" ? "Open Verdicts" : "Open Case Details",
        href:
          session.role === "Judge"
            ? "/judge/verdicts"
            : getCaseHref(session.role, item.case_id),
        variant: "primary",
      },
    ];

    if (session.role === "Judge") {
      actions.push({
        label: "Download PDF",
        href: `/api/judge/verdicts/${item.id}/pdf`,
        variant: "warning",
      });
    }

    return {
      type: "verdict",
      title: item.verdict_title,
      subtitle: `${item.case_code || "No Case Code"} • ${item.decision}`,
      description: item.case_title || "Court verdict record.",
      status: item.status || "Draft",
      metadata: [
        { label: "Verdict ID", value: `#${item.id}` },
        { label: "Case ID", value: `#${item.case_id}` },
      ],
      actions,
    } satisfies TrustedAssistantCard;
  });
}

function getHelpCardsByIntent(
  nlp: TrustedAssistantNlpResult,
  role: UserRole
): TrustedAssistantCard[] {
  if (nlp.intent === "EXPLAIN_HASH") {
    return [
      {
        type: "help",
        title: "SHA-256 Hash",
        subtitle: "Evidence integrity",
        description:
          "SHA-256 creates a unique digital fingerprint for an evidence file. If the file changes, the hash changes too. This helps detect tampering.",
        status: "Help",
        actions: [
          {
            label: "Open Verify Evidence",
            href: "/verify",
            variant: "primary",
          },
        ],
      },
    ];
  }

  if (nlp.intent === "EXPLAIN_BLOCKCHAIN") {
    return [
      {
        type: "help",
        title: "Blockchain Proof",
        subtitle: "Immutable evidence record",
        description:
          "The system records the evidence hash on blockchain. This gives proof that the evidence hash existed at that time and was not silently changed later.",
        status: "Help",
        actions: [
          {
            label: "Open Verify Evidence",
            href: "/verify",
            variant: "primary",
          },
        ],
      },
    ];
  }

  if (nlp.intent === "EXPLAIN_IPFS") {
    return [
      {
        type: "help",
        title: "IPFS CID",
        subtitle: "Evidence file reference",
        description:
          "IPFS stores the file content and returns a CID. The CID helps identify the uploaded file, while SHA-256 helps verify file integrity.",
        status: "Help",
        actions: [
          {
            label: "Open Verify Evidence",
            href: "/verify",
            variant: "primary",
          },
        ],
      },
    ];
  }

  if (nlp.intent === "EXPLAIN_VERIFICATION") {
    return [
      {
        type: "help",
        title: "Evidence Verification",
        subtitle: "Check hash and blockchain proof",
        description:
          "The verification page lets users enter a SHA-256 hash or upload a file. The system compares the hash with stored evidence records and shows blockchain proof if available.",
        status: "Help",
        actions: [
          {
            label: "Open Verify Evidence",
            href: "/verify",
            variant: "primary",
          },
        ],
      },
    ];
  }

  if (nlp.intent === "EXPLAIN_STATUS") {
    return [
      {
        type: "help",
        title: "Evidence Status Flow",
        subtitle: "Pending → Accepted → Analyzed",
        description:
          "Pending means evidence was submitted. Accepted means the lab technician accepted it. Analyzed means the lab report was submitted. Final usually means the verdict is completed.",
        status: nlp.status || "Help",
        actions: [
          {
            label:
              role === "Lab Technician"
                ? "Open Evidence Queue"
                : "Open Verify Evidence",
            href: role === "Lab Technician" ? "/lab/evidence" : "/verify",
            variant: "primary",
          },
        ],
      },
    ];
  }

  return [
    {
      type: "help",
      title: "System Workflow",
      subtitle: "Chain of custody",
      description:
        "Investigator submits evidence, the system stores hash/IPFS/blockchain proof, lab technician analyzes evidence, lawyer reviews case information, and judge creates the final verdict.",
      status: "Help",
      actions: [
        {
          label: "Open Verify Evidence",
          href: "/verify",
          variant: "primary",
        },
      ],
    },
  ];
}

function createAnswerText(nlp: TrustedAssistantNlpResult, count: number) {
  if (nlp.intent.startsWith("EXPLAIN")) {
    return "Here is a system guide for your question.";
  }

  return `I found ${count} matching result${
    count === 1 ? "" : "s"
  }. Use the buttons below to open the correct page.`;
}

function getCaseHref(role: UserRole, caseId: number) {
  if (role === "Admin") return "/admin/cases";
  if (role === "Investigator") return `/investigator/cases/${caseId}`;
  if (role === "Lawyer") return `/legal/cases/${caseId}`;
  if (role === "Judge") return `/judge/cases/${caseId}`;

  return "/lab/evidence";
}

function getEvidenceHref(role: UserRole, evidenceId: number) {
  if (role === "Investigator") return `/investigator/evidence/${evidenceId}`;
  if (role === "Lab Technician") return `/lab/evidence/${evidenceId}`;
  if (role === "Lawyer") return `/legal/evidence/${evidenceId}`;
  if (role === "Judge") return `/judge/evidence/${evidenceId}`;

  return "/verify";
}

function defaultSuggestions(role: UserRole) {
  const common = [
    "Explain SHA-256 hash",
    "What is blockchain proof?",
    "How does evidence verification work?",
  ];

  if (role === "Admin") {
    return ["Show assigned teams", "Find case C-1001", ...common];
  }

  if (role === "Investigator") {
    return ["Show my cases", "Find my evidence", ...common];
  }

  if (role === "Lab Technician") {
    return ["Show pending evidence", "Find lab report", ...common];
  }

  if (role === "Lawyer") {
    return ["Show my legal cases", "Find evidence for case", ...common];
  }

  return ["Show me assigned team", "Find verdict", ...common];
}

function shorten(value: string) {
  if (!value) return "-";
  if (value.length <= 18) return value;

  return `${value.slice(0, 10)}...${value.slice(-8)}`;
}