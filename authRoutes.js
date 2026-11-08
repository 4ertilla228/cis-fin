const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'secondchance_secret_key';

// 1. Регистрация: POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        const db = await connectToDatabase();
        const collection = db.collection('users');

        const existingUser = await collection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            createdAt: new Date()
        };

        await collection.insertOne(newUser);
        const token = jwt.sign({ email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ message: 'User registered successfully', token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Вход: POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = await connectToDatabase();
        const collection = db.collection('users');

        const user = await collection.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token, userName: user.firstName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Обновление пользователя: PUT /api/auth/update
router.put('/update', async (req, res) => {
    try {
        const { email, firstName, lastName } = req.body;
        const db = await connectToDatabase();
        const collection = db.collection('users');

        const result = await collection.updateOne(
            { email },
            { $set: { firstName, lastName, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
