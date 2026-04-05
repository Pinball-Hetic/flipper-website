const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../../.env' });

const app = express();
// Port Serveur : 8882
const port = 8882;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'server', port });
});

// Vos autres routes API ici...

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
