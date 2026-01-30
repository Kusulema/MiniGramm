import { AppController } from '../src/controllers/AppController';
import { AppView } from '../src/views/AppView';
import { PostRepository } from '../src/data/PostRepository';
import { Post } from '../src/models/Post';

// Mock PostRepository
jest.mock('../src/data/PostRepository.js');
const MockPostRepository = PostRepository as jest.MockedClass<typeof PostRepository>;

describe('AppController', () => {
  let mockView: AppView;
  let controller: AppController;
  let mockPostRepositoryInstance: jest.Mocked<PostRepository>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock the AppView methods that AppController interacts with
    mockView = {
      bindCreate: jest.fn(),
      bindReact: jest.fn(),
      render: jest.fn(),
      showMessage: jest.fn(),
      clearMessage: jest.fn(),
      resetForm: jest.fn(),
    } as unknown as AppView; // Type assertion

    // Instantiate the mocked PostRepository
    new MockPostRepository(); // This creates the instance
    mockPostRepositoryInstance = MockPostRepository.mock.instances[0] as jest.Mocked<PostRepository>;
    mockPostRepositoryInstance.loadAll.mockResolvedValue([]); // Default mock for loadAll
    mockPostRepositoryInstance.create.mockResolvedValue(new Post(1, 'url', 'caption'));
    mockPostRepositoryInstance.updateReaction.mockResolvedValue(undefined);

    controller = new AppController(mockView);
  });

  it('should initialize the view and load posts on init', async () => {
    const mockPosts = [new Post(1, 'url', 'caption')];
    mockPostRepositoryInstance.loadAll.mockResolvedValue(mockPosts);

    await controller.init();

    expect(mockView.bindCreate).toHaveBeenCalledWith(expect.any(Function));
    expect(mockView.bindReact).toHaveBeenCalledWith(expect.any(Function));
    expect(mockPostRepositoryInstance.loadAll).toHaveBeenCalledTimes(1);
    expect(mockView.render).toHaveBeenCalledWith(mockPosts);
  });

  describe('handleCreatePost', () => {
    let handleCreatePostFn: (imageUrl: string, caption: string) => Promise<void>;

    beforeEach(async () => {
      // Get the bound handleCreatePost function after init
      await controller.init();
      handleCreatePostFn = (mockView.bindCreate as jest.Mock).mock.calls[0][0];
    });

    it('should show an error message if imageUrl or caption are missing', async () => {
      await handleCreatePostFn('', 'caption');
      expect(mockView.showMessage).toHaveBeenCalledWith('Add an image URL and a caption.');
      expect(mockPostRepositoryInstance.create).not.toHaveBeenCalled();
    });

    it('should clear message, create post, load all posts, render and reset form on success', async () => {
      const newPost = new Post(2, 'new.jpg', 'new caption');
      mockPostRepositoryInstance.create.mockResolvedValue(newPost);
      const updatedPosts = [new Post(1, 'url', 'caption'), newPost];
      mockPostRepositoryInstance.loadAll.mockResolvedValue(updatedPosts);

      await handleCreatePostFn('new.jpg', 'new caption');

      expect(mockView.clearMessage).toHaveBeenCalledTimes(1);
      expect(mockPostRepositoryInstance.create).toHaveBeenCalledWith('new.jpg', 'new caption');
      expect(mockPostRepositoryInstance.loadAll).toHaveBeenCalledTimes(2); // Once for init, once after create
      expect(mockView.render).toHaveBeenCalledWith(updatedPosts);
      expect(mockView.resetForm).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleReact', () => {
    let handleReactFn: (postId: number, reactionType: string) => Promise<void>;

    beforeEach(async () => {
      // Get the bound handleReact function after init
      await controller.init();
      handleReactFn = (mockView.bindReact as jest.Mock).mock.calls[0][0];
    });

    it('should update reaction, load all posts and render on success', async () => {
      const mockPostsAfterReact = [new Post(1, 'url', 'caption', { like: 1, wow: 0, laugh: 0 })];
      mockPostRepositoryInstance.loadAll.mockResolvedValue(mockPostsAfterReact);

      await handleReactFn(1, 'like');

      expect(mockPostRepositoryInstance.updateReaction).toHaveBeenCalledWith(1, 'like');
      expect(mockPostRepositoryInstance.loadAll).toHaveBeenCalledTimes(2); // Once for init, once after react
      expect(mockView.render).toHaveBeenCalledWith(mockPostsAfterReact);
    });
  });
});
