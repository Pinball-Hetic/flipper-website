"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, AtSign } from "lucide-react";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8882";

type AvailabilityState = "idle" | "checking" | "available" | "unavailable";

interface PseudoFormProps {
  onSuccess?: (pseudo: string) => void;
  submitLabel?: string;
  variant?: "dark" | "light";
  autoFocus?: boolean;
}

export function PseudoForm({
  onSuccess,
  submitLabel = "Choisir ce pseudo",
  variant = "dark",
  autoFocus = true,
}: PseudoFormProps) {
  const [pseudo, setPseudo] = React.useState("");
  const [availability, setAvailability] =
    React.useState<AvailabilityState>("idle");
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkAvailability = React.useCallback(async (value: string) => {
    if (!value) {
      setAvailability("idle");
      setFieldError(null);
      return;
    }
    setAvailability("checking");
    setFieldError(null);
    try {
      const res = await fetch(
        `${SERVER_URL}/api/users/pseudo/check?value=${encodeURIComponent(value)}`,
        { credentials: "include" },
      );
      if (res.status === 400) {
        const data = (await res.json()) as { error: string };
        setFieldError(data.error);
        setAvailability("idle");
        return;
      }
      if (!res.ok) {
        setAvailability("idle");
        return;
      }
      const data = (await res.json()) as { available: boolean };
      setAvailability(data.available ? "available" : "unavailable");
    } catch {
      setAvailability("idle");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPseudo(value);
    setFieldError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkAvailability(value), 400);
  };

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pseudo || availability !== "available") return;

    setIsSubmitting(true);
    setFieldError(null);

    try {
      const res = await fetch(`${SERVER_URL}/api/users/pseudo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pseudo }),
      });

      const data = (await res.json()) as { error?: string; pseudo?: string };

      if (!res.ok) {
        setFieldError(data.error ?? "Erreur lors de la mise à jour");
        if (res.status === 409) setAvailability("unavailable");
        return;
      }

      onSuccess?.(pseudo);
    } catch {
      setFieldError("Erreur réseau, veuillez réessayer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDark = variant === "dark";

  const statusIcon = () => {
    if (availability === "checking")
      return <Loader2 className={`animate-spin ${isDark ? "text-slate-400" : "text-slate-500"}`} size={18} />;
    if (availability === "available")
      return <CheckCircle2 className="text-emerald-500" size={18} />;
    if (availability === "unavailable")
      return <XCircle className="text-red-500" size={18} />;
    return null;
  };

  const borderColor = () => {
    if (fieldError || availability === "unavailable")
      return "border-red-400/60 focus:border-red-400";
    if (availability === "available")
      return "border-emerald-400/60 focus:border-emerald-400";
    return isDark
      ? "border-white/30 focus:border-orange-400/60"
      : "border-slate-200 focus:border-orange-400/80";
  };

  const canSubmit =
    availability === "available" && !isSubmitting && !fieldError;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="space-y-2">
        <Label className={`ml-1 text-[11px] font-black uppercase tracking-widest ${isDark ? "text-slate-300" : "text-slate-500"}`}>
          Pseudo <span className="text-red-400">*</span>
        </Label>
        <div className="relative">
          <AtSign
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <Input
            value={pseudo}
            onChange={handleChange}
            placeholder="ball_wizard_42"
            autoComplete="off"
            autoFocus={autoFocus}
            className={`h-14 pl-12 pr-12 rounded-2xl transition-all shadow-xs ${
              isDark
                ? "bg-white/10 text-white placeholder:text-slate-500"
                : "bg-white/60 text-slate-900 placeholder:text-slate-400"
            } ${borderColor()}`}
            aria-invalid={!!fieldError || availability === "unavailable"}
            aria-describedby={
              fieldError
                ? "pseudo-error"
                : availability === "unavailable"
                  ? "pseudo-taken"
                  : availability === "available"
                    ? "pseudo-ok"
                    : undefined
            }
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {statusIcon()}
          </div>
        </div>

        {fieldError && (
          <p
            id="pseudo-error"
            role="alert"
            className="ml-1 text-xs font-semibold text-red-400"
          >
            {fieldError}
          </p>
        )}
        {!fieldError && availability === "unavailable" && (
          <p
            id="pseudo-taken"
            role="alert"
            className="ml-1 text-xs font-semibold text-red-400"
          >
            Ce pseudo est déjà pris
          </p>
        )}
        {!fieldError && availability === "available" && (
          <p
            id="pseudo-ok"
            className="ml-1 text-xs font-semibold text-emerald-400"
          >
            Disponible !
          </p>
        )}
        {availability === "idle" && !fieldError && (
          <p className={`ml-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            3 à 20 caractères — lettres, chiffres, underscore
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full h-14 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm uppercase tracking-widest gap-2 shadow-xl shadow-orange-500/25 transition-all"
      >
        {isSubmitting ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
