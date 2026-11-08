const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Подключение роутов
const secondChanceRoutes = require('./routes/secondChanceItemsRoutes');
const searchRoutes = require('./routes/searchRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/secondchance/items', secondChanceRoutes);
app.use('/api/secondchance/search', searchRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('SecondChance Backend Service is running');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
