"use client";

import { useEffect, useState } from "react";
import { Loader2, Trophy } from "lucide-react";
import { getBorneScores, type MachineScores } from "@/lib/admin-api";

export default function BorneScores({ checkpointId }: { checkpointId: string }) {
  const [machines, setMachines] = useState<MachineScores[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getBorneScores(checkpointId)
      .then((m) => !cancelled && setMachines(m))
      .catch((err: Error) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [checkpointId]);

  if (error) {
    return <p className="text-sm text-red-300/80">{error}</p>;
  }

  if (!machines) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-white/40">
        <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
        Chargement des scores…
      </div>
    );
  }

  const withScores = machines.filter((m) => m.scores.length > 0);

  if (withScores.length === 0) {
    return (
      <p className="py-4 text-sm text-white/40">
        Aucun score réclamé par un compte pour l&apos;instant.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {withScores.map((m) => (
        <div key={m.id}>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
            {m.name}
          </p>
          <ul className="flex flex-col gap-1.5">
            {m.scores.map((s, i) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-xl bg-slate-800/50 px-4 py-2.5 text-sm"
              >
                <span className="flex items-center gap-2.5">
                  <span className="w-5 text-right font-mono text-xs text-white/30">
                    {i + 1}
                  </span>
                  <span className="text-white/80">
                    {s.user?.pseudo ?? s.user?.name ?? "Anonyme"}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-emerald-300">
                  <Trophy className="size-3.5 text-emerald-400/70" aria-hidden />
                  {s.value.toLocaleString("fr-FR")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
