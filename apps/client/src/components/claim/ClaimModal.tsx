"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, QrCode } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { CodeInput } from "./CodeInput";

const QrScannerView = dynamic(() => import("./QrScannerView"), { ssr: false });

const CODE_RE = /\/claim\/([A-Z0-9]{6})/i;
const VALID_CODE = /^[A-Z0-9]{6}$/;

function extractCode(raw: string): string | null {
  const match = raw.match(CODE_RE);
  const code = match ? match[1].toUpperCase() : raw.trim().toUpperCase();
  return VALID_CODE.test(code) ? code : null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const serverUrl =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:8882")
    : "http://localhost:8882";

async function validateCode(code: string): Promise<string | null> {
  try {
    const res = await fetch(`${serverUrl}/api/pending-scores/${code}`);
    if (res.status === 404) return "Code invalide ou expiré.";
    if (res.status === 409) return "Ce score a déjà été réclamé.";
    if (!res.ok) return "Erreur serveur, réessaie.";
    return null;
  } catch {
    return "Impossible de contacter le serveur.";
  }
}

export function ClaimModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showInput, setShowInput] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowInput(false);
      setCode("");
      setError(null);
    }
  }, [isOpen]);

  const redirect = useCallback(
    (finalCode: string) => {
      onClose();
      router.push(`/claim/${finalCode}`);
    },
    [router, onClose],
  );

  const handleScan = useCallback(
    async (raw: string) => {
      const finalCode = extractCode(raw);
      if (!finalCode) {
        setError("QR code non reconnu");
        setShowInput(true);
        return;
      }
      setValidating(true);
      const err = await validateCode(finalCode);
      setValidating(false);
      if (err) {
        toast.error(err);
        setShowInput(true);
        return;
      }
      redirect(finalCode);
    },
    [redirect],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCode = extractCode(code);
    if (!finalCode) {
      setError("Code invalide (6 caractères alphanumériques)");
      return;
    }
    setValidating(true);
    const err = await validateCode(finalCode);
    setValidating(false);
    if (err) {
      toast.error(err);
      return;
    }
    redirect(finalCode);
  };

  if (!isOpen) return null;

  const scannerActive = isMobile && !showInput;

  return (
    <div className="fixed inset-0 z-5000 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-t-3xl border border-white/10 bg-slate-900/95 shadow-2xl sm:rounded-3xl">
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-white/20 sm:hidden" />

        <div className="flex items-center justify-between px-5 pb-3 pt-4">
          <h2 className="text-base font-semibold text-white">Réclamer un score</h2>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl bg-white/10 text-white/60 transition-all hover:bg-white/20"
          >
            <X size={16} />
          </button>
        </div>

        {scannerActive ? (
          <div className="flex flex-col">
            <p className="px-5 pb-2 text-xs text-white/50">
              Pointez votre caméra vers le QR code
            </p>

            <QrScannerView onScan={handleScan} onError={() => setShowInput(true)} />

            {error && (
              <p className="px-5 py-1 text-center text-xs text-red-400">{error}</p>
            )}

            <div className="flex justify-center pb-6 pt-4">
              <button
                onClick={() => { setShowInput(true); setError(null); }}
                className="text-xs text-white/50 underline underline-offset-2 transition-colors hover:text-white/80"
              >
                Vous avez un code ?
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 pb-6">
            <p className="text-xs text-white/50">Entrez le code affiché sur la borne</p>

            <CodeInput
              value={code}
              onChange={(v) => { setCode(v); setError(null); }}
              autoFocus
            />

            {error && (
              <p className="text-center text-xs text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={code.length !== 6 || validating}
              className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {validating ? "Vérification…" : "Valider"}
            </button>

            {isMobile && (
              <button
                type="button"
                onClick={() => { setShowInput(false); setError(null); setCode(""); }}
                className="flex items-center justify-center gap-1.5 text-xs text-white/50 transition-colors hover:text-white/80"
              >
                <QrCode size={13} />
                Scanner un QR code
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
