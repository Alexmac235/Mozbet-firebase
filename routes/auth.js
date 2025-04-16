const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'chave_super_secreta';

// Registrar usuário (com e-mail e senha)
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await admin.auth().createUser({ email, password });
    res.status(201).json({ message: 'Usuário registrado com sucesso', uid: user.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login e geração de token
router.post('/login', async (req, res) => {
  const { uid } = req.body;

  try {
    const user = await admin.auth().getUser(uid);

    // Gera token com dados básicos
    const token = jwt.sign({ uid: user.uid, email: user.email }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(200).json({ message: 'Login bem-sucedido', token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

module.exports = router;
