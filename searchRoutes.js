const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');

router.get('/', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('secondChanceItems');
        
        let query = {};
        
        // Фильтрация по категории
        if (req.query.category) {
            query.category = req.query.category;
        }
        
        // Дополнительные фильтры по имени и возрасту предмета
        if (req.query.name) {
            query.name = { $regex: req.query.name, $options: 'i' };
        }
        if (req.query.age_years) {
            query.age_years = { $lte: Number(req.query.age_years) };
        }

        const items = await collection.find(query).toArray();
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
