"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Trophy,
  Gamepad2,
  CalendarClock,
  AlertTriangle,
  PartyPopper,
  Loader2,
} from "lucide-react";

interface ClaimPreview {
  score: number;
  mapId: string;
  playedAt: string;
  claimed: boolean;
  pseudo: string | null;
}

type PreviewState =
  | { kind: "loading" }
  | { kind: "ready"; preview: ClaimPreview }
  | { kind: "error"; title: string; message: string };

const PSEUDO_RE = /^[a-zA-Z0-9_]{3,20}$/;

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:8882";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("fr-FR");
}

export default function ClaimPage() {
  const { code } = useParams<{ code: string }>();

  const [state, setState] = useState<PreviewState>({ kind: "loading" });
  const [pseudo, setPseudo] = useState("");
  const [touched, setTouched] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimedPseudo, setClaimedPseudo] = useState<string | null>(null);

  const pseudoValid = useMemo(() => PSEUDO_RE.test(pseudo), [pseudo]);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${serverUrl}/v1/claim/${code}`);
        if (cancelled) return;

        if (res.status === 404) {
          setState({
            kind: "error",
            title: "Code invalide",
            message: "Ce code n'existe pas ou a expiré. Vérifie le QR code de la borne.",
          });
          return;
        }
        if (res.status === 409) {
          setState({
            kind: "error",
            title: "Déjà réclamé",
            message: "Ce score a déjà été réclamé par un joueur.",
          });
          return;
        }
        if (!res.ok) {
          setState({
            kind: "error",
            title: "Erreur serveur",
            message: "Impossible de charger le score. Réessaie dans un instant.",
          });
          return;
        }

        const preview = (await res.json()) as ClaimPreview;
        if (!cancelled) setState({ kind: "ready", preview });
      } catch {
        if (!cancelled) {
          setState({
            kind: "error",
            title: "Hors ligne",
            message: "Impossible de contacter le serveur.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pseudoValid || claiming) return;
    setClaiming(true);
    setClaimError(null);

    try {
      const res = await fetch(`${serverUrl}/v1/claim/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pseudo }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; pseudo?: string; error?: string }
        | null;

      if (res.ok && data?.pseudo) {
        setClaimedPseudo(data.pseudo);
        return;
      }

      const messages: Record<number, string> = {
        400: "Pseudo invalide. 3 à 20 caractères, lettres, chiffres et underscore.",
        404: "Code invalide. Vérifie le QR code.",
        409: "Ce score a déjà été réclamé.",
        410: "Ce code a expiré.",
      };
      setClaimError(messages[res.status] ?? data?.error ?? "Erreur serveur, réessaie.");
    } catch {
      setClaimError("Impossible de contacter le serveur.");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/40">
        {/* Bandeau */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-gradient-to-r from-orange-500/15 to-transparent px-6 py-4">
          <Trophy className="size-5 text-orange-400" aria-hidden />
          <h1 className="text-base font-semibold tracking-tight">Réclamer un score</h1>
        </div>

        <div className="px-6 py-6">
          {claimedPseudo ? (
            <SuccessView pseudo={claimedPseudo} />
          ) : state.kind === "loading" ? (
            <LoadingView />
          ) : state.kind === "error" ? (
            <ErrorView title={state.title} message={state.message} />
          ) : (
            <ReadyView
              preview={state.preview}
              pseudo={pseudo}
              setPseudo={(v) => {
                setPseudo(v);
                setClaimError(null);
              }}
              pseudoValid={pseudoValid}
              touched={touched}
              onBlur={() => setTouched(true)}
              claiming={claiming}
              claimError={claimError}
              onSubmit={handleClaim}
            />
          )}
        </div>
      </div>

      <Link
        href="/"
        className="mt-6 text-xs text-white/40 underline-offset-4 transition-colors hover:text-white/70 hover:underline"
      >
        Retour à la carte
      </Link>
    </main>
  );
}

function LoadingView() {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-white/50">
      <Loader2 className="size-6 animate-spin motion-reduce:animate-none" aria-hidden />
      <p className="text-sm">Chargement du score…</p>
    </div>
  );
}

