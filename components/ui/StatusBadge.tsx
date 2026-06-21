type StatusBadgeVariant =
  | "evidence"
  | "blockchain"
  | "activity"
  | "conclusion"
  | "case"
  | "role"
  | "default";

type StatusBadgeSize = "sm" | "md";

interface StatusBadgeProps {
  status: string | null | undefined;
  variant?: StatusBadgeVariant;
  size?: StatusBadgeSize;
  className?: string;
}

const sizeClasses: Record<StatusBadgeSize, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm",
};

export default function StatusBadge({
  status,
  variant = "default",
  size = "sm",
  className = "",
}: StatusBadgeProps) {
  const label = status && status.trim() ? status.trim() : getFallback(variant);
  const style = getStatusClass(label, variant);

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border font-semibold ${sizeClasses[size]} ${style} ${className}`}
    >
      {label}
    </span>
  );
}

function getFallback(variant: StatusBadgeVariant) {
  if (variant === "blockchain") return "Not Recorded";
  if (variant === "conclusion") return "No Conclusion";
  return "Unknown";
}

function getStatusClass(status: string, variant: StatusBadgeVariant) {
  const value = status.toLowerCase();

  if (variant === "blockchain") {
    if (value === "recorded" || value === "confirmed" || value === "success") {
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
    }

    if (value === "failed" || value === "error") {
      return "border-red-300 bg-red-50 text-red-700";
    }

    if (value === "pending") {
      return "border-amber-300 bg-amber-50 text-amber-700";
    }

    return "border-slate-300 bg-slate-50 text-slate-600";
  }

  if (variant === "activity") {
    if (value === "success") {
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
    }

    if (value === "warning") {
      return "border-amber-300 bg-amber-50 text-amber-700";
    }

    if (value === "failed") {
      return "border-red-300 bg-red-50 text-red-700";
    }

    if (value === "critical") {
      return "border-purple-300 bg-purple-50 text-purple-700";
    }

    return "border-slate-300 bg-slate-50 text-slate-600";
  }

  if (variant === "conclusion") {
    if (
      value.includes("invalid") ||
      value.includes("tampered") ||
      value.includes("fake") ||
      value.includes("mismatch")
    ) {
      return "border-red-300 bg-red-50 text-red-700";
    }

    if (
      value.includes("valid") ||
      value.includes("match") ||
      value.includes("verified") ||
      value.includes("authentic")
    ) {
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
    }

    if (
      value.includes("inconclusive") ||
      value.includes("unclear") ||
      value.includes("pending")
    ) {
      return "border-amber-300 bg-amber-50 text-amber-700";
    }

    return "border-slate-300 bg-slate-50 text-slate-600";
  }

  if (value === "pending" || value === "waiting") {
    return "border-amber-300 bg-amber-50 text-amber-700";
  }

  if (value === "accepted" || value === "in review" || value === "reviewing") {
    return "border-blue-300 bg-blue-50 text-blue-700";
  }

  if (
    value === "analyzed" ||
    value === "approved" ||
    value === "completed" ||
    value === "closed" ||
    value === "active" ||
    value === "success"
  ) {
    return "border-emerald-300 bg-emerald-50 text-emerald-700";
  }

  if (
    value === "rejected" ||
    value === "failed" ||
    value === "inactive" ||
    value === "denied"
  ) {
    return "border-red-300 bg-red-50 text-red-700";
  }

  if (value === "critical") {
    return "border-purple-300 bg-purple-50 text-purple-700";
  }

  if (value === "warning") {
    return "border-amber-300 bg-amber-50 text-amber-700";
  }

  if (value === "admin") {
    return "border-blue-300 bg-blue-50 text-blue-700";
  }

  if (value === "investigator") {
    return "border-cyan-300 bg-cyan-50 text-cyan-700";
  }

  if (value === "lab technician") {
    return "border-emerald-300 bg-emerald-50 text-emerald-700";
  }

  if (value === "lawyer") {
    return "border-purple-300 bg-purple-50 text-purple-700";
  }

  if (value === "judge") {
    return "border-amber-300 bg-amber-50 text-amber-700";
  }

  return "border-slate-300 bg-slate-50 text-slate-600";
}