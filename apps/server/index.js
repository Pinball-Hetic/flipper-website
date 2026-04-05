const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../../.env' });
const { prisma } = require('@pocket-maps/database');
const app = express();
const port = process.env.SERVER_PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'server' });
});

app.get('/api/checkpoints', async (req, res) => {
  try {
    const checkpoints = await prisma.checkpoint.findMany({
      include: { machines: true }
    });
    res.json(checkpoints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
