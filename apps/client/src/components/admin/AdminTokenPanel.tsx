"use client";

import { useState } from "react";
import { KeyRound, Loader2, Copy, Check, TriangleAlert, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { issueBorneToken, revokeBorneToken } from "@/lib/admin-api";

export default function AdminTokenPanel({ borneId }: { borneId: string }) {
  const [busy, setBusy] = useState<"issue" | "revoke" | null>(null);
  // Le token en clair n'est gardé en mémoire que le temps de l'afficher.
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleIssue = async () => {
    setBusy("issue");
    try {
      const { token } = await issueBorneToken(borneId);
      setToken(token);
      setCopied(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusy(null);
    }
  };

  const handleRevoke = async () => {
    setBusy("revoke");
    try {
      await revokeBorneToken(borneId);
      setToken(null);
      toast.success("Token révoqué");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusy(null);
    }
  };

  const copy = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      toast.success("Token copié");
    } catch {
      toast.error("Copie impossible");
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
      <div className="flex items-center gap-2">
        <KeyRound className="size-4 text-orange-400" aria-hidden />
        <h2 className="text-sm font-bold tracking-tight">Token d&apos;authentification</h2>
      </div>
      <p className="mt-1 text-xs text-white/50">
        Le token authentifie la borne sur l&apos;API <code>/v1</code>. Régénérer invalide
        l&apos;ancien.
      </p>

      {token ? (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4">
          <p className="inline-flex items-start gap-2 text-xs font-medium text-amber-300">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            Copie-le maintenant — il ne sera plus jamais affiché.
          </p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded-lg bg-slate-950/60 px-3 py-2 font-mono text-xs text-emerald-300">
              {token}
            </code>
            <button
              type="button"
              onClick={copy}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-semibold text-white transition-colors hover:bg-white/20"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-400" aria-hidden />
              ) : (
                <Copy className="size-3.5" aria-hidden />
              )}
              {copied ? "Copié" : "Copier"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setToken(null)}
            className="self-start text-xs text-white/40 underline-offset-4 hover:text-white/70 hover:underline"
          >
            J&apos;ai copié le token, masquer
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleIssue}
            disabled={busy !== null}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
          >
            {busy === "issue" ? (
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
            ) : (
              <KeyRound className="size-4" aria-hidden />
            )}
            Générer / régénérer le token
          </button>
          <button
            type="button"
            onClick={handleRevoke}
            disabled={busy !== null}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-500/30 px-4 text-sm font-semibold text-red-300 transition-colors hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy === "revoke" ? (
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
            ) : (
              <ShieldOff className="size-4" aria-hidden />
            )}
            Révoquer
          </button>
        </div>
      )}
    </section>
  );
}
