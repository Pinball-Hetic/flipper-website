# API Borne — Intégration `/v1`

Documentation d'intégration pour les développeurs borne (cabinet).
Contrat **stable** `/v1`. Toute évolution sera versionnée (`/v2`).

---

## 1. Aperçu

Quand une partie se termine, la borne envoie le score à l'API. L'API renvoie un **code** et une **`claimUrl`** : la borne génère un **QR code** à partir de cette URL, le joueur le scanne avec son téléphone pour réclamer son score (saisir un pseudo).

```
Borne (fin de partie)
   └── POST /v1/scores ──► { code, claimUrl }
                              └── borne affiche QR(claimUrl)
                                     └── joueur scanne ──► page web (équipe globale)
```

La borne n'a besoin que de **deux** endpoints :
- `POST /v1/scores` — enregistrer une partie (obligatoire)
- `GET /v1/leaderboard` — afficher le classement mondial sur le backglass (optionnel, plus tard)

Les endpoints de claim (`GET`/`POST /v1/claim/{code}`) sont consommés par la page web téléphone, **pas par la borne**. Ils sont documentés en §6 pour information.

---

## 2. Base URL & environnements

| Env | Base URL |
|-----|----------|
| Dev local | `http://localhost:8881` (gateway) |
| Staging / Prod | _à communiquer_ |

Tous les chemins ci-dessous sont relatifs à la base URL. Le point d'entrée unique est le **gateway** (`:8881`), qui route `/v1/*` vers le serveur applicatif. N'appelez pas le serveur (`:8882`) en direct.

Toutes les requêtes et réponses sont en `application/json` (UTF-8).

---

## 3. Authentification

Toutes les écritures borne exigent un **token par borne** en **Bearer token** :

```
Authorization: Bearer <tokenBorne>
```

