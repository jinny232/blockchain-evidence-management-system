"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import type {
  TrustedAssistantCard,
  TrustedAssistantResponse,
} from "@/models/trusted-assistant.model";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  cards?: TrustedAssistantCard[];
  suggestions?: string[];
};

const starterSuggestions = [
  "Find case C-001",
  "Find evidence hash",
  "Who is assigned to this case?",
  "Explain SHA-256 hash",
];

export default function TrustedAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi, I am Trusted Assistant. I can help you find cases, evidence, teams, reports, verdicts, and explain the system workflow.",
      suggestions: starterSuggestions,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, open]);

  async function sendQuestion(questionText?: string) {
    const question = (questionText || input).trim();

    if (!question || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: question,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/trusted-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
      });

      const text = await res.text();

      let data: {
        message?: string;
        answer?: string;
        cards?: TrustedAssistantCard[];
        suggestions?: string[];
      } = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {
          message:
            "Trusted Assistant API is not returning JSON. Please check app/api/trusted-assistant/route.ts and your terminal error.",
        };
      }

      if (!res.ok) {
        setMessages((current) => [
          ...current,
          {
            id: `assistant-error-${Date.now()}`,
            role: "assistant",
            text:
              data.message ||
              `Trusted Assistant failed. Server returned status ${res.status}.`,
          },
        ]);

        return;
      }

      const result = data as TrustedAssistantResponse;

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: result.answer || "Trusted Assistant found a response.",
          cards: result.cards || [],
          suggestions: result.suggestions || [],
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          text: "Could not connect to Trusted Assistant. Please check if npm run dev is still running and if /api/trusted-assistant exists.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 rounded-full bg-slate-950 px-5 py-4 text-sm font-bold text-white shadow-2xl shadow-slate-400 transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          💬 Trusted Assistant
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-4 z-[60] flex h-[620px] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:right-8">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-950 p-5 text-white">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-300">
                Trusted Assistant
              </p>

              <h2 className="mt-1 text-lg font-bold">System Search & Help</h2>

              <p className="mt-1 text-xs text-slate-300">
                Find records and open pages quickly.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold hover:bg-white/20"
            >
              ✕
            </button>
          </div>

          <div
            ref={scrollRef}
            className="dark-scrollbar flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl p-4 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {message.text}
                  </p>

                  {message.cards && message.cards.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {message.cards.map((card, index) => (
                        <AssistantCard
                          key={`${card.type}-${card.title}-${index}`}
                          card={card}
                        />
                      ))}
                    </div>
                  )}

                  {message.role === "assistant" &&
                    message.suggestions &&
                    message.suggestions.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {message.suggestions.slice(0, 4).map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => sendQuestion(suggestion)}
                            disabled={loading}
                            className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                  Trusted Assistant is searching...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    sendQuestion();
                  }
                }}
                placeholder="Ask about cases, evidence, teams..."
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

              <button
                type="button"
                onClick={() => sendQuestion()}
                disabled={!input.trim() || loading}
                className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AssistantCard({ card }: { card: TrustedAssistantCard }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-950">{card.title}</p>

          {card.subtitle && (
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {card.subtitle}
            </p>
          )}
        </div>

        {card.status && (
          <StatusBadge status={card.status} variant="default" />
        )}
      </div>

      {card.description && (
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {card.description}
        </p>
      )}

      {card.metadata && card.metadata.length > 0 && (
        <div className="mt-3 space-y-2">
          {card.metadata.map((item) => (
            <div
              key={`${item.label}-${item.value}`}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
            >
              <span className="font-semibold text-slate-500">
                {item.label}:{" "}
              </span>

              <span className="break-all font-bold text-slate-800">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {card.actions.map((action) => {
          const isApiLink = action.href.startsWith("/api/");

          return (
            <Link
              key={`${action.label}-${action.href}`}
              href={action.href}
              target={isApiLink ? "_blank" : undefined}
              rel={isApiLink ? "noreferrer" : undefined}
              className={`rounded-xl px-3 py-2 text-xs font-bold ${actionClass(
                action.variant
              )}`}
            >
              {buttonIcon(action.label)} {action.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function actionClass(variant?: string) {
  if (variant === "success") {
    return "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100";
  }

  if (variant === "warning") {
    return "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100";
  }

  if (variant === "secondary") {
    return "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
  }

  return "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100";
}

function buttonIcon(label: string) {
  const value = label.toLowerCase();

  if (value.includes("case")) return "📁";
  if (value.includes("evidence")) return "🧾";
  if (value.includes("verify")) return "🔍";
  if (value.includes("pdf") || value.includes("download")) return "📄";
  if (value.includes("team")) return "👥";
  if (value.includes("verdict")) return "⚖️";

  return "➡️";
}