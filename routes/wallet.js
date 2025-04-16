const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const verifyToken = require('../middleware/verifyToken');

const db = admin.firestore();

// Ver saldo
router.get('/saldo', verifyToken, async (req, res) => {
  const uid = req.user.uid;

  try {
    const doc = await db.collection('carteiras').doc(uid).get();

    if (!doc.exists) {
      return res.status(200).json({ saldo: 0 });
    }

    res.status(200).json({ saldo: doc.data().saldo });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar saldo' });
  }
});

// Depositar saldo
router.post('/depositar', verifyToken, async (req, res) => {
  const uid = req.user.uid;
  const { valor } = req.body;

  try {
    const ref = db.collection('carteiras').doc(uid);
    const doc = await ref.get();

    let saldoAtual = 0;
    if (doc.exists) {
      saldoAtual = doc.data().saldo;
    }

    const novoSaldo = saldoAtual + valor;
    await ref.set({ saldo: novoSaldo });

    res.status(200).json({ message: 'Depósito feito com sucesso', saldo: novoSaldo });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao depositar' });
  }
});

// Levantar saldo
router.post('/levantar', verifyToken, async (req, res) => {
  const uid = req.user.uid;
  const { valor } = req.body;

  try {
    const ref = db.collection('carteiras').doc(uid);
    const doc = await ref.get();

    if (!doc.exists || doc.data().saldo < valor) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    const novoSaldo = doc.data().saldo - valor;
    await ref.set({ saldo: novoSaldo });

    res.status(200).json({ message: 'Levantamento feito com sucesso', saldo: novoSaldo });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao levantar' });
  }
});

module.exports = router;
