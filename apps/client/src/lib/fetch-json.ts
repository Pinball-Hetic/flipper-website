/**
 * fetch + parse JSON avec vérification du statut HTTP.
 * À utiliser dans les queryFn React Query pour éviter les faux succès (HTML d’erreur parsé en JSON, etc.).
 */
export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, init);
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    if (!res.ok) {
      throw new Error(
        text ? `HTTP ${res.status}: ${text.slice(0, 160)}` : `HTTP ${res.status}`,
      );
    }
    throw new Error("Réponse JSON invalide");
  }

  if (!res.ok) {
    const msg =
      data &&
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}
