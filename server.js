const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// Rota de teste: salvar usuário no Firestore
app.post('/api/register', async (req, res) => {
  const { nome, telefone } = req.body;
  try {
    const docRef = await db.collection('usuarios').add({ nome, telefone });
    res.status(200).send({ id: docRef.id, message: 'Usuário registrado com sucesso!' });
  } catch (error) {
    res.status(500).send({ error: 'Erro ao registrar usuário' });
  }
});

app.get('/', (req, res) => {
  res.send('MozBet com Firebase está online!');
});

// Porta dinâmica exigida pelo Glitch
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
const authRoutes = require('./routes/auth');
const betRoutes = require('./routes/bets');
const walletRoutes = require('./routes/wallet');

app.use('/api', authRoutes);
app.use('/api', betRoutes);
app.use('/api', walletRoutes);
