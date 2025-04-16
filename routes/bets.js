const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const verifyToken = require('../middleware/verifyToken');

// Referência ao Firestore
const db = admin.firestore();

// Registrar uma aposta
router.post('/apostar', verifyToken, async (req, res) => {
  const { valor, jogo, tipo } = req.body;
  const uid = req.user.uid;

  try {
    const aposta = {
      uid,
      valor,
      jogo,
      tipo,
      data: new Date().toISOString()
    };

    await db.collection('apostas').add(aposta);
    res.status(201).json({ message: 'Aposta registrada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar aposta' });
  }
});

// Ver histórico de apostas
router.get('/historico', verifyToken, async (req, res) => {
  const uid = req.user.uid;

  try {
    const snapshot = await db.collection('apostas').where('uid', '==', uid).get();
    const apostas = snapshot.docs.map(doc => doc.data());

    res.status(200).json({ apostas });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

module.exports = router;
