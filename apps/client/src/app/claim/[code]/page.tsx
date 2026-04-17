"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { fetchJson } from "@/lib/fetch-json";

interface PendingScorePreview {
  score: number;
  borneId: string;
  timestamp: string;
  status: string;
  expiresAt: string;
}

interface ClaimResult {
  scoreId: string;
  value: number;
  machineId: string;
  claimedAt: string;
}

export default function ClaimPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();

  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [preview, setPreview] = useState<PendingScorePreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:8882";

  useEffect(() => {
    if (!code) return;
    fetchJson<PendingScorePreview>(`${serverUrl}/api/pending-scores/${code}`)
      .then(setPreview)
      .catch((err: Error) => setPreviewError(err.message));
  }, [code, serverUrl]);

  const handleLogin = () => {
    router.push(`/login?redirect=/claim/${code}`);
  };

  const handleClaim = async () => {
    if (!session?.user) return;
    setClaiming(true);
    setClaimError(null);
    try {
      const result = await fetchJson<ClaimResult>(`${serverUrl}/api/pending-scores/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimCode: code }),
        credentials: "include",
      });
      setClaimResult(result);
    } catch (err) {
      setClaimError((err as Error).message);
    } finally {
      setClaiming(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-sm opacity-60">Chargement…</p>
      </div>
    );
  }

  if (claimResult) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-slate-950 text-white p-6">
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/60 px-8 py-8 text-center shadow-xl max-w-sm w-full">
          <p className="text-4xl font-bold text-emerald-400 mb-2">
            {claimResult.value.toLocaleString("fr-FR")}
          </p>
          <p className="text-sm text-white/60 mb-6">Score attribué à votre compte !</p>
          <a
            href="/"
            className="text-sm text-emerald-400 underline"
          >
            Retour à la carte
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-slate-950 text-white p-6">
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-8 py-8 shadow-xl max-w-sm w-full flex flex-col gap-5">
        <h1 className="text-xl font-semibold text-center">Réclamer un score</h1>

        {previewError ? (
          <div className="rounded-xl bg-red-950/60 border border-red-500/40 px-4 py-3 text-sm text-red-300 text-center">
            {previewError === "HTTP 404" || previewError.includes("404")
              ? "Code invalide. Vérifie le QR code."
              : previewError.includes("409")
                ? "Ce score a déjà été réclamé."
                : previewError}
          </div>
        ) : preview ? (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl bg-slate-800/60 px-4 py-3 flex flex-col gap-1">
              <p className="text-3xl font-bold text-white text-center">
                {preview.score.toLocaleString("fr-FR")}
              </p>
              <p className="text-xs text-white/40 text-center">points</p>
            </div>
            <div className="text-xs text-white/50 space-y-1">
              <p>Borne : <span className="text-white/80">{preview.borneId}</span></p>
              <p>
                Date :{" "}
                <span className="text-white/80">
                  {new Date(preview.timestamp).toLocaleString("fr-FR")}
                </span>
              </p>
              <p>
                Expire :{" "}
                <span className="text-white/80">
                  {new Date(preview.expiresAt).toLocaleString("fr-FR")}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="h-20 animate-pulse rounded-xl bg-slate-800/40" />
        )}

        {claimError && (
          <div className="rounded-xl bg-red-950/60 border border-red-500/40 px-4 py-2 text-sm text-red-300 text-center">
            {claimError}
          </div>
        )}

        {!session?.user ? (
          <button
            onClick={handleLogin}
            disabled={!!previewError}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-40"
          >
            Se connecter pour réclamer
          </button>
        ) : (
          <button
            onClick={handleClaim}
            disabled={claiming || !!previewError}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-40"
          >
            {claiming ? "Attribution…" : "Attribuer ce score à mon compte"}
          </button>
        )}
      </div>
    </div>
  );
}
