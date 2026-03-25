# 📍 Pocket Maps (Style Pokémon Go)

Application web mobile-first inspirée de l'expérience utilisateur de Pokémon Go, avec géolocalisation en temps réel et points d'intérêt interactifs.

---

## 🚀 Développement Local

### 📦 Installation
```bash
npm install
```

### 🖥️ Lancer le serveur de développement
```bash
npm run dev
```
L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

---

## 🧪 Tests & Qualité du Code

### 🧪 Lancer les tests unitaires (Jest)
```bash
npm test
```

### 🧪 Lancer les tests de fumée (Playwright)
Ces tests valident l'interface réelle dans un navigateur automatisé.
```bash
npm run test:smoke
```

### 📊 Vérifier la couverture de tests (Seuil: 70%)
```bash
npm run test:coverage
```

### 🔍 Vérifier les erreurs de style (Linter)
```bash
npm run lint
```

### 🛠️ Corriger automatiquement les erreurs de style
```bash
npm run lint:fix
```

---

## 🐳 Docker & Production

### 🏗️ Construire et lancer avec Docker Compose
```bash
docker compose up -d --build
```

### 🛑 Arrêter les conteneurs
```bash
docker compose down
```

---

## ⛓️ CI/CD (GitHub Actions)

Le projet utilise une pipeline **CI/CD automatisée** qui s'exécute à chaque push sur les branches `Production` ou `Dev`.

### 🧪 Pipeline CI (Lint, Build, Test)
1. Vérification du linter (`npm run lint`).
2. Validation du build Next.js (`npm run build`).
3. Exécution des tests unitaires (`npm test`) avec vérification du seuil de couverture.

### 🚀 Pipeline CD (Déploiement)
*   **Déclencheur** : Push sur la branche `Production`.
*   **Action** : Build de l'image Docker, envoi sur GitHub Container Registry (`ghcr.io`), connexion SSH au VPS et mise à jour automatique des conteneurs.

### 🔐 Configuration des Secrets GitHub
Pour activer le déploiement, configurez les secrets suivants dans **Settings > Secrets and variables > Actions** :
*   `SERVER_HOST` : IP du VPS.
*   `SERVER_PORT` : Port SSH (défaut: 22).
*   `SERVER_USER` : Utilisateur SSH (ex: `deploy`).
*   `SERVER_SSH_KEY` : Clé privée SSH.
*   `GITHUB_TOKEN` : (Géré automatiquement par GitHub).

---

## 📂 Structure du Projet
*   `src/app/` : Routes et pages Next.js (App Router).
*   `src/components/` : Composants UI et intégration de la carte (Leaflet).
*   `src/hooks/` : Logique réutilisable (ex: géolocalisation en temps réel).
*   `src/app/page.test.js` : Exemple de test unitaire.
*   `.github/workflows/` : Configuration de la pipeline CI/CD.

---

## 📝 Mémoire du Projet
Consultez le fichier `GEMINI.md` pour l'historique des décisions techniques et l'état d'avancement détaillé.
