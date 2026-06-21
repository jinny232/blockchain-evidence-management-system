export type TrustedAssistantIntent =
  | "SEARCH_CASE"
  | "SEARCH_EVIDENCE"
  | "SEARCH_TEAM"
  | "SEARCH_LAB_REPORT"
  | "SEARCH_VERDICT"
  | "EXPLAIN_HASH"
  | "EXPLAIN_BLOCKCHAIN"
  | "EXPLAIN_IPFS"
  | "EXPLAIN_WORKFLOW"
  | "EXPLAIN_VERIFICATION"
  | "EXPLAIN_STATUS"
  | "UNKNOWN";

export type TrustedAssistantNlpResult = {
  intent: TrustedAssistantIntent;
  searchText: string | null;
  caseCode: string | null;
  evidenceId: number | null;
  evidenceHash: string | null;
  status: string | null;
  role: string | null;
  wantsAssignedToMe: boolean;
};

const fallbackResult: TrustedAssistantNlpResult = {
  intent: "UNKNOWN",
  searchText: null,
  caseCode: null,
  evidenceId: null,
  evidenceHash: null,
  status: null,
  role: null,
  wantsAssignedToMe: false,
};

export async function understandTrustedAssistantQuestion(
  question: string
): Promise<TrustedAssistantNlpResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return localIntentFallback(question);
  }

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        instructions: `
You are an NLP router for a Blockchain Based Evidence Management System.

Your job:
- Understand the user's natural language question.
- Return only structured JSON.
- Do not answer the user directly.
- Do not make legal decisions.
- Do not decide guilty or not guilty.
- Do not provide legal advice.
- Extract intent and useful search fields.

Intent rules:
SEARCH_CASE: user wants to find/open a case or investigation.
SEARCH_EVIDENCE: user wants evidence, hash, IPFS, blockchain tx, pending evidence, analyzed evidence.
SEARCH_TEAM: user asks who is assigned, team members, who works on case, my team.
SEARCH_LAB_REPORT: user asks lab report, analysis, conclusion.
SEARCH_VERDICT: user asks verdict, court decision, sentence.
EXPLAIN_HASH: user asks SHA-256, hash, tamper, integrity.
EXPLAIN_BLOCKCHAIN: user asks blockchain, transaction, Ganache, immutable proof.
EXPLAIN_IPFS: user asks IPFS or CID.
EXPLAIN_WORKFLOW: user asks how system works, process, chain of custody.
EXPLAIN_VERIFICATION: user asks how to verify evidence.
EXPLAIN_STATUS: user asks Pending, Accepted, Analyzed, Final, Draft, status meaning.
UNKNOWN: not related to this system.

Examples:
"show me assigned team" -> SEARCH_TEAM, wantsAssignedToMe true
"who works on fire case" -> SEARCH_TEAM, searchText "fire"
"find C-1001" -> SEARCH_CASE, caseCode "C-1001"
"where is case fire" -> SEARCH_CASE, searchText "fire"
"show pending evidence" -> SEARCH_EVIDENCE, status "Pending"
"find evidence 12" -> SEARCH_EVIDENCE, evidenceId 12
"check hash abc..." -> SEARCH_EVIDENCE, evidenceHash if it looks like a hash
"what is sha256" -> EXPLAIN_HASH
"what does pending mean" -> EXPLAIN_STATUS, status "Pending"
        `,
        input: question,
        text: {
          format: {
            type: "json_schema",
            name: "trusted_assistant_intent",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                intent: {
                  type: "string",
                  enum: [
                    "SEARCH_CASE",
                    "SEARCH_EVIDENCE",
                    "SEARCH_TEAM",
                    "SEARCH_LAB_REPORT",
                    "SEARCH_VERDICT",
                    "EXPLAIN_HASH",
                    "EXPLAIN_BLOCKCHAIN",
                    "EXPLAIN_IPFS",
                    "EXPLAIN_WORKFLOW",
                    "EXPLAIN_VERIFICATION",
                    "EXPLAIN_STATUS",
                    "UNKNOWN",
                  ],
                },
                searchText: {
                  type: ["string", "null"],
                },
                caseCode: {
                  type: ["string", "null"],
                },
                evidenceId: {
                  type: ["number", "null"],
                },
                evidenceHash: {
                  type: ["string", "null"],
                },
                status: {
                  type: ["string", "null"],
                },
                role: {
                  type: ["string", "null"],
                },
                wantsAssignedToMe: {
                  type: "boolean",
                },
              },
              required: [
                "intent",
                "searchText",
                "caseCode",
                "evidenceId",
                "evidenceHash",
                "status",
                "role",
                "wantsAssignedToMe",
              ],
            },
          },
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("OPENAI NLP ERROR:", data);
      return localIntentFallback(question);
    }

    const outputText = extractOutputText(data);

    if (!outputText) {
      return localIntentFallback(question);
    }

    const parsed = JSON.parse(outputText) as TrustedAssistantNlpResult;

    return normalizeNlpResult(parsed, question);
  } catch (error) {
    console.error("TRUSTED ASSISTANT NLP ERROR:", error);
    return localIntentFallback(question);
  }
}

