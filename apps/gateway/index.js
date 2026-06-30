const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config({ path: '../../.env' });

const app = express();
const port = process.env.GATEWAY_PORT || 8881;

const CLIENT_TARGET = process.env.CLIENT_URL || 'http://localhost:8888';
const SERVER_TARGET = process.env.SERVER_URL || 'http://localhost:8882';

app.use(cors({
  origin: true,
  credentials: true,
}));

// 1. /api (hors /api/auth) et /v1 (bornes) -> serveur Express.
// Monté SANS préfixe de chemin : Express ne strip pas le mount path, donc le
// chemin COMPLET (/api/..., /v1/...) est préservé vers le serveur.
// pathFilter sélectionne ce qui part vers le serveur ; sinon next() -> client.
// Proxy créé UNE seule fois au démarrage (jamais par requête : pas de fuite mémoire).
const serverProxy = createProxyMiddleware({
  target: SERVER_TARGET,
  changeOrigin: true,
  pathFilter: (path) =>
    (path.startsWith('/api') && !path.startsWith('/api/auth')) || path.startsWith('/v1'),
});
app.use(serverProxy);

// 2. TOUT le reste (UI + Auth) vers le Client Next.js
app.use('/', createProxyMiddleware({
  target: CLIENT_TARGET,
  changeOrigin: false, // Très important : garde le host localhost:8881
  xfwd: true,          // Ajoute les headers X-Forwarded-For etc.
  on: {
    proxyReq: (proxyReq, req) => {
      // On s'assure que Next.js sait qu'il est accédé via 8881
      proxyReq.setHeader('x-forwarded-host', req.headers.host);
    },
    proxyRes: (proxyRes, req, res) => {
      // Log pour voir si le client répond bien
      if (req.url.includes('/api/auth')) {
        console.log(`[Gateway] Auth Response: ${proxyRes.statusCode} for ${req.url}`);
      }
    }
  }
}));

app.listen(port, () => {
  console.log(`Gateway ULTRA-ROBUSTE sur http://localhost:${port}`);
  console.log(`-> Client Target: ${CLIENT_TARGET}`);
  console.log(`-> Server Target: ${SERVER_TARGET}`);
});
