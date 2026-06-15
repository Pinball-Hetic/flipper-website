"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Loader2, MapPin, Cpu, AlertTriangle, Users } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { listBornes, type AdminBorne } from "@/lib/admin-api";

type State =
  | { kind: "loading" }
  | { kind: "ready"; bornes: AdminBorne[] }
  | { kind: "error"; message: string };

export default function AdminBornesList() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "admin";
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    listBornes()
      .then((bornes) => {
        if (!cancelled) setState({ kind: "ready", bornes });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (/40[13]/.test(err.message)) {
          router.replace("/");
          return;
        }
        setState({ kind: "error", message: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bornes</h1>
          <p className="mt-1 text-sm text-white/50">
            Gère le registre des bornes et leurs tokens.
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Link
              href="/admin/users"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-semibold text-white/80 transition-colors hover:bg-white/5"
            >
              <Users className="size-4" aria-hidden />
              Utilisateurs
            </Link>
            <Link
              href="/admin/bornes/new"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-orange-400"
            >
              <Plus className="size-4" aria-hidden />
              Créer une borne
            </Link>
          </div>
        )}
      </div>

      {state.kind === "loading" && (
        <div className="flex flex-col items-center gap-3 py-16 text-white/50">
          <Loader2 className="size-6 animate-spin motion-reduce:animate-none" aria-hidden />
          <p className="text-sm">Chargement des bornes…</p>
        </div>
      )}

      {state.kind === "error" && (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-2xl border border-red-500/30 bg-red-950/40 px-5 py-10 text-center"
        >
          <AlertTriangle className="size-7 text-red-400" aria-hidden />
          <p className="text-sm text-red-300/80">{state.message}</p>
        </div>
      )}

      {state.kind === "ready" && state.bornes.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/50 px-5 py-16 text-center">
          <Cpu className="size-8 text-white/30" aria-hidden />
          <p className="text-sm text-white/50">
            {isAdmin ? "Aucune borne pour l'instant." : "Aucune borne assignée."}
          </p>
          {isAdmin && (
            <Link
              href="/admin/bornes/new"
              className="mt-1 text-sm font-semibold text-orange-400 hover:text-orange-300"
            >
              Créer la première
            </Link>
          )}
        </div>
      )}

      {state.kind === "ready" && state.bornes.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {state.bornes.map((b) => (
            <li key={b.id}>
              <Link
                href={`/admin/bornes/${b.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/60 px-5 py-4 transition-colors hover:border-white/20 hover:bg-slate-900"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold">{b.name}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                      {b.type}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-white/40">
                    <span className="font-mono text-emerald-400/80">
                      {b.cabinetId ?? "—"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" aria-hidden />
                      {b.lat.toFixed(4)}, {b.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-white/30">Détails →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
