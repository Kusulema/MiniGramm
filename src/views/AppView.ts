// src/views/AppView.ts
import { Post, ReactionType } from '../models/Post.js';

type CreateHandler = (imageUrl: string, caption: string) => void;
type ReactHandler = (postId: number, reaction: ReactionType) => void;

// Представление: отвечает за DOM, формы и вывод ленты
export class AppView {
    private form: HTMLFormElement;
    private list: HTMLElement;
    private message: HTMLElement;
    private createHandler!: CreateHandler;
    private reactHandler!: ReactHandler;

    constructor(private root: HTMLElement) {
        // Базовая разметка приложения
        this.root.innerHTML = `
            <div class="inner-html">
                <section class="composer">
                    <h1>MiniGram</h1>
                    <form class="post-form">
                        <label>Image URL <input name="imageUrl" type="url" placeholder="https://..." required /></label>
                        <label>Caption <input name="caption" type="text" placeholder="Say something" maxlength="120" required /></label>
                        <button type="submit">Post</button>
                    </form>
                    <p class="message" aria-live="polite"></p>
                </section>
                <section class="feed"></section>
            </div>
        `;

        this.form = this.root.querySelector('.post-form') as HTMLFormElement;
        this.list = this.root.querySelector('.feed') as HTMLElement;
        this.message = this.root.querySelector('.message') as HTMLElement;

        // Обработка отправки формы: собираем данные и пробрасываем наружу
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!this.createHandler) return;

            const formData = new FormData(this.form);
            const imageUrl = String(formData.get('imageUrl') || '').trim();
            const caption = String(formData.get('caption') || '').trim();

            this.createHandler(imageUrl, caption);
        });
    }

    // Подписка контроллера на событие создания поста
    bindCreate(handler: CreateHandler): void {
        this.createHandler = handler;
    }

    // Подписка контроллера на событие реакции
    bindReact(handler: ReactHandler): void {
        this.reactHandler = handler;
    }

    // Показать сообщение об ошибке/подсказке
    showMessage(text: string): void {
        this.message.textContent = text;
        this.message.classList.add('visible');
    }

    // Скрыть сообщение
    clearMessage(): void {
        this.message.textContent = '';
        this.message.classList.remove('visible');
    }

    // Сбросить форму и вернуть фокус на первый инпут
    resetForm(): void {
        this.form.reset();
        const firstInput = this.form.querySelector('input');
        firstInput?.focus();
    }

    // Нарисовать список постов
    render(posts: Post[]): void {
        this.list.innerHTML = '';
        if (!posts.length) {
            const empty = document.createElement('p');
            empty.className = 'empty';
            empty.textContent = 'No posts yet - add one!';
            this.list.appendChild(empty);
            return;
        }

        posts.forEach((post) => this.list.appendChild(this.createPostElement(post)));
    }

    // Создаем DOM-узел поста
    private createPostElement(post: Post): HTMLElement {
        const container = document.createElement('article');
        container.className = 'post-card';
        container.innerHTML = `
            <div class="image-wrap">
                <img src="${post.imageUrl}" alt="${post.caption}" loading="lazy" />
            </div>
            <div class="post-body">
                <p class="caption">${post.caption}</p>
                <div class="reactions">
                    ${this.reactionButton(post, 'like', 'Like', post.reactions.like)}
                    ${this.reactionButton(post, 'wow', 'Wow', post.reactions.wow)}
                    ${this.reactionButton(post, 'laugh', 'Haha', post.reactions.laugh)}
                </div>
            </div>
        `;

        // Навешиваем обработчики на кнопки реакций
        const buttons = container.querySelectorAll('[data-reaction]');
        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                const reactButton = button as HTMLButtonElement;
                const reaction = reactButton.dataset.reaction as ReactionType;
                const postId = Number(reactButton.dataset.postId);

                this.reactHandler(postId, reaction);
            });
        });

        return container;
    }

    // Возвращаем шаблон кнопки реакции
    private reactionButton(post: Post, reaction: ReactionType, label: string, count: number): string {
        return `
            <button class="reaction" data-post-id="${post.id}" data-reaction="${reaction}">
                <span>${label}</span>
                <strong>${count}</strong>
            </button>
        `;
    }
}