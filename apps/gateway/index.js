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

// 1. Redirection spécifique pour le Serveur API (SAUF /api/auth)
// Proxy créé UNE seule fois au démarrage (sinon fuite mémoire : une instance par requête)
const apiProxy = createProxyMiddleware({ target: SERVER_TARGET, changeOrigin: true });
app.use('/api', (req, res, next) => {
  if (req.url.startsWith('/auth') || req.path.startsWith('/auth')) {
    // Si c'est de l'auth, on ne traite pas ici, on laisse passer au proxy suivant (le client)
    return next();
  }
  // Sinon, on envoie vers le serveur Express
  return apiProxy(req, res, next);
});

// 1bis. Contrat /v1 (bornes) vers le Serveur Express
app.use('/v1', createProxyMiddleware({
  target: SERVER_TARGET,
  changeOrigin: true,
}));

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
