import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-950 text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl border border-orange-500/30 bg-orange-500/15">
              <ShieldCheck className="size-5 text-orange-400" aria-hidden />
            </div>
            <span className="text-sm font-bold tracking-tight">Console admin</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/40 underline-offset-4 transition-colors hover:text-white/70 hover:underline"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Retour à la carte
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
