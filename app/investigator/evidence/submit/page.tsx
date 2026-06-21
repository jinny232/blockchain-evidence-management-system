import { Suspense } from "react";
import SubmitEvidenceClient from "@/components/investigator/evidence/SubmitEvidenceClient";

export default function SubmitEvidencePage() {
  return (
    <Suspense
      fallback={
        <div className="glass-card rounded-2xl p-6 text-center text-slate-500">
          Loading submit evidence form...
        </div>
      }
    >
      <SubmitEvidenceClient />
    </Suspense>
  );
}