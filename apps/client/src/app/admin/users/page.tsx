"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { listUsers, setUserRole, type AdminUser } from "@/lib/admin-api";

const ROLES = ["user", "manager", "admin"];

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listUsers()
      .then((u) => !cancelled && setUsers(u))
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
  }, [router]);

  const handleRole = async (id: string, role: string) => {
    setSavingId(id);
    try {
      await setUserRole(id, role);
      setUsers((prev) =>
        prev ? prev.map((u) => (u.id === id ? { ...u, role } : u)) : prev,
      );
      toast.success("Rôle mis à jour");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-white/40 underline-offset-4 hover:text-white/70 hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Bornes
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Utilisateurs</h1>
        <p className="mt-1 text-sm text-white/50">
          Promeus un utilisateur en gérant pour lui assigner des bornes.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-2xl border border-red-500/30 bg-red-950/40 px-5 py-10 text-center"
        >
          <AlertTriangle className="size-7 text-red-400" aria-hidden />
          <p className="text-sm text-red-300/80">{error}</p>
        </div>
      )}

      {!users && !error && (
        <div className="flex flex-col items-center gap-3 py-16 text-white/50">
          <Loader2 className="size-6 animate-spin motion-reduce:animate-none" aria-hidden />
          <p className="text-sm">Chargement…</p>
        </div>
      )}

      {users && (
        <ul className="flex flex-col gap-2.5">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/60 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{u.pseudo ?? "—"}</p>
                <p className="truncate text-xs text-white/40">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {savingId === u.id && (
                  <Loader2
                    className="size-4 animate-spin text-white/40 motion-reduce:animate-none"
                    aria-hidden
                  />
                )}
                <select
                  value={u.role}
                  onChange={(e) => handleRole(u.id, e.target.value)}
                  disabled={savingId === u.id}
                  className="h-9 rounded-lg border border-white/15 bg-white/5 px-2 text-sm text-white focus:border-orange-400 focus:outline-none disabled:opacity-50"
                  aria-label={`Rôle de ${u.email}`}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="bg-slate-900">
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