- Le token est **provisionné par un administrateur** (`POST /api/admin/bornes/:id/token`) et renvoyé **en clair une seule fois** à la création. Stockez-le de façon sécurisée sur la borne ; il n'est pas récupérable ensuite (seul son hash est conservé côté serveur). Pour en obtenir un nouveau, demandez une **rotation** (régénération) — l'ancien est invalidé.
- Le token commence par `brk_`. Ne jamais le commiter ni l'exposer côté client.
- Avec un token par borne, **le `cabinetId` est déduit du token côté serveur** : la borne n'a plus besoin de l'envoyer (s'il est présent dans le body, il est ignoré). Voir §4.
- Requis sur : `POST /v1/scores`.
- Non requis sur : `GET /v1/leaderboard`, `GET/POST /v1/claim/{code}` (publics).
- Token absent / invalide → `401 Unauthorized`.

> **`CABINET_KEY` (DÉPRÉCIÉE).** L'ancienne clé partagée `CABINET_KEY` reste acceptée pendant la transition : dans ce mode legacy, le `cabinetId` est **pris du body** (comme avant). Migrez vers un token par borne dès que possible — il permet la révocation individuelle et passe à l'échelle (>1000 bornes).

---

## 4. `POST /v1/scores` — enregistrer une partie

Enregistre une partie terminée et renvoie le code de claim + l'URL à encoder dans le QR.

**Headers**
```
Authorization: Bearer <tokenBorne>
Content-Type: application/json
```

**Body**

| Champ | Type | Requis | Contraintes |
|-------|------|:------:|-------------|
| `cabinetId` | string | ⚠️ | identifiant borne, libre (ex. `"borne-paris-01"`), non vide. **Ignoré** si authentifié par token par borne (déduit du token). **Requis** uniquement en mode legacy `CABINET_KEY`. |
| `mapId` | string | ✅ | identifiant du jeu/table, libre (ex. `"strangerthings"`), non vide |
| `score` | integer | ✅ | entier `1` … `99 999 999` |
| `maxCombo` | integer | ❌ | `≥ 0` |
| `maxMultiplier` | integer | ❌ | `≥ 0` |
| `counters` | object | ❌ | dictionnaire `string → integer` (ex. `{ "demogorgons": 7 }`) |
| `durationS` | integer | ❌ | durée partie en secondes, `≥ 0` |
| `playedAt` | string | ✅ | date ISO-8601 **avec offset** (ex. `"2026-06-13T10:22:00Z"` ou `"...+02:00"`) |
| `gameId` | string | ❌ | UUID. **Clé d'idempotence** (voir §7) — recommandé : générez-le une fois par partie et renvoyez le **même** sur retry. |

> `cabinetId` et `mapId` sont stockés tels quels (chaînes libres). Choisissez une convention de nommage stable côté borne et conservez-la (le `mapId` sert de clé pour le leaderboard).

**Exemple**
```bash
curl -X POST https://<base>/v1/scores \
  -H "Authorization: Bearer $BORNE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mapId": "strangerthings",
    "score": 1240500,
    "maxCombo": 12,
    "maxMultiplier": 4,
    "counters": { "demogorgons": 7, "portals": 3 },
    "durationS": 142,
    "playedAt": "2026-06-13T10:22:00Z"
  }'
```

**Réponse `201 Created`**
```json
{
  "scoreId": "clx9876fghij",
  "code": "482913",
  "claimUrl": "https://<base-claim>/claim/482913"
}
```

| Champ | Description |
|-------|-------------|
| `scoreId` | identifiant interne du score (à logguer si besoin de support) |
| `code` | **6 chiffres**, unique. C'est le code de claim. |
| `claimUrl` | URL complète à encoder dans le QR code |

> **Idempotence** : si vous avez fourni un `gameId` déjà enregistré, l'API renvoie le score **existant** (mêmes `scoreId`, `code`, `claimUrl`) avec le statut **`200 OK`** au lieu de `201 Created` — aucun doublon, aucun nouveau code. Le corps de la réponse est identique dans les deux cas. Voir §7.

**Génération du QR**

Encodez **`claimUrl` telle quelle** dans le QR (ne reconstruisez pas l'URL côté borne — le format peut changer). Affichez le `code` en clair sous le QR pour saisie manuelle en secours.

**Erreurs**

| Code | Cas |
|------|-----|
| `400` | body invalide (champ manquant, type/contrainte non respectée) |
| `401` | Bearer absent ou invalide |
| `500` | erreur serveur (voir §7 pour le retry) |

---

## 5. `GET /v1/leaderboard` — classement mondial (backglass)

Classement mondial pour un jeu donné. Public. Optionnel (prévu pour le backglass plus tard).

**Query params**

| Param | Requis | Défaut | Notes |
|-------|:------:|--------|-------|
| `mapId` | ✅ | — | identifiant du jeu |
| `scope` | ❌ | `world` | seule valeur supportée : `world` |
| `limit` | ❌ | `10` | `1` … `100` |

**Exemple**
```bash
curl "https://<base>/v1/leaderboard?mapId=strangerthings&scope=world&limit=10"
```

**Réponse `200 OK`** (avec header `ETag`)
```json
{
  "entries": [
    { "rank": 1, "pseudo": "ANTHONY", "score": 2400000, "claimed": true,  "playedAt": "2026-06-13T09:00:00.000Z" },
    { "rank": 2, "pseudo": null,      "score": 1900000, "claimed": false, "playedAt": "2026-06-13T08:30:00.000Z" }
  ]
}
```

- `pseudo` vaut `null` tant que le score n'est pas réclamé (`claimed: false`).
- Tri : `score` décroissant, puis partie la plus ancienne d'abord.

**Cache (ETag)**

La réponse renvoie un header `ETag`. Pour économiser la bande passante sur le backglass, renvoyez-le dans `If-None-Match` à la requête suivante :

```bash
curl "https://<base>/v1/leaderboard?mapId=strangerthings" \
  -H 'If-None-Match: "a1b2c3..."'
# → 304 Not Modified si rien n'a changé
```

| Code | Cas |
|------|-----|
| `200` | ok (corps + ETag) |
| `304` | non modifié (ETag correspond) |
| `400` | `mapId` manquant ou `limit`/`scope` invalide |

---

## 6. Endpoints de claim (page téléphone — pour info)

Consommés par la page web scannée, **pas par la borne**. Listés pour contexte.

### `GET /v1/claim/{code}` — état du score
`200`
```json
{ "score": 1240500, "mapId": "strangerthings", "playedAt": "2026-06-13T10:22:00.000Z", "claimed": false, "pseudo": null }
```
`404` code inconnu **ou** expiré · `409` déjà réclamé.

### `POST /v1/claim/{code}` — soumettre un pseudo
Body : `{ "pseudo": "Anthony" }`
- Pseudo : **3 à 20 caractères**, `[a-zA-Z0-9_]` uniquement, filtre anti-grossièreté. Renvoyé normalisé en MAJUSCULES.

`200` → `{ "ok": true, "pseudo": "ANTHONY" }`
`400` pseudo invalide · `404` code inconnu · `409` déjà réclamé · `410` expiré.

---

## 7. Règles & limitations importantes

**Durée de vie du code — 24 h.** Le code de claim expire 24 h après `playedAt`. Passé ce délai, le claim échoue (`410`) ; le score reste visible au classement en anonyme (`pseudo: null`).

**✅ Idempotence (`gameId`).** Le champ optionnel `gameId` (UUID) sert de **clé d'idempotence**. Réenvoyer la même partie avec le **même `gameId`** est sûr : l'API ne crée **pas de doublon** et renvoie le score déjà enregistré (mêmes `scoreId`, `code`, `claimUrl`).

- **Sans `gameId`** : comportement historique — chaque `POST` réussi crée un nouveau score (`201`). Ne rejouez pas la même partie en aveugle, vous créeriez un doublon.
- **Avec `gameId`** : générez-le une fois par partie côté borne et **réutilisez-le sur chaque retry** du même envoi. Le **retry réseau est alors sûr** : si le premier `201` s'est perdu, le retry renvoie le même score en `200`.
- Statuts : **`201 Created`** = nouveau score créé · **`200 OK`** = replay (le `gameId` existait déjà).
- Recommandé : un `gameId` par partie, timeout réseau généreux (≥ 10 s), retry borné (ex. 3 essais, backoff).

**Format des erreurs.** Toutes les erreurs renvoient :
```json
{ "error": "message lisible" }
```

**Récapitulatif des codes HTTP**

| Code | Signification |
|------|---------------|
| `200` | ok |
| `201` | score créé |
| `304` | leaderboard non modifié (ETag) |
| `400` | requête invalide |
| `401` | auth borne manquante/invalide |
| `404` | code de claim inconnu ou expiré |
| `409` | score déjà réclamé |
| `410` | code de claim expiré (au moment du claim) |
| `500` | erreur serveur |

---

## 8. Checklist d'intégration borne

- [ ] Token par borne (`brk_…`) provisionné par l'admin et stocké de façon sécurisée sur la borne
- [ ] `mapId` : convention de nommage figée (`cabinetId` déduit du token, plus besoin de l'envoyer)
- [ ] `POST /v1/scores` en fin de partie, **une seule fois**
- [ ] `playedAt` en ISO-8601 **avec offset**
- [ ] _(recommandé)_ `gameId` (UUID) généré une fois par partie pour l'idempotence, **réutilisé sur chaque retry**
- [ ] QR généré depuis `claimUrl` (brut), `code` affiché en secours
- [ ] Retry réseau borné, timeout généreux — sûr si `gameId` réutilisé (pas de doublon, `200` au replay)
- [ ] _(optionnel)_ backglass : `GET /v1/leaderboard` + cache `ETag`/`If-None-Match`

---

_Contact API / questions : équipe serveur flipper-website._
