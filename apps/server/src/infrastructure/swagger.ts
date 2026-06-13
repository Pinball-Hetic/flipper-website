import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Flipper Go API",
      version: "1.0.0",
      description:
        "API centrale pour les bornes de flipper connectées. Reçoit les scores en fin de partie et expose le leaderboard.",
    },
    servers: [
      { url: "http://localhost:8882", description: "Développement local" },
      { url: "https://flipper-go.azhao.fr", description: "Production" },
    ],
    components: {
      securitySchemes: {
        BorneApiKey: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description:
            "Clé secrète partagée entre la borne et le serveur central. Définie dans BORNE_API_KEY côté serveur.",
        },
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "Token de session Better Auth",
        },
        CabinetBearer: {
          type: "http",
          scheme: "bearer",
          description:
            "Clé partagée des bornes pour le contrat /v1 — Authorization: Bearer <CABINET_KEY>. Fallback dev sur BORNE_API_KEY.",
        },
      },
      schemas: {
        Machine: {
          type: "object",
          properties: {
            id: { type: "string", example: "clx1234abcde" },
            name: { type: "string", example: "The Addams Family" },
            checkpointId: { type: "string", example: "clx0000zzzzz" },
            checkpointName: { type: "string", example: "Le Café des Sports" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ScoreInput: {
          type: "object",
          required: ["borneId", "pseudo", "score"],
          properties: {
            borneId: {
              type: "string",
              description: "cuid — identifiant de la Machine en base",
              example: "clx1234abcde",
            },
            pseudo: {
              type: "string",
              minLength: 2,
              maxLength: 20,
              pattern: "^[a-zA-Z0-9_]+$",
              example: "Lucas_42",
            },
            score: {
              type: "integer",
              minimum: 1,
              maximum: 99999999,
              example: 158400,
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description:
                "Optionnel — heure de fin de partie ISO 8601. Défaut: now()",
              example: "2026-04-16T14:32:00.000Z",
            },
          },
        },
        ScoreCreated: {
          type: "object",
          properties: {
            id: { type: "string", example: "clx9876fghij" },
            value: { type: "integer", example: 158400 },
            machineId: { type: "string", example: "clx1234abcde" },
            pseudo: { type: "string", example: "Lucas_42" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string", example: "Machine introuvable" },
          },
        },
        PendingScoreInput: {
          type: "object",
          required: ["gameId", "borneId", "score", "timestamp"],
          properties: {
            gameId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
            borneId: { type: "string", example: "clx1234abcde" },
            score: { type: "integer", minimum: 1, maximum: 99999999, example: 42000 },
            timestamp: { type: "string", format: "date-time", example: "2026-04-17T14:00:00.000Z" },
          },
        },
        PendingScoreCreated: {
          type: "object",
          properties: {
            id: { type: "string" },
            gameId: { type: "string", format: "uuid" },
            claimCode: { type: "string", example: "ABC123" },
            score: { type: "integer", example: 42000 },
            status: { type: "string", enum: ["UNCLAIMED"] },
            expiresAt: { type: "string", format: "date-time" },
          },
        },
        PendingScorePreview: {
          type: "object",
          properties: {
            score: { type: "integer", example: 42000 },
            borneId: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
            status: { type: "string", enum: ["UNCLAIMED"] },
            expiresAt: { type: "string", format: "date-time" },
          },
        },
        V1ScoreInput: {
          type: "object",
          required: ["cabinetId", "mapId", "score", "playedAt"],
          properties: {
            cabinetId: { type: "string", example: "borne-paris-01" },
            mapId: { type: "string", example: "strangerthings" },
            score: { type: "integer", minimum: 1, maximum: 99999999, example: 158400 },
            maxCombo: { type: "integer", minimum: 0, example: 12 },
            maxMultiplier: { type: "integer", minimum: 0, example: 5 },
            counters: {
              type: "object",
              additionalProperties: { type: "integer" },
              example: { ramps: 3, bumpers: 40 },
            },
            durationS: { type: "integer", minimum: 0, example: 120 },
            playedAt: { type: "string", format: "date-time", example: "2026-06-14T14:32:00.000Z" },
          },
        },
        V1ScoreCreated: {
          type: "object",
          properties: {
            scoreId: { type: "string", example: "clx9876fghij" },
            code: { type: "string", example: "428193" },
            claimUrl: { type: "string", example: "http://localhost:8888/?code=428193" },
          },
        },
        V1ClaimPreview: {
          type: "object",
          properties: {
            score: { type: "integer", example: 158400 },
            mapId: { type: "string", example: "strangerthings" },
            playedAt: { type: "string", format: "date-time" },
            claimed: { type: "boolean", example: false },
            pseudo: { type: "string", nullable: true, example: null },
          },
        },
        V1ClaimResult: {
          type: "object",
          properties: {
            ok: { type: "boolean", example: true },
            pseudo: { type: "string", example: "LUCAS_42" },
          },
        },
        V1LeaderboardEntry: {
          type: "object",
          properties: {
            rank: { type: "integer", example: 1 },
            pseudo: { type: "string", nullable: true, example: "LUCAS_42" },
            score: { type: "integer", example: 158400 },
            claimed: { type: "boolean", example: true },
            playedAt: { type: "string", format: "date-time" },
          },
        },
        V1Leaderboard: {
          type: "object",
          properties: {
            entries: {
              type: "array",
              items: { $ref: "#/components/schemas/V1LeaderboardEntry" },
            },
          },
        },
      },
    },
    paths: {
      "/api/machines": {
        get: {
          summary: "Lister toutes les bornes",
          description: "Retourne la liste de toutes les machines (bornes) avec leur checkpoint. Utilisé pour obtenir un borneId valide.",
          responses: {
            "200": {
              description: "Liste des bornes",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Machine" },
                  },
                },
              },
            },
            "500": {
              description: "Erreur serveur",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/api/scores": {
        post: {
          summary: "Enregistrer un score de fin de partie",
          description:
            "Appelé par la borne physique après un Game Over. Crée ou retrouve le joueur par pseudo, puis persiste le score.",
          security: [{ BorneApiKey: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ScoreInput" },
              },
            },
          },
          responses: {
            "201": {
              description: "Score enregistré",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ScoreCreated" },
                },
              },
            },
            "400": {
              description: "Validation échouée",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "401": {
              description: "API key invalide ou absente",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "404": {
              description: "borneId inconnu",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "409": {
              description: "Score déjà enregistré pour cette borne/pseudo dans la dernière minute",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "500": {
              description: "Erreur serveur",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/scores/leaderboard/{borneId}": {
        get: {
          summary: "Top 10 scores d'une borne",
          description:
            "Retourne les 10 meilleurs scores pour une borne donnée, triés par valeur décroissante.",
          parameters: [
            {
              name: "borneId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Identifiant de la borne (Machine)",
            },
          ],
          responses: {
            "200": {
              description: "Leaderboard de la borne",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/ScoreCreated" },
                  },
                },
              },
            },
            "404": {
              description: "Borne introuvable",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/pending-scores": {
        post: {
          summary: "Soumettre un score en attente de réclamation",
          description:
            "Appelé par la borne après une partie. Crée un score en tampon avec un code de réclamation.",
          security: [{ BorneApiKey: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PendingScoreInput" },
              },
            },
          },
          responses: {
            "201": {
              description: "Score en attente créé",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PendingScoreCreated" },
                },
              },
            },
            "400": {
              description: "Validation échouée",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "401": {
              description: "API key invalide",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "404": {
              description: "Machine introuvable",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "409": {
              description: "gameId déjà enregistré",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/api/pending-scores/{code}": {
        get: {
          summary: "Prévisualiser un score à réclamer",
          description: "Route publique — affiche les infos du score avant que l'utilisateur ne se connecte.",
          parameters: [
            {
              name: "code",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Code de réclamation à 6 caractères (ex: ABC123)",
            },
          ],
          responses: {
            "200": {
              description: "Score disponible",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PendingScorePreview" },
                },
              },
            },
            "404": {
              description: "Code invalide",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "409": {
              description: "Score déjà réclamé ou expiré",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: { type: "string" },
                      status: { type: "string", enum: ["CLAIMED", "EXPIRED"] },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/pending-scores/claim": {
        post: {
          summary: "Réclamer un score",
          description:
            "Attribue le score en tampon au compte Better Auth de l'utilisateur connecté.",
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["claimCode"],
                  properties: {
                    claimCode: {
                      type: "string",
                      pattern: "^[A-Z0-9]{6}$",
                      example: "ABC123",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Score réclamé avec succès",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      scoreId: { type: "string" },
                      value: { type: "integer" },
                      machineId: { type: "string" },
                      claimedAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Validation échouée",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "401": {
              description: "Non authentifié",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "404": {
              description: "Code invalide",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "409": {
              description: "Score déjà réclamé",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "410": {
              description: "Code expiré",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "429": {
              description: "Trop de tentatives",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "500": {
              description: "Erreur serveur",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/v1/scores": {
        post: {
          summary: "Enregistrer un score de borne (contrat v1)",
          description:
            "Appelé par la borne en fin de partie. Génère un code de claim à 6 chiffres et renvoie l'URL de réclamation.",
          security: [{ CabinetBearer: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/V1ScoreInput" } } },
          },
          responses: {
            "201": {
              description: "Score créé",
              content: { "application/json": { schema: { $ref: "#/components/schemas/V1ScoreCreated" } } },
            },
            "400": {
              description: "Validation échouée",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "401": {
              description: "Bearer absent ou invalide",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "500": {
              description: "Erreur serveur",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/v1/claim/{code}": {
        get: {
          summary: "Prévisualiser un score à réclamer (v1)",
          description: "Route publique — affiche le score avant réclamation.",
          parameters: [
            {
              name: "code",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Code de réclamation à 6 chiffres",
            },
          ],
          responses: {
            "200": {
              description: "Score disponible",
              content: { "application/json": { schema: { $ref: "#/components/schemas/V1ClaimPreview" } } },
            },
            "404": {
              description: "Code inconnu ou expiré",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "409": {
              description: "Score déjà réclamé",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
        post: {
          summary: "Réclamer un score de façon anonyme (v1)",
          description:
            "Route publique — attache un pseudo au score. Aucun compte requis. Le pseudo est normalisé en majuscules.",
          parameters: [
            {
              name: "code",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Code de réclamation à 6 chiffres",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["pseudo"],
                  properties: {
                    pseudo: {
                      type: "string",
                      minLength: 3,
                      maxLength: 20,
                      pattern: "^[a-zA-Z0-9_]+$",
                      example: "Lucas_42",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Score réclamé",
              content: { "application/json": { schema: { $ref: "#/components/schemas/V1ClaimResult" } } },
            },
            "400": {
              description: "Pseudo invalide (longueur, charset ou grossièreté)",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "404": {
              description: "Code inconnu",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "409": {
              description: "Score déjà réclamé",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "410": {
              description: "Code expiré",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/v1/leaderboard": {
        get: {
          summary: "Classement mondial par jeu (v1)",
          description:
            "Route publique. Retourne le top N des scores d'un jeu, triés décroissant. Supporte ETag / If-None-Match (304).",
          parameters: [
            {
              name: "mapId",
              in: "query",
              required: true,
              schema: { type: "string" },
              description: "Slug du jeu",
            },
            {
              name: "scope",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["world"], default: "world" },
              description: "Seul 'world' est supporté",
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
            },
          ],
          responses: {
            "200": {
              description: "Classement",
              headers: {
                ETag: { schema: { type: "string" }, description: "Hash du payload" },
              },
              content: { "application/json": { schema: { $ref: "#/components/schemas/V1Leaderboard" } } },
            },
            "304": { description: "Non modifié (If-None-Match correspond à l'ETag)" },
            "400": {
              description: "Validation échouée",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/api/health": {
        get: {
          summary: "Health check",
          responses: {
            "200": {
              description: "Serveur opérationnel",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                      service: { type: "string", example: "server" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