function extractOutputText(data: any) {
  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  const output = data.output;

  if (!Array.isArray(output)) return "";

  for (const item of output) {
    const content = item.content;

    if (!Array.isArray(content)) continue;

    for (const part of content) {
      if (typeof part.text === "string") {
        return part.text;
      }
    }
  }

  return "";
}

function normalizeNlpResult(
  result: Partial<TrustedAssistantNlpResult>,
  question: string
): TrustedAssistantNlpResult {
  const local = localIntentFallback(question);

  const intent = isValidIntent(result.intent) ? result.intent : local.intent;

  return {
    intent,
    searchText: cleanNullableString(result.searchText) ?? local.searchText,
    caseCode: cleanNullableString(result.caseCode) ?? local.caseCode,
    evidenceId:
      typeof result.evidenceId === "number" && Number.isFinite(result.evidenceId)
        ? result.evidenceId
        : local.evidenceId,
    evidenceHash:
      cleanNullableString(result.evidenceHash) ?? local.evidenceHash,
    status: normalizeStatus(result.status) ?? local.status,
    role: cleanNullableString(result.role) ?? local.role,
    wantsAssignedToMe:
      typeof result.wantsAssignedToMe === "boolean"
        ? result.wantsAssignedToMe
        : local.wantsAssignedToMe,
  };
}

