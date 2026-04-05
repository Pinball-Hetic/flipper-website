import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// On force le chargement du fichier .env pour écraser les variables d'environnement système (placeholders)
config({ override: true });

const rawUrl = process.env.DIRECT_URL || "";
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
