import LoginForm from "@/components/auth/LoginForm";
import LoginParticleBackground from "@/components/ui/LoginParticleBackground";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 text-white">
      <LoginParticleBackground />

      <section className="relative z-10 w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl shadow-blue-950/50 backdrop-blur-2xl">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-teal-300">
            Forensic Evidence System
          </p>

          <h1 className="text-3xl font-bold">Secure Login</h1>

          <p className="mt-3 text-sm text-slate-300">
            Sign in to access your role-based workspace.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}