import path from "path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// On force le chargement du fichier .env pour écraser les variables d'environnement système (placeholders)
config({ override: true, path: path.resolve(__dirname, "../../.env") });

const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://localhost:5432/build";
const formattedUrl = rawUrl.startsWith("postgresql://")
  ? rawUrl.replace("postgresql://", "postgres://")
  : rawUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: formattedUrl,
  },
});