function ErrorView({ title, message }: { title: string; message: string }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-red-500/30 bg-red-950/40 px-5 py-7 text-center"
    >
      <AlertTriangle className="size-7 text-red-400" aria-hidden />
      <p className="text-base font-semibold text-red-200">{title}</p>
      <p className="text-sm text-red-300/80">{message}</p>
    </div>
  );
}

function SuccessView({ pseudo }: { pseudo: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/40">
        <PartyPopper className="size-8 text-emerald-400" aria-hidden />
      </div>
      <div>
        <p className="text-sm text-white/60">Score réclamé !</p>
        <p className="mt-1 text-lg font-semibold text-emerald-300">
          Inscrit en tant que <span className="font-bold text-emerald-200">{pseudo}</span>
        </p>
      </div>
      <Link
        href="/"
        className="mt-2 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-emerald-500"
      >
        Voir le classement
      </Link>
    </div>
  );
}

interface ReadyViewProps {
  preview: ClaimPreview;
  pseudo: string;
  setPseudo: (v: string) => void;
  pseudoValid: boolean;
  touched: boolean;
  onBlur: () => void;
  claiming: boolean;
  claimError: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

function ReadyView({
  preview,
  pseudo,
  setPseudo,
  pseudoValid,
  touched,
  onBlur,
  claiming,
  claimError,
  onSubmit,
}: ReadyViewProps) {
  const showInvalid = touched && pseudo.length > 0 && !pseudoValid;

  return (
    <div className="flex flex-col gap-5">
      {/* Score */}
      <div className="rounded-2xl bg-slate-800/50 px-5 py-5 text-center">
        <p className="text-4xl font-bold tabular-nums tracking-tight text-white">
          {preview.score.toLocaleString("fr-FR")}
        </p>
        <p className="mt-1 text-xs uppercase tracking-widest text-white/40">points</p>
      </div>

      {/* Méta */}
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 text-white/50">
          <Gamepad2 className="size-4 shrink-0" aria-hidden />
          <dt className="sr-only">Jeu</dt>
          <dd className="truncate text-white/80">{preview.mapId}</dd>
        </div>
        <div className="flex items-center gap-2 text-white/50">
          <CalendarClock className="size-4 shrink-0" aria-hidden />
          <dt className="sr-only">Joué le</dt>
          <dd className="text-white/80">{formatDate(preview.playedAt)}</dd>
        </div>
      </dl>

      {/* Saisie pseudo */}
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <label htmlFor="pseudo" className="text-xs font-medium text-white/60">
          Choisis ton pseudo
        </label>
        <input
          id="pseudo"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={20}
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          onBlur={onBlur}
          placeholder="ex. Lucas_42"
          aria-invalid={showInvalid}
          aria-describedby="pseudo-help"
          className={[
            "h-12 w-full rounded-xl border bg-white/5 px-4 text-base text-white placeholder:text-white/30",
            "transition-colors duration-200 focus:outline-none",
            showInvalid
              ? "border-red-500/60 focus:border-red-400"
              : "border-white/15 focus:border-orange-400",
          ].join(" ")}
        />
        <p
          id="pseudo-help"
          aria-live="polite"
          className={`text-xs ${showInvalid ? "text-red-400" : "text-white/40"}`}
        >
          {showInvalid
            ? "3 à 20 caractères : lettres, chiffres et underscore uniquement."
            : "3 à 20 caractères : lettres, chiffres et _."}
        </p>

        {claimError && (
          <p
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-950/40 px-3 py-2 text-center text-sm text-red-300"
          >
            {claimError}
          </p>
        )}

        <button
          type="submit"
          disabled={!pseudoValid || claiming}
          className={[
            "mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white",
            "bg-orange-500 transition-colors duration-200 hover:bg-orange-400",
            "disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40",
          ].join(" ")}
        >
          {claiming && (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          )}
          {claiming ? "Attribution…" : "Réclamer ce score"}
        </button>
      </form>
    </div>
  );
}
