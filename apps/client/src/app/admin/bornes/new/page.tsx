"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import AdminMapContainer from "@/components/Map/AdminMapContainer";
import { createBorne, type AdminBorne } from "@/lib/admin-api";

const DEFAULT_CENTER: [number, number] = [48.8566, 2.3522];
const TYPES = ["OTHER", "RESTAURANT", "CULTURE", "STATION"];

const fieldClass =
  "h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 transition-colors focus:border-orange-400 focus:outline-none";
const labelClass = "text-xs font-medium text-white/60";

export default function NewBornePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [type, setType] = useState("OTHER");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ borne: AdminBorne; cabinetId: string } | null>(
    null,
  );

  const canSubmit = name.trim().length > 0 && pos !== null && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !pos) return;
    setSubmitting(true);
    try {
      const result = await createBorne({
        name: name.trim(),
        type,
        description: description.trim() || undefined,
        address: address.trim() || undefined,
        lat: pos[0],
        lng: pos[1],
      });
      setCreated({ borne: result.checkpoint, cabinetId: result.cabinetId });
      toast.success("Borne créée");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur";
      if (/40[13]/.test(message)) {
        router.replace("/");
        return;
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/40">
          <CheckCircle2 className="size-7 text-emerald-400" aria-hidden />
        </div>
        <div>
          <h1 className="text-lg font-bold">Borne créée</h1>
          <p className="mt-1 text-sm text-white/50">{created.borne.name}</p>
        </div>
        <div className="w-full rounded-2xl bg-slate-800/50 px-4 py-3">
          <p className="text-[11px] uppercase tracking-widest text-white/40">cabinetId</p>
          <p className="mt-1 font-mono text-sm text-emerald-400">{created.cabinetId}</p>
        </div>
        <Link
          href={`/admin/bornes/${created.borne.id}`}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-orange-400"
        >
          Configurer & générer le token
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Créer une borne</h1>
        <p className="mt-1 text-sm text-white/50">
          Clique sur la carte pour poser le marqueur.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className={labelClass}>
              Nom <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Le Café des Sports"
              className={fieldClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="type" className={labelClass}>
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={`${fieldClass} appearance-none`}
            >
              {TYPES.map((t) => (
                <option key={t} value={t} className="bg-slate-900">
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bar avec 3 flippers"
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
              placeholder="14 rue …, 75011 Paris"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <AdminMapContainer
            center={pos ?? DEFAULT_CENTER}
            value={pos}
            onPick={(lat, lng) => setPos([lat, lng])}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lat" className={labelClass}>
                Latitude
              </label>
              <input
                id="lat"
                type="number"
                step="any"
                value={pos ? pos[0] : ""}
                onChange={(e) =>
                  setPos([Number(e.target.value), pos ? pos[1] : DEFAULT_CENTER[1]])
                }
                className={fieldClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lng" className={labelClass}>
                Longitude
              </label>
              <input
                id="lng"
                type="number"
                step="any"
                value={pos ? pos[1] : ""}
                onChange={(e) =>
                  setPos([pos ? pos[0] : DEFAULT_CENTER[0], Number(e.target.value)])
                }
                className={fieldClass}
              />
            </div>
          </div>
          {!pos && (
            <p className="inline-flex items-center gap-1.5 text-xs text-white/40">
              <MapPin className="size-3.5" aria-hidden />
              Aucune position — clique sur la carte.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
        >
          {submitting && (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          )}
          Créer la borne
        </button>
        <Link
          href="/admin"
          className="text-sm text-white/40 underline-offset-4 hover:text-white/70 hover:underline"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
