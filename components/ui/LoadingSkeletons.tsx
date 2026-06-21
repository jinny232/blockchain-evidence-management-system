type SkeletonTone = "blue" | "emerald" | "purple" | "amber" | "rose";

interface SkeletonProps {
  className?: string;
}

interface StatCardsSkeletonProps {
  count?: number;
}

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

interface DashboardSkeletonProps {
  tone?: SkeletonTone;
  statCount?: number;
  tableColumns?: number;
}

const toneClasses: Record<SkeletonTone, string> = {
  blue: "from-blue-200/70 via-white/70 to-blue-100/70",
  emerald: "from-emerald-200/70 via-white/70 to-emerald-100/70",
  purple: "from-purple-200/70 via-white/70 to-purple-100/70",
  amber: "from-amber-200/70 via-white/70 to-amber-100/70",
  rose: "from-rose-200/70 via-white/70 to-rose-100/70",
};

export function SkeletonBox({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`}
    />
  );
}

export function PageHeaderSkeleton({
  tone = "blue",
}: {
  tone?: SkeletonTone;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br p-7 shadow-xl ${toneClasses[tone]}`}
    >
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/40 blur-2xl" />
      <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-white/40 blur-3xl" />

      <div className="relative animate-pulse space-y-4">
        <div className="h-4 w-40 rounded-full bg-white/70" />
        <div className="h-10 w-72 max-w-full rounded-2xl bg-white/80" />
        <div className="h-4 w-full max-w-xl rounded-full bg-white/70" />
        <div className="h-4 w-3/4 max-w-lg rounded-full bg-white/60" />
      </div>
    </section>
  );
}

export function StatCardsSkeleton({ count = 4 }: StatCardsSkeletonProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="glass-card rounded-2xl p-5">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-24 rounded-full bg-slate-200" />
            <div className="h-9 w-16 rounded-2xl bg-slate-200" />
          </div>
        </div>
      ))}
    </section>
  );
}

export function FilterSkeleton() {
  return (
    <section className="glass-card rounded-2xl p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <SkeletonBox className="h-12" />
        <SkeletonBox className="h-12" />
        <SkeletonBox className="h-12" />
      </div>
    </section>
  );
}

export function TableSkeleton({
  columns = 5,
  rows = 6,
}: TableSkeletonProps) {
  return (
    <section className="glass-card overflow-hidden rounded-2xl">
      <div className="border-b border-slate-200 p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-48 rounded-full bg-slate-200" />
          <div className="h-4 w-72 max-w-full rounded-full bg-slate-200" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="p-4">
                  <SkeletonBox className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-t border-slate-200">
                {Array.from({ length: columns }).map((_, columnIndex) => (
                  <td key={columnIndex} className="p-4">
                    <SkeletonBox
                      className={
                        columnIndex === 0
                          ? "h-5 w-20"
                          : columnIndex === columns - 1
                          ? "h-8 w-24"
                          : "h-4 w-28"
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DashboardSkeleton({
  tone = "blue",
  statCount = 4,
  tableColumns = 5,
}: DashboardSkeletonProps) {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton tone={tone} />
      <StatCardsSkeleton count={statCount} />

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TableSkeleton columns={tableColumns} rows={5} />
        </div>

        <div className="space-y-6">
          <SidePanelSkeleton />
          <SidePanelSkeleton />
        </div>
      </section>
    </div>
  );
}

export function DetailsPageSkeleton({
  tone = "blue",
}: {
  tone?: SkeletonTone;
}) {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton tone={tone} />

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCardSkeleton />
        <InfoCardSkeleton />
        <InfoCardSkeleton />
      </section>

      <section className="glass-card rounded-3xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 rounded-full bg-slate-200" />
          <div className="h-4 w-full rounded-full bg-slate-200" />
          <div className="h-4 w-5/6 rounded-full bg-slate-200" />
          <div className="h-4 w-2/3 rounded-full bg-slate-200" />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <ProofCardSkeleton />
        <ProofCardSkeleton />
        <ProofCardSkeleton />
        <ProofCardSkeleton dark />
      </section>
    </div>
  );
}

function InfoCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-28 rounded-full bg-slate-200" />
        <div className="h-6 w-40 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

function ProofCardSkeleton({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={`rounded-3xl p-6 ${
        dark ? "bg-slate-950" : "glass-card"
      }`}
    >
      <div className="animate-pulse space-y-4">
        <div
          className={`h-4 w-40 rounded-full ${
            dark ? "bg-slate-700" : "bg-slate-200"
          }`}
        />
        <div
          className={`h-4 w-full rounded-full ${
            dark ? "bg-slate-700" : "bg-slate-200"
          }`}
        />
        <div
          className={`h-4 w-4/5 rounded-full ${
            dark ? "bg-slate-700" : "bg-slate-200"
          }`}
        />
      </div>
    </div>
  );
}

function SidePanelSkeleton() {
  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-36 rounded-full bg-slate-200" />
        <div className="h-16 rounded-2xl bg-slate-200" />
        <div className="h-16 rounded-2xl bg-slate-200" />
        <div className="h-16 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}