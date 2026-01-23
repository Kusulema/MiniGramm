// src/controllers/AppController.ts
import { PostRepository } from '../data/PostRepository.js';
// Связывает View и данные, управляет состоянием ленты
export class AppController {
    constructor(view) {
        this.view = view;
        // Обработчик создания нового поста
        this.handleCreatePost = async (imageUrl, caption) => {
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
        this.handleReact = async (postId, reaction) => {
            // ⬅️ Обновляем реакцию через репозиторий (отправляем запрос на сервер)
            await this.repository.updateReaction(postId, reaction);
            // ⬅️ Заново загружаем данные (чтобы получить актуальные счетчики от SQL)
            const updatedPosts = await this.repository.loadAll();
            this.view.render(updatedPosts);
        };
        this.repository = new PostRepository();
    }
    // Точка инициализации: подписываем события и показываем список
    async init() {
        this.view.bindCreate(this.handleCreatePost);
        this.view.bindReact(this.handleReact);
        // ⬅️ Добавили await
        const initialPosts = await this.repository.loadAll();
        this.view.render(initialPosts);
    }
}
