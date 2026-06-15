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

const { prisma } = require('@pocket-maps/database');

app.get('/api/checkpoints/:id/scores', async (req, res) => {
  try {
    const machines = await prisma.machine.findMany({
      where: { checkpointId: req.params.id },
      include: {
        scores: {
          orderBy: { value: 'desc' },
          take: 5,
          include: { user: { select: { name: true } } },
        },
      },
    });
    res.json(machines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users/:id/stats', async (req, res) => {
  try {
    const [visitCount, topScoreRow] = await Promise.all([
      prisma.visit.count({ where: { userId: req.params.id } }),
      prisma.score.findFirst({
        where: { userId: req.params.id },
        orderBy: { value: 'desc' },
        select: { value: true },
      }),
    ]);
    res.json({ visitCount, topScore: topScoreRow?.value ?? null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
