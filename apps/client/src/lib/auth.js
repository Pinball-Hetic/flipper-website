import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    secret: process.env.BETTER_AUTH_SECRET || "a-very-strong-secret-at-least-32-chars-long",
    // baseURL doit correspondre à l'URL via laquelle l'utilisateur accède au site (la Gateway)
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8881/api/auth",
    trustedOrigins: ["http://localhost:8881", "http://localhost:8888"],
    emailAndPassword: {
        enabled: true
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
    },
    user: {
        additionalFields: {
            pseudo: {
                type: "string",
                required: false,
                input: false,
            },
            pseudoUpdatedAt: {
                type: "date",
                required: false,
                input: false,
            },
        },
    },
});
