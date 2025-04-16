const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const verifyToken = require('../middleware/verifyToken');

const db = admin.firestore();

// Apostar no jackpot
router.post('/jackpot/apostar', verifyToken, async (req, res) => {
  const uid = req.user.uid;
  const { jogosSelecionados } = req.body;

  try {
    // Verifica e atualiza saldo
    const refCarteira = db.collection('carteiras').doc(uid);
    const doc = await refCarteira.get();

    const saldoAtual = doc.exists ? doc.data().saldo : 0;

    if (saldoAtual < 20) {
      return res.status(400).json({ error: 'Saldo insuficiente para participar do Jackpot (mínimo 20MT)' });
    }

    const novoSaldo = saldoAtual - 20;
    await refCarteira.set({ saldo: novoSaldo });

    const aposta = {
      uid,
      jogosSelecionados,
      data: new Date().toISOString(),
      semana: getSemanaAtual()
    };

    await db.collection('jackpot').add(aposta);
    res.status(201).json({ message: 'Aposta no Jackpot registrada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar aposta no Jackpot' });
  }
});

// Ver histórico de participações
router.get('/jackpot/historico', verifyToken, async (req, res) => {
  const uid = req.user.uid;

  try {
    const snapshot = await db.collection('jackpot')
      .where('uid', '==', uid)
      .orderBy('data', 'desc')
      .get();

    const participacoes = snapshot.docs.map(doc => doc.data());

    res.status(200).json({ participacoes });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico do Jackpot' });
  }
});

// Função auxiliar
function getSemanaAtual() {
  const data = new Date();
  const inicio = new Date(data.getFullYear(), 0, 1);
  const diff = (data - inicio) + (inicio.getTimezoneOffset() - data.getTimezoneOffset()) * 60000;
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
}

module.exports = router;
