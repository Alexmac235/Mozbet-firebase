const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const verifyToken = require('../middleware/verifyToken');

// Configurar Africa's Talking
const africastalking = require('africastalking')({
  apiKey: 'atsk_7ebdb397981ad6e0cc420d2c187b5782261e8d26ef7903639e5aa2ca86eb159da73b9860',
  username: 'sandbox'
});

const sms = africastalking.SMS;
const db = admin.firestore();

// Função para enviar SMS
async function enviarSMS(to, message) {
  try {
    await sms.send({
      to: [`+258${to}`], // número moçambicano
      message,
      from: 'MozBet'
    });
  } catch (error) {
    console.log('Erro ao enviar SMS:', error.message);
  }
}

// Ver saldo
router.get('/saldo', verifyToken, async (req, res) => {
  const uid = req.user.uid;

  try {
    const doc = await db.collection('carteiras').doc(uid).get();
    const saldo = doc.exists ? doc.data().saldo : 0;
    res.status(200).json({ saldo });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar saldo' });
  }
});

// Depositar
router.post('/depositar', verifyToken, async (req, res) => {
  const uid = req.user.uid;
  const { valor, telefone } = req.body;

  try {
    const ref = db.collection('carteiras').doc(uid);
    const doc = await ref.get();

    const saldoAtual = doc.exists ? doc.data().saldo : 0;
    const novoSaldo = saldoAtual + valor;
    await ref.set({ saldo: novoSaldo });

    await enviarSMS(telefone, `Depósito de ${valor}MT feito com sucesso na sua conta MozBet. Saldo: ${novoSaldo}MT.`);

    res.status(200).json({ message: 'Depósito feito com sucesso', saldo: novoSaldo });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao depositar' });
  }
});

// Levantar
router.post('/levantar', verifyToken, async (req, res) => {
  const uid = req.user.uid;
  const { valor, telefone } = req.body;

  try {
    const ref = db.collection('carteiras').doc(uid);
    const doc = await ref.get();

    const saldoAtual = doc.exists ? doc.data().saldo : 0;

    if (saldoAtual < valor) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    const novoSaldo = saldoAtual - valor;
    await ref.set({ saldo: novoSaldo });

    await enviarSMS(telefone, `Levantamento de ${valor}MT solicitado na MozBet. Saldo atual: ${novoSaldo}MT.`);

    res.status(200).json({ message: 'Levantamento feito com sucesso', saldo: novoSaldo });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao levantar' });
  }
});

module.exports = router;
