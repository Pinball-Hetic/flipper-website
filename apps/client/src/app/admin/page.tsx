import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function AdminDashboard() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/15">
            <ShieldCheck className="size-6 text-orange-400" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Dashboard admin</h1>
            <p className="text-sm text-white/50">Gestion des bornes — à venir</p>
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-white/60">
          Espace réservé aux administrateurs. Les fonctionnalités de gestion des
          bornes arriveront dans les prochaines phases.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-xs text-white/40 underline-offset-4 transition-colors hover:text-white/70 hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Retour à la carte
        </Link>
      </div>
    </main>
  );
}
