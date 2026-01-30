import { PostRepository } from '../src/data/PostRepository';
import { Post } from '../src/models/Post'; // Import Post to correctly type expectations

describe('PostRepository', () => {
  let repository: PostRepository;

  beforeEach(() => {
    // Mock fetch API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([]), // Default empty array for loadAll
        ok: true,
        status: 200
      } as Response)
    );
    repository = new PostRepository();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should load all posts successfully', async () => {
    const mockPostsData = [
      { id: 1, image_url: 'img1.jpg', caption: 'Post 1', likes: 10, wows: 5, laughs: 2 },
    ];
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockPostsData),
        ok: true,
        status: 200
      } as Response)
    );

    const posts = await repository.loadAll();
    expect(posts.length).toBe(1);
    expect(posts[0]).toBeInstanceOf(Post);
    expect(posts[0].id).toBe(1);
    expect(posts[0].reactions.like).toBe(10);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/posts');
  });

  it('should create a post successfully', async () => {
    const newPostData = { imageUrl: 'image.jpg', caption: 'Hello' };
    const mockResponse = { id: 2, image_url: newPostData.imageUrl, caption: newPostData.caption, likes: 0, wows: 0, laughs: 0 };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockResponse),
        ok: true,
        status: 201
      } as Response)
    );

    const createdPost = await repository.create(newPostData.imageUrl, newPostData.caption);
    expect(createdPost).toBeInstanceOf(Post);
    expect(createdPost.imageUrl).toBe(newPostData.imageUrl);
    expect(createdPost.caption).toBe(newPostData.caption);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPostData)
    });
  });

  it('should update a reaction successfully', async () => {
    const postId = 1;
    const reactionType = 'like';

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 204
      } as Response)
    );

    await repository.updateReaction(postId, reactionType);
    expect(global.fetch).toHaveBeenCalledWith(`http://localhost:3000/api/posts/${postId}/react`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reactionType: reactionType })
    });
  });

  it('should handle API errors for loadAll', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      } as Response)
    );
    const posts = await repository.loadAll();
    expect(posts).toEqual([]);
    expect(console.error).toHaveBeenCalled(); // Assuming console.error is mocked
  });

  it('should handle API errors for create', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      } as Response)
    );
    await expect(repository.create('bad.jpg', 'bad')).rejects.toThrow('Failed to create post on server.');
  });

  it('should handle API errors for updateReaction', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      } as Response)
    );
    await expect(repository.updateReaction(1, 'like')).rejects.toThrow('Failed to update reaction on server.');
  });
});

