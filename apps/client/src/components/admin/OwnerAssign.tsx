"use client";

import { useEffect, useState } from "react";
import { Loader2, UserCog } from "lucide-react";
import { toast } from "sonner";
import { assignBorneOwner, listUsers, type AdminUser } from "@/lib/admin-api";

export default function OwnerAssign({
  borneId,
  currentOwnerId,
}: {
  borneId: string;
  currentOwnerId?: string;
}) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selected, setSelected] = useState(currentOwnerId ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listUsers()
      .then((all) => setUsers(all.filter((u) => u.role === "manager")))
      .catch((err: Error) => toast.error(err.message));
  }, []);

  const handleAssign = async () => {
    setSaving(true);
    try {
      await assignBorneOwner(borneId, selected || null);
      toast.success("Propriétaire mis à jour");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
      <div className="flex items-center gap-2">
        <UserCog className="size-4 text-orange-400" aria-hidden />
        <h2 className="text-sm font-bold tracking-tight">Gérant assigné</h2>
      </div>
      <p className="mt-1 text-xs text-white/50">
        Un gérant ne gère que les bornes qui lui sont assignées.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="h-10 min-w-56 rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white focus:border-orange-400 focus:outline-none"
        >
          <option value="" className="bg-slate-900">
            — Aucun (super-admin) —
          </option>
          {users.map((u) => (
            <option key={u.id} value={u.id} className="bg-slate-900">
              {u.pseudo ?? u.email}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAssign}
          disabled={saving}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
        >
          {saving && (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          )}
          Assigner
        </button>
      </div>
    </section>
  );
}
