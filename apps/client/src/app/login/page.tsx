"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User as UserIcon, ChevronRight } from "lucide-react";

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const { data: session, isPending } = authClient.useSession();

  const [isSignIn, setIsSignIn] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");

  React.useEffect(() => {
    if (!isPending && session?.user) {
      router.replace(redirectTo);
    }
  }, [session, isPending, router, redirectTo]);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignIn) {
        await authClient.signIn.email({ email, password, callbackURL: redirectTo }, {
          onSuccess: () => router.replace(redirectTo),
          onError: (ctx) => {
            toast.error(ctx.error.message || "Erreur lors de la connexion");
          },
        });
      } else {
        await authClient.signUp.email({ email, password, name, callbackURL: redirectTo }, {
          onSuccess: () => router.replace(redirectTo),
          onError: (ctx) => {
            toast.error(ctx.error.message || "Erreur lors de l'inscription");
          },
        });
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({ provider: "google", callbackURL: redirectTo });
    } catch {
      toast.error("Erreur de connexion avec Google");
      setIsGoogleLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-emerald-400" size={36} />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-slate-950 p-4">

      {/* Ambient neon glows */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #dc2626 0%, transparent 70%)" }}
      />

      {/* Dot grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <div
              className="flex size-10 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-xl"
              style={{ boxShadow: "0 0 16px rgba(34,197,94,0.25)" }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                {/* Pinball */}
                <circle cx="12" cy="15" r="3" fill="currentColor" stroke="none" />
                <path d="M5 21 L12 3 L19 21" />
                <path d="M7.5 15 L5 21" />
                <path d="M16.5 15 L19 21" />
              </svg>
            </div>
          </div>
          <h1
            className="text-3xl font-black uppercase tracking-[0.15em] text-white"
            style={{ textShadow: "0 0 24px rgba(34,197,94,0.5)" }}
          >
            Flipper Go
          </h1>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400/80">
            {isSignIn ? "— Connexion —" : "— Inscription —"}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-6 backdrop-blur-xl"
          style={{ boxShadow: "0 0 0 1px rgba(34,197,94,0.08), 0 32px 64px -16px rgba(0,0,0,0.6)" }}
        >

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 text-[13px] font-bold uppercase tracking-widest text-white/90 transition-all duration-200 hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c3.11 0 5.72-1.03 7.63-2.79l-3.57-2.77c-.99.66-2.26 1.06-4.06 1.06-3.13 0-5.78-2.12-6.73-4.97H1.54v2.87C3.43 20.31 7.42 23 12 23z" fill="#34A853" />
                <path d="M5.27 13.53c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.1H1.54C.56 8.06 0 10.24 0 12.5s.56 4.44 1.54 6.4l3.73-2.87z" fill="#FBBC05" />
                <path d="M12 4.79c1.69 0 3.21.58 4.41 1.72l3.31-3.31C17.72 1.41 15.11 0 12 0 7.42 0 3.43 2.69 1.54 6.1l3.73 2.87c.95-2.85 3.6-4.97 6.73-4.97z" fill="#EA4335" />
              </svg>
            )}
            Continuer avec Google
          </button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">ou</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="flex flex-col gap-3">
            {!isSignIn && (
              <div className="relative">
                <UserIcon
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                />
                <Input
                  className="h-11 border-white/[0.08] bg-white/[0.04] pl-10 text-sm text-white placeholder:text-white/25 focus:border-emerald-500/50 focus:bg-white/[0.07] focus:ring-1 focus:ring-emerald-500/30"
                  placeholder="Votre nom"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
              />
              <Input
                type="email"
                className="h-11 border-white/[0.08] bg-white/[0.04] pl-10 text-sm text-white placeholder:text-white/25 focus:border-emerald-500/50 focus:bg-white/[0.07] focus:ring-1 focus:ring-emerald-500/30"
                placeholder="email@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="relative">
              <Lock
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
              />
              <Input
                type="password"
                className="h-11 border-white/[0.08] bg-white/[0.04] pl-10 text-sm text-white placeholder:text-white/25 focus:border-emerald-500/50 focus:bg-white/[0.07] focus:ring-1 focus:ring-emerald-500/30"
                placeholder="••••••••"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                autoComplete={isSignIn ? "current-password" : "new-password"}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 text-[13px] font-black uppercase tracking-widest text-emerald-400 transition-all duration-200 hover:border-emerald-500/70 hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ boxShadow: isLoading ? "none" : "0 0 20px rgba(34,197,94,0.15)" }}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  {isSignIn ? "Connexion" : "Créer un compte"}
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <button
            type="button"
            onClick={() => setIsSignIn(!isSignIn)}
            className="mt-4 w-full cursor-pointer text-center text-[11px] font-bold uppercase tracking-widest text-white/25 transition-colors duration-200 hover:text-emerald-400/70"
          >
            {isSignIn ? "Pas de compte ? S'inscrire" : "Déjà inscrit ? Connexion"}
          </button>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/15">
          Flipper Go · Score Tracker
        </p>
      </div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-slate-950">
          <Loader2 className="animate-spin text-emerald-400" size={36} />
        </div>
      }
    >
      <LoginPage />
    </React.Suspense>
  );
}
