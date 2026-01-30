// Mocking DOM elements for AppView
import { AppView } from '../src/views/AppView';
import { Post } from '../src/models/Post';

// A more robust mock for DOM elements
const createMockElement = (id: string = '', tagName: string = 'div', classes: string[] = []): HTMLElement => {
  const el = document.createElement(tagName);
  Object.defineProperty(el, 'id', { get: jest.fn(() => id) });
  Object.defineProperty(el, 'value', { writable: true, value: '' }); // Make value writable
  Object.defineProperty(el, 'textContent', { writable: true, value: '' }); // Make textContent writable
  Object.defineProperty(el, 'innerHTML', { writable: true, value: '' }); // Make innerHTML writable
  el.className = classes.join(' ');
  el.classList.add = jest.fn((cls) => el.className += ` ${cls}`); // Mock add method
  el.classList.remove = jest.fn((cls) => el.className = el.className.replace(` ${cls}`, '')); // Mock remove method
  el.addEventListener = jest.fn();
  el.removeEventListener = jest.fn();
  el.querySelector = jest.fn((selector) => {
    // Basic mock for form inputs
    if (selector === 'input') return createMockElement('test-input', 'input');
    return null;
  });
  el.querySelectorAll = jest.fn(() => {
    // Return a mock NodeListOf for buttons
    const mockButtons = [
      createMockElement('btn1', 'button', [], { 'data-reaction': 'like', 'data-post-id': '1' }),
      createMockElement('btn2', 'button', [], { 'data-reaction': 'wow', 'data-post-id': '1' }),
    ];
    // Cast to NodeListOf for TypeScript compliance
    return mockButtons as unknown as NodeListOf<HTMLElement>;
  });
  el.focus = jest.fn();
  (el as any).reset = jest.fn(); // Mock form.reset()
  return el;
};

// Helper to create a mock element with dataset attributes
const createMockElementWithDataset = (id: string, tagName: string, classes: string[], dataset: Record<string, string>): HTMLElement => {
  const el = createMockElement(id, tagName, classes);
  Object.defineProperty(el, 'dataset', { value: dataset });
  return el;
};


describe('AppView', () => {
  let rootElement: HTMLElement;
  let view: AppView;
  let mockForm: HTMLFormElement;
  let mockList: HTMLElement;
  let mockMessage: HTMLElement;
  let querySelectorSpy: jest.SpyInstance;
  let addEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset the DOM before each test
    document.body.innerHTML = '';

    // Mock document.createElement and document.querySelector
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'article') return createMockElement('post-card', 'article', ['post-card']);
        if (tagName === 'img') return createMockElement('img-tag', 'img');
        if (tagName === 'div') return createMockElement('div-tag', 'div');
        if (tagName === 'button') return createMockElement('button-tag', 'button');
        if (tagName === 'p') return createMockElement('p-tag', 'p');
        return createMockElement('', tagName);
    });

    rootElement = createMockElement('app');
    mockForm = createMockElement('post-form', 'form', ['post-form']) as HTMLFormElement;
    Object.defineProperty(mockForm, 'elements', { value: {
      imageUrl: { value: 'http://example.com/image.jpg' },
      caption: { value: 'Test Caption' }
    }});
    mockForm.querySelector = jest.fn((selector) => {
      if (selector === 'input') return createMockElement('input-mock', 'input');
      return null;
    });
    (mockForm as any).reset = jest.fn(); // Mock the reset method

    mockList = createMockElement('feed-list', 'section', ['feed']);
    mockMessage = createMockElement('message-p', 'p', ['message']);

    querySelectorSpy = jest.spyOn(rootElement, 'querySelector').mockImplementation((selector) => {
      if (selector === '.post-form') return mockForm;
      if (selector === '.feed') return mockList;
      if (selector === '.message') return mockMessage;
      return null;
    });

    document.body.appendChild(rootElement);
    view = new AppView(rootElement);

    addEventListenerSpy = jest.spyOn(mockForm, 'addEventListener');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be instantiated and set up basic DOM structure', () => {
    expect(view).toBeDefined();
    expect(rootElement.innerHTML).toContain('MiniGram');
    expect(querySelectorSpy).toHaveBeenCalledWith('.post-form');
    expect(querySelectorSpy).toHaveBeenCalledWith('.feed');
    expect(querySelectorSpy).toHaveBeenCalledWith('.message');
  });

  it('should bind the create handler to form submission', () => {
    const handler = jest.fn();
    view.bindCreate(handler);

    // Simulate form submission
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    mockForm.dispatchEvent(submitEvent);

    expect(handler).toHaveBeenCalledWith('http://example.com/image.jpg', 'Test Caption');
    expect(submitEvent.defaultPrevented).toBe(true);
  });

  it('should bind the react handler to reaction buttons', () => {
    const handler = jest.fn();
    view.bindReact(handler);

    const post = new Post(1, 'img.jpg', 'caption');
    view.render([post]); // Render to create reaction buttons

    const mockReactionButton = createMockElementWithDataset('react-btn', 'button', ['reaction'], {
      'data-post-id': '1',
      'data-reaction': 'like'
    });
    mockList.querySelector = jest.fn(() => mockReactionButton); // Make sure querySelector finds it

    // Simulate click on a reaction button
    // This part is tricky with just mocks, we need to ensure the event listener is called
    // A more robust test would involve directly calling the internal handler if exposed
    // For now, we'll check if addEventListener was called on the button
    // The actual trigger will be part of a future refactor if needed.
    const buttons = rootElement.querySelectorAll('[data-reaction]');
    (buttons[0] as HTMLElement).dispatchEvent(new Event('click'));

    expect(handler).toHaveBeenCalledWith(1, 'like');
  });

  it('should show a message', () => {
    view.showMessage('Test message');
    expect(mockMessage.textContent).toBe('Test message');
    expect(mockMessage.classList.add).toHaveBeenCalledWith('visible');
  });

  it('should clear the message', () => {
    view.clearMessage();
    expect(mockMessage.textContent).toBe('');
    expect(mockMessage.classList.remove).toHaveBeenCalledWith('visible');
  });

  it('should reset the form and focus the first input', () => {
    const mockInput = createMockElement('first-input', 'input');
    mockForm.querySelector = jest.fn(() => mockInput);

    view.resetForm();
    expect((mockForm as any).reset).toHaveBeenCalled();
    expect(mockInput.focus).toHaveBeenCalled();
  });

  it('should render posts correctly', () => {
    const posts: Post[] = [
      new Post(1, 'img1.jpg', 'Post 1', { like: 1, wow: 0, laugh: 0 }),
      new Post(2, 'img2.jpg', 'Post 2', { like: 0, wow: 1, laugh: 0 }),
    ];
    view.render(posts);

    expect(mockList.innerHTML).toContain('post-card');
    expect(mockList.innerHTML).toContain('img1.jpg');
    expect(mockList.innerHTML).toContain('Post 1');
    expect(mockList.innerHTML).toContain('<strong>1</strong>'); // for like count
  });

  it('should display "No posts yet" if no posts are provided', () => {
    view.render([]);
    expect(mockList.innerHTML).toContain('No posts yet - add one!');
  });
});
