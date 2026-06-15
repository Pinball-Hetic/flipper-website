import { createAuthClient } from "better-auth/react";

// En utilisant une URL relative, le client d'auth utilisera le même port que celui
// affiché dans la barre d'adresse du navigateur (8881 ou 8888).
export const authClient = createAuthClient({
    baseURL: typeof window !== "undefined" 
        ? `${window.location.origin}/api/auth` 
        : (process.env.BETTER_AUTH_URL || "http://localhost:8881/api/auth")
});
