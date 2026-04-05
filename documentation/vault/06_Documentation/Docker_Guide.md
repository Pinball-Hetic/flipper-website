# Guide Docker et déploiement

Configuration à deux fichiers Compose : **production** (`docker-compose.yml`) et **développement** (`docker-compose.dev.yml` + `Dockerfile.dev`).

## Automatisation (Taskfile)

Nous utilisons [Task](https://taskfile.dev/) pour simplifier les commandes Docker :

- **Démarrer Dev** : `task docker:dev:up` (Build + Up + Detach)
- **Logs Dev** : `task docker:dev:logs`
- **Arrêter Dev** : `task docker:dev:down`
- **Démarrer Prod** : `task docker:prod:up`
- **Nettoyage Docker** : `task docker:clean`

## Production

Build multi-étapes (`Dockerfile` : deps → builder → runner **standalone**), exécution avec `node server.js`.

```bash
docker compose up --build
```

- **Port** : `http://localhost:3000`
- **Redémarrage** : `unless-stopped` (voir `docker-compose.yml`)

## Développement

Next.js en mode `next dev`, code monté depuis le dépôt, volumes pour `node_modules` et `.next` (binaires Linux dans le conteneur).

```bash
docker compose -f docker-compose.dev.yml up --build
```

- **Port** : `http://localhost:3000` (ne pas lancer prod et dev en même temps sur le même port sans en changer un)
- Au démarrage : `npm ci`, `prisma generate`, puis `next dev -H 0.0.0.0`
- **Polling** : `WATCHPACK_POLLING=true` pour le file watching sous Docker Desktop

## Build de production (Dockerfile)

1. **Deps** : `npm install`
2. **Builder** : `prisma generate`, `next build`
3. **Runner** : image légère, sortie **standalone** Next.js

## Commandes utiles

### Build de l’image prod sans Compose

```bash
docker build -t flipper-website .
docker run -p 3000:3000 --env-file .env flipper-website
```

Adapter `--env-file` / variables selon ton déploiement (base de données, Better Auth, etc.).

## Notes techniques

- **jsconfig.json** : utile pour l’alias `@/` dans l’IDE ; le build Docker compile le projet tel quel.
- **Autoprefixer** : en `devDependencies` pour la compilation CSS dans le conteneur de build.

---
*Dernière mise à jour : 5 avril 2026*
