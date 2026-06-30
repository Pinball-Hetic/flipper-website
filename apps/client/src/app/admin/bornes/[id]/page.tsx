"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Save, AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import AdminMapContainer from "@/components/Map/AdminMapContainer";
import AdminTokenPanel from "@/components/admin/AdminTokenPanel";
import BorneScores from "@/components/admin/BorneScores";
import OwnerAssign from "@/components/admin/OwnerAssign";
import { getBorne, updateBorne, type AdminBorne } from "@/lib/admin-api";

const fieldClass =
  "h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 transition-colors focus:border-orange-400 focus:outline-none";
const labelClass = "text-xs font-medium text-white/60";

export default function BorneDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "admin";

  const [borne, setBorne] = useState<AdminBorne | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [pos, setPos] = useState<[number, number]>([48.8566, 2.3522]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getBorne(id)
      .then((b) => {
        if (cancelled) return;
        setBorne(b);
        setName(b.name);
        setDescription(b.description ?? "");
        setAddress(b.address ?? "");
        setPos([b.lat, b.lng]);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (/40[13]/.test(err.message)) {
          router.replace("/");
          return;
        }
        setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !borne) return;
    setSaving(true);
    try {
      const updated = await updateBorne(borne.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        address: address.trim() || undefined,
        lat: pos[0],
        lng: pos[1],
      });
      setBorne(updated);
      toast.success("Borne mise à jour");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-2xl border border-red-500/30 bg-red-950/40 px-5 py-10 text-center"
      >
        <AlertTriangle className="size-7 text-red-400" aria-hidden />
        <p className="text-sm text-red-300/80">{error}</p>
        <Link href="/admin" className="text-sm font-semibold text-orange-400">
          Retour à la liste
        </Link>
      </div>
    );
  }

  if (!borne) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-white/50">
        <Loader2 className="size-6 animate-spin motion-reduce:animate-none" aria-hidden />
        <p className="text-sm">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-white/40 underline-offset-4 hover:text-white/70 hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Toutes les bornes
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{borne.name}</h1>
        <p className="mt-1 font-mono text-sm text-emerald-400">{borne.cabinetId ?? "—"}</p>
      </div>

      {/* Édition */}
      <form
        onSubmit={handleSave}
        className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5"
      >
        <h2 className="text-sm font-bold tracking-tight">Informations</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className={labelClass}>
                Nom
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className={labelClass}>
                Description
              </label>
              <input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="address" className={labelClass}>
                Adresse
              </label>
              <input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <AdminMapContainer
              center={pos}
              value={pos}
              onPick={(lat, lng) => setPos([lat, lng])}
            />
            <p className="text-xs text-white/40">
              Clique pour repositionner — {pos[0].toFixed(5)}, {pos[1].toFixed(5)}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          Enregistrer
        </button>
      </form>

      {isAdmin && <OwnerAssign borneId={borne.id} currentOwnerId={borne.ownerUserId} />}

      <AdminTokenPanel borneId={borne.id} />

      {/* Scores */}
      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <h2 className="mb-3 text-sm font-bold tracking-tight">Scores</h2>
        <BorneScores checkpointId={borne.id} />
      </section>
    </div>
  );
}
