"use client";

export default function AdminInfrastructureClient() {
  return (
    <div className="space-y-6 text-slate-950">
      <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-slate-950 via-blue-900 to-blue-600 p-7 text-white shadow-xl shadow-blue-200/70">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-200">
            Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            ⚙️ Infrastructure
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50">
            View the main system components used by the Blockchain Based Evidence
            Management System.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          title="Database"
          value="MySQL"
          status="Configured"
          description="Stores users, cases, evidence, lab reports, legal notes, verdicts, and audit logs."
        />

        <StatusCard
          title="Authentication"
          value="JWT"
          status="Active"
          description="Protects role-based dashboards for Admin, Investigator, Lab Technician, Lawyer, and Judge."
        />

        <StatusCard
          title="Blockchain"
          value="Ganache"
          status="Local Network"
          description="Stores blockchain transaction proof for evidence integrity."
        />

        <StatusCard
          title="Evidence Storage"
          value="IPFS / Pinata"
          status="CID Ready"
          description="Stores IPFS CID references for uploaded evidence files."
        />
      </section>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-xl font-bold text-slate-950">
          System Workflow Status
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <WorkflowCard
            step="1"
            title="Evidence Hashing"
            text="Uploaded evidence is processed with SHA-256 hashing."
          />

          <WorkflowCard
            step="2"
            title="IPFS CID"
            text="Evidence file reference is stored as an IPFS CID."
          />

          <WorkflowCard
            step="3"
            title="Blockchain Proof"
            text="Evidence hash is recorded as blockchain transaction proof."
          />
        </div>
      </section>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-xl font-bold text-slate-950">
          Important Environment Values
        </h2>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Variable</th>
                <th className="p-4">Purpose</th>
              </tr>
            </thead>

            <tbody>
              <EnvRow name="DB_NAME" purpose="MySQL database name" />
              <EnvRow name="JWT_SECRET" purpose="JWT session security key" />
              <EnvRow name="PINATA_JWT" purpose="IPFS / Pinata upload key" />
              <EnvRow name="GANACHE_RPC_URL" purpose="Ganache blockchain RPC URL" />
              <EnvRow name="GANACHE_PRIVATE_KEY" purpose="Ganache deployer account private key" />
              <EnvRow name="EVIDENCE_CONTRACT_ADDRESS" purpose="Deployed smart contract address" />
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatusCard({
  title,
  value,
  status,
  description,
}: {
  title: string;
  value: string;
  status: string;
  description: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">{value}</h2>
        </div>

        <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          {status}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function WorkflowCard({
  step,
  title,
  text,
}: {
  step: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
        {step}
      </div>

      <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function EnvRow({ name, purpose }: { name: string; purpose: string }) {
  return (
    <tr className="border-t border-slate-200">
      <td className="p-4 font-mono text-xs font-bold text-slate-800">
        {name}
      </td>
      <td className="p-4 text-slate-600">{purpose}</td>
    </tr>
  );
}