const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const connectToDatabase = require('../db');

// Настройка хранилища multer для файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

// 1. Получить все элементы: GET /api/secondchance/items
router.get('/', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('secondChanceItems');
        const items = await collection.find({}).toArray();
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Получить один элемент по ID: GET /api/secondchance/items/:id
router.get('/:id', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('secondChanceItems');
        const item = await collection.findOne({ id: req.params.id });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Создать новый элемент с файлом: POST /api/secondchance/items
router.post('/', upload.single('file'), async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('secondChanceItems');
        let newItem = req.body;
        if (req.file) {
            newItem.image = `/images/${req.file.filename}`;
        }
        newItem.date_added = Math.floor(Date.now() / 1000);
        const result = await collection.insertOne(newItem);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Удалить элемент по ID: DELETE /api/secondchance/items/:id
router.delete('/:id', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('secondChanceItems');
        const result = await collection.deleteOne({ id: req.params.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json({ message: 'Item successfully deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
