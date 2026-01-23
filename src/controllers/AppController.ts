// src/controllers/AppController.ts

import { AppView } from '../views/AppView.js';
import { Post, ReactionType } from '../models/Post.js';
import { PostRepository } from '../data/PostRepository.js'; 

// Связывает View и данные, управляет состоянием ленты
export class AppController {
    
    private repository: PostRepository;

    constructor(private view: AppView) {
        this.repository = new PostRepository();
    }

    // Точка инициализации: подписываем события и показываем список
    async init(): Promise<void> { // ⬅️ Сделали async
        this.view.bindCreate(this.handleCreatePost);
        this.view.bindReact(this.handleReact);
        
        // ⬅️ Добавили await
        const initialPosts = await this.repository.loadAll(); 
        this.view.render(initialPosts); 
    }

    // Обработчик создания нового поста
    private handleCreatePost = async (imageUrl: string, caption: string): Promise<void> => { // ⬅️ Сделали async
        if (!imageUrl || !caption) {
            this.view.showMessage('Add an image URL and a caption.');
            return;
        }

        this.view.clearMessage();
        
        // ⬅️ Добавили await
        await this.repository.create(imageUrl, caption);

        // ⬅️ Добавили await: Заново загружаем все посты, чтобы получить актуальный список
        const updatedPosts = await this.repository.loadAll(); 
        
        this.view.render(updatedPosts);
        this.view.resetForm();
    };

    // Обработчик реакции
    private handleReact = async (postId: number, reaction: ReactionType): Promise<void> => { // ⬅️ Сделали async
        
        // ⬅️ Обновляем реакцию через репозиторий (отправляем запрос на сервер)
        await this.repository.updateReaction(postId, reaction); 

        // ⬅️ Заново загружаем данные (чтобы получить актуальные счетчики от SQL)
        const updatedPosts = await this.repository.loadAll(); 
        
        this.view.render(updatedPosts);
    };
}