// src/data/PostRepository.ts

import { Post, ReactionType } from '../models/Post.js';

// ⬅️ АДРЕС ВАШЕГО БЭКЕНД-СЕРВЕРА!
// Вам нужно будет создать и запустить сервер, который обрабатывает эти запросы.
const API_URL = 'http://localhost:3000/api/posts'; 

// Класс для управления сохранением и загрузкой данных
export class PostRepository {
    
    // ⚠️ currentId, constructor, saveAll, loadAll (LocalStorage) и seed удалены
    // Эта логика перенесена на Бэкенд (SQL).

    // Загружает все посты с сервера
    async loadAll(): Promise<Post[]> {
        const response = await fetch(API_URL);
        if (!response.ok) {
            console.error('Failed to load posts from API.');
            return [];
        }
        
        const data = await response.json();
        
        // Восстанавливаем посты из JSON, создавая экземпляры класса Post
        return data.map((item: any) => 
            // Обратите внимание: имена полей 'likes' в SQL и 'like' в Post.ts должны совпадать
            new Post(item.id, item.image_url, item.caption, {
                like: item.likes || 0,
                wow: item.wows || 0,
                laugh: item.laughs || 0
            })
        );
    }

    // Создает новый пост, отправляя данные на сервер
    async create(imageUrl: string, caption: string): Promise<Post> {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl, caption })
        });

        if (!response.ok) throw new Error('Failed to create post on server.');

        const newPostData = await response.json();
        // Сервер должен вернуть созданный пост с ID и начальными реакциями
        return new Post(newPostData.id, newPostData.image_url, newPostData.caption, {
            like: newPostData.likes || 0,
            wow: newPostData.wows || 0,
            laugh: newPostData.laughs || 0
        });
    }

    // Обновляет реакции на сервере
    async updateReaction(postId: number, reaction: ReactionType): Promise<void> {
        // Отправляем PUT-запрос, чтобы увеличить счетчик реакции на сервере
        const response = await fetch(`${API_URL}/${postId}/react`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reactionType: reaction })
        });
        
        if (!response.ok) throw new Error('Failed to update reaction on server.');
    }
    
    // ⚠️ Метод update() из оригинального кода удален, так как он более не нужен, 
    // вместо него используется updateReaction.
}