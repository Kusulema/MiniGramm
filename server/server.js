// server/server.js

import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const PORT = 3000;
const DB_NAME = 'minigram_db'; // ⬅️ Название вашей базы данных

// 1. КОНФИГУРАЦИЯ БАЗЫ ДАННЫХ (для XAMPP)
const dbConfig = {
    host: 'localhost',
    user: 'root', // Логин по умолчанию для XAMPP
    password: '', // Пароль по умолчанию для XAMPP (пустой)
    database: DB_NAME
};

// 2. MIDDLEWARE
app.use(cors({ origin: 'http://127.0.0.1:5500' })); // Разрешаем запросы с Live Server
app.use(express.json()); // Для парсинга JSON-запросов

let connection;

// 3. ФУНКЦИЯ ДЛЯ ПОДКЛЮЧЕНИЯ К БД
async function connectDB() {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log(`Successfully connected to MySQL database: ${DB_NAME}`);
    } catch (error) {
        console.error('Error connecting to database:', error);
        // Выход из процесса, если не удается подключиться
        process.exit(1); 
    }
}

// 4. API ENDPOINTS (МАРШРУТЫ)
const API_PREFIX = '/api/posts';

// GET /api/posts - Загрузить все посты
app.get(API_PREFIX, async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM posts ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Failed to fetch posts.' });
    }
});

// POST /api/posts - Создать новый пост
app.post(API_PREFIX, async (req, res) => {
    const { imageUrl, caption } = req.body;
    if (!imageUrl || !caption) {
        return res.status(400).json({ message: 'Missing imageUrl or caption.' });
    }

    try {
        const query = 'INSERT INTO posts (image_url, caption) VALUES (?, ?)';
        const [result] = await connection.execute(query, [imageUrl, caption]);
        
        // Возвращаем созданный пост, используя его новый ID
        const [newPost] = await connection.execute('SELECT * FROM posts WHERE id = ?', [result.insertId]);
        res.status(201).json(newPost[0]);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Failed to create post.' });
    }
});

// PUT /api/posts/:id/react - Обновить реакцию
app.put(`${API_PREFIX}/:id/react`, async (req, res) => {
    const postId = req.params.id;
    const { reactionType } = req.body; // 'like', 'wow', или 'laugh'

    // Преобразуем тип реакции в имя столбца SQL
    const column = reactionType + 's'; // like -> likes, wow -> wows

    // Проверяем, что тип реакции допустим
    if (!['likes', 'wows', 'laughs'].includes(column)) {
        return res.status(400).json({ message: 'Invalid reaction type.' });
    }

    try {
        // Увеличиваем счетчик
        const query = `UPDATE posts SET ${column} = ${column} + 1 WHERE id = ?`;
        await connection.execute(query, [postId]);
        
        res.status(204).send(); // 204 No Content - успешное обновление
    } catch (error) {
        console.error('Error updating reaction:', error);
        res.status(500).json({ message: 'Failed to update reaction.' });
    }
});


// 5. ЗАПУСК СЕРВЕРА
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});