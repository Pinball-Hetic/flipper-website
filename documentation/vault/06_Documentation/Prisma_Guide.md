# 🗄️ Guide d'Utilisation de Prisma

Ce document explique comment gérer la base de données PostgreSQL (via Supabase) en utilisant l'ORM Prisma v7.5.0.

## 🔗 Configuration des Connexions

Dans le fichier `.env`, nous utilisons deux URLs distinctes comme recommandé par Supabase :

1.  **`DATABASE_URL` (Port 6543)** : Utilise le **Transaction Pooler (PgBouncer)**. Indispensable pour l'application Next.js afin d'éviter de saturer les connexions.
2.  **`DIRECT_URL` (Port 5432)** : Connexion directe à la base. Utilisée uniquement pour les **migrations** et les commandes d'introspection.

## 🚀 Commandes Essentielles

### 1. Appliquer des modifications de schéma
Lorsque vous modifiez le fichier `prisma/schema.prisma` :
```bash
npx prisma migrate dev --name <nom_de_la_migration>
```
*   **Action** : Crée un fichier de migration SQL, l'applique à la DB et régénère le Client Prisma.
*   **Quand l'utiliser** : Dès que vous ajoutez un champ, une table ou une relation.

### 2. Régénérer le Client Prisma
Si vous avez modifié le schéma mais que les types TypeScript/JavaScript ne sont pas à jour :
```bash
npx prisma generate
```
*   **Action** : Met à jour `@prisma/client` dans `node_modules` avec vos nouveaux modèles.

### 3. Visualiser les données (Studio)
Pour ouvrir une interface graphique (GUI) et voir vos données :
```bash
npx prisma studio
```
*   **Action** : Ouvre un tableau de bord sur `http://localhost:5555`.

### 4. Réinitialiser la base de données
**⚠️ Attention : Supprime toutes les données !**
```bash
npx prisma migrate reset
```

## 🛠 Meilleures Pratiques

- **Singleton Client** : N'importez jamais `new PrismaClient()` directement dans vos pages. Utilisez toujours `@/lib/prisma`.

## 🛡️ Driver Adapter (Prisma 7+)

À partir de Prisma 7, pour les connexions directes sans passer par Prisma Accelerate, il est nécessaire d'utiliser un **Driver Adapter**.

Dans notre projet, nous utilisons :
- **`pg`** : Le driver PostgreSQL standard pour Node.js.
- **`@prisma/adapter-pg`** : L'adaptateur qui permet à Prisma d'utiliser le driver `pg`.

### Pourquoi ?
Prisma 7 a migré son moteur interne. L'utilisation d'un adaptateur permet une meilleure compatibilité avec les environnements serverless et edge, et offre un contrôle plus fin sur le pool de connexions via les options de `pg.Pool`.

### Exemple de configuration (`src/lib/prisma.js`) :
```javascript
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
```

---
*Dernière mise à jour : 4 Avril 2026*
