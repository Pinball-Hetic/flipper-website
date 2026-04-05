# 🛡️ Architecture 3-Tiers (Haute Sécurité)

Pour garantir un maximum de sécurité, l'infrastructure de Pocket Maps évolue vers une architecture à trois niveaux (3-Tiers). Cela permet de séparer les responsabilités et de protéger l'accès à la base de données.

## 🏗 Les 3 Niveaux

### 1. Front (Client)
C'est l'interface utilisateur. Elle ne communique **jamais** directement avec la base de données.
- **Rôle** : Rendu de l'UI (Carte, menus), gestion de l'état local, interaction utilisateur.
- **Technologie** : Next.js (React Server Components / Client Components).
- **Sécurité** : Ne contient aucune clé secrète critique (uniquement des clés publiques). Ne fait des requêtes qu'au Middleware/Gateway.

### 2. Middleware (API Gateway)
C'est la porte d'entrée et le bouclier de l'application.
- **Rôle** : 
  - **Authentification & Autorisation** : Vérifie que l'utilisateur a le droit d'accéder à la ressource (validation des tokens JWT via Supabase Auth).
  - **Rate Limiting** : Empêche les attaques DDoS en limitant le nombre de requêtes par IP/utilisateur.
  - **Sanitization** : Nettoie les données entrantes pour éviter les injections (SQLi, XSS).
- **Technologie** : Next.js Edge Middleware (`middleware.js` à la racine) ou un service dédié (Traefik, Nginx, Kong).

### 3. Back (Serveur / API Core)
C'est le seul composant autorisé à parler à la base de données. Il est isolé dans un réseau privé (ou protégé par des règles strictes).
- **Rôle** : Logique métier complexe, calculs géographiques (PostGIS), lecture/écriture en base de données.
- **Technologie** : Next.js API Routes (Serverless Functions) ou un microservice séparé (Node.js/Express, NestJS).
- **Sécurité** : 
  - Utilise le client Prisma pour interagir avec Supabase.
  - Héberge les variables d'environnement critiques (`DATABASE_URL`, `DIRECT_URL`, clés API secrètes).
  - N'accepte que les requêtes validées provenant du Middleware.

## 🔒 Flux d'une Requête Sécurisée

1. Le **Client** (téléphone du joueur) envoie une requête : *"J'ai visité le point A"*.
2. La requête frappe le **Middleware (Gateway)**. Le middleware vérifie le token d'authentification du joueur, s'assure qu'il n'a pas spammé l'API (Rate Limit) et valide le format de la requête.
3. Si tout est valide, le Middleware transmet la requête au **Back (Serveur)**.
4. Le **Back** effectue une vérification métier (ex: "Le joueur est-il vraiment à moins de 50m du point A ?") en utilisant Prisma.
5. Le **Back** met à jour la base de données Supabase.
6. La réponse redescend jusqu'au **Client**.

---
*Dernière mise à jour : 4 Avril 2026*
