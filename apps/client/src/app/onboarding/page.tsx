"use client";

import { Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { PseudoForm } from "@/components/pseudo/PseudoForm";
import { Loader2, Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";

function OnboardingPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";
  const { data: session, isPending } = authClient.useSession();

  const handleSuccess = () => {
    // Full-page navigation: reloads so authClient.useSession() refetches a
    // fresh session (pseudo now set). A soft router.push keeps the stale
    // cached session, so the claim page would re-show the onboarding CTA.
    window.location.assign(redirectTo);
  };

  if (isPending) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-xl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-[420px] bg-slate-800/80 border border-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-12 flex items-center justify-center rounded-2xl bg-orange-500/20 border border-orange-500/30">
              <Zap className="text-orange-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
                Bienvenue
                {session?.user?.name
                  ? `, ${session.user.name.split(" ")[0]}`
                  : ""}{" "}
                !
              </h1>
              <p className="text-sm font-medium text-slate-300">
                Choisis ton pseudo de joueur
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Ton pseudo apparaîtra sur le leaderboard. Il sera unique et visible
            par tous les joueurs.
          </p>

          <PseudoForm
            onSuccess={handleSuccess}
            submitLabel="Entrer dans l'arène"
          />
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
          <Loader2 className="animate-spin text-orange-500" size={40} />
        </div>
      }
    >
      <OnboardingPage />
    </Suspense>
  );
}
