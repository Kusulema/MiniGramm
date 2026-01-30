import { Post } from '../src/models/Post';

describe('Post', () => {
  it('should create a Post instance with initial reactions', () => {
    const reactions = { like: 5, wow: 2, laugh: 1 };
    const post = new Post(1, 'test.jpg', 'A test post', reactions);

    expect(post).toBeInstanceOf(Post);
    expect(post.id).toBe(1);
    expect(post.imageUrl).toBe('test.jpg');
    expect(post.caption).toBe('A test post');
    expect(post.reactions.like).toBe(5);
    expect(post.reactions.wow).toBe(2);
    expect(post.reactions.laugh).toBe(1);
  });

  it('should initialize with default reaction counts if reactions are not provided', () => {
    const post = new Post(2, 'another.jpg', 'Another test post');

    expect(post.reactions.like).toBe(0);
    expect(post.reactions.wow).toBe(0);
    expect(post.reactions.laugh).toBe(0);
  });

  it('should correctly add a reaction', () => {
    const post = new Post(3, 'third.jpg', 'Third post', { like: 10, wow: 0, laugh: 0 });
    post.addReaction('like');
    expect(post.reactions.like).toBe(11);
    expect(post.reactions.wow).toBe(0);

    post.addReaction('wow');
    expect(post.reactions.wow).toBe(1);
  });
});