function localIntentFallback(question: string): TrustedAssistantNlpResult {
  const text = question.toLowerCase();
  const caseCode = question.match(/\bC-\d+\b/i)?.[0] || null;
  const evidenceHash = question.match(/\b[a-f0-9]{32,64}\b/i)?.[0] || null;
  const evidenceIdMatch = question.match(/\bevidence\s*#?\s*(\d+)\b/i);
  const evidenceId = evidenceIdMatch ? Number(evidenceIdMatch[1]) : null;

  const status = normalizeStatus(
    ["pending", "accepted", "analyzed", "final", "draft", "archived"].find(
      (item) => text.includes(item)
    ) || null
  );

  if (matchesAny(text, ["sha", "sha-256", "hash", "tamper", "integrity"])) {
    if (matchesAny(text, ["find", "search", "show", "where", "check"])) {
      return {
        ...fallbackResult,
        intent: "SEARCH_EVIDENCE",
        searchText: cleanSearchText(question),
        caseCode,
        evidenceId,
        evidenceHash,
        status,
      };
    }

    return {
      ...fallbackResult,
      intent: "EXPLAIN_HASH",
      searchText: cleanSearchText(question),
    };
  }

  if (matchesAny(text, ["blockchain", "transaction", "tx", "ganache"])) {
    return {
      ...fallbackResult,
      intent: text.includes("find") || text.includes("show")
        ? "SEARCH_EVIDENCE"
        : "EXPLAIN_BLOCKCHAIN",
      searchText: cleanSearchText(question),
      caseCode,
      evidenceHash,
    };
  }

  if (matchesAny(text, ["ipfs", "cid"])) {
    return {
      ...fallbackResult,
      intent: text.includes("find") || text.includes("show")
        ? "SEARCH_EVIDENCE"
        : "EXPLAIN_IPFS",
      searchText: cleanSearchText(question),
      caseCode,
    };
  }

  if (
    matchesAny(text, [
      "team",
      "assigned",
      "member",
      "members",
      "who works",
      "who is working",
      "who is assigned",
      "staff",
    ])
  ) {
    return {
      ...fallbackResult,
      intent: "SEARCH_TEAM",
      searchText: cleanSearchText(question),
      caseCode,
      wantsAssignedToMe: true,
    };
  }

  if (matchesAny(text, ["report", "lab", "analysis", "conclusion"])) {
    return {
      ...fallbackResult,
      intent: "SEARCH_LAB_REPORT",
      searchText: cleanSearchText(question),
      caseCode,
      status,
    };
  }

  if (matchesAny(text, ["verdict", "decision", "sentence", "court"])) {
    return {
      ...fallbackResult,
      intent: "SEARCH_VERDICT",
      searchText: cleanSearchText(question),
      caseCode,
      status,
    };
  }

  if (matchesAny(text, ["evidence", "file", "proof", "verify"])) {
    return {
      ...fallbackResult,
      intent: text.includes("how") || text.includes("what")
        ? "EXPLAIN_VERIFICATION"
        : "SEARCH_EVIDENCE",
      searchText: cleanSearchText(question),
      caseCode,
      evidenceId,
      evidenceHash,
      status,
    };
  }

  if (matchesAny(text, ["case", "cases", "investigation", "c-"])) {
    return {
      ...fallbackResult,
      intent: "SEARCH_CASE",
      searchText: cleanSearchText(question),
      caseCode,
      status,
    };
  }

  if (matchesAny(text, ["workflow", "process", "chain of custody", "custody"])) {
    return {
      ...fallbackResult,
      intent: "EXPLAIN_WORKFLOW",
      searchText: cleanSearchText(question),
    };
  }

  if (matchesAny(text, ["pending", "accepted", "analyzed", "status"])) {
    return {
      ...fallbackResult,
      intent: "EXPLAIN_STATUS",
      searchText: cleanSearchText(question),
      status,
    };
  }

  return {
    ...fallbackResult,
    searchText: cleanSearchText(question),
    caseCode,
    evidenceId,
    evidenceHash,
    status,
  };
}

function cleanSearchText(value: string) {
  const cleaned = value
    .replace(/\b(show|me|my|please|find|search|open|where|what|who|is|are|the|a|an|to|for|of|in|on|this|that|case|cases|evidence|team|assigned|report|verdict)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || null;
}

function cleanNullableString(value: unknown) {
  if (typeof value !== "string") return null;

  const cleaned = value.trim();

  return cleaned ? cleaned : null;
}

function normalizeStatus(value: unknown) {
  if (typeof value !== "string") return null;

  const text = value.toLowerCase().trim();

  if (text.includes("pending")) return "Pending";
  if (text.includes("accepted")) return "Accepted";
  if (text.includes("analyzed")) return "Analyzed";
  if (text.includes("final")) return "Final";
  if (text.includes("draft")) return "Draft";
  if (text.includes("archived")) return "Archived";
  if (text.includes("success")) return "Success";
  if (text.includes("failed")) return "Failed";

  return value.trim() || null;
}

function matchesAny(value: string, words: string[]) {
  return words.some((word) => value.includes(word.toLowerCase()));
}

function isValidIntent(value: unknown): value is TrustedAssistantIntent {
  return (
    value === "SEARCH_CASE" ||
    value === "SEARCH_EVIDENCE" ||
    value === "SEARCH_TEAM" ||
    value === "SEARCH_LAB_REPORT" ||
    value === "SEARCH_VERDICT" ||
    value === "EXPLAIN_HASH" ||
    value === "EXPLAIN_BLOCKCHAIN" ||
    value === "EXPLAIN_IPFS" ||
    value === "EXPLAIN_WORKFLOW" ||
    value === "EXPLAIN_VERIFICATION" ||
    value === "EXPLAIN_STATUS" ||
    value === "UNKNOWN"
  );
}