const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await db('users').where({ email }).first();
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    await db('users').insert({
      id: userId,
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
    });
    const user = await db('users').where({ id: userId }).first();

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userData } = user;
    res.json({ user: userData, token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed.' });
  }
};

exports.getMe = async (req, res) => {
  const { password: _, ...userData } = req.user;
  res.json(userData);
};
