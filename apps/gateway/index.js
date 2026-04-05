const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config({ path: '../../.env' });

const app = express();
const port = process.env.GATEWAY_PORT || 3000;

app.use(cors());

// Proxy /api calls to Server
app.use('/api', createProxyMiddleware({
  target: process.env.SERVER_URL || 'http://localhost:4000',
  changeOrigin: true,
}));

// Everything else goes to Client (Next.js)
app.use('/', createProxyMiddleware({
  target: process.env.CLIENT_URL || 'http://localhost:3001',
  changeOrigin: false,
  xfwd: true,
  on: {
    proxyReq: (proxyReq, req) => {
      // S'assurer que Next.js reçoit bien le host d'origine
      proxyReq.setHeader('x-forwarded-host', req.headers.host);
    }
  }
}));

app.listen(port, () => {
  console.log(`Gateway listening on port ${port}`);
});
