// Jest setup file for browser environment mocking

// Mock DOM APIs
global.document = {
  createElement: jest.fn((tagName) => {
    if (tagName === 'canvas') {
      return {
        width: 800,
        height: 600,
        getContext: jest.fn(() => ({
          fillStyle: '',
          font: '',
          textAlign: '',
          fillRect: jest.fn(),
          fillText: jest.fn(),
        })),
        style: {},
        parentNode: {
          removeChild: jest.fn(),
          appendChild: jest.fn(),
        }
      };
    }
    return { style: {}, appendChild: jest.fn() };
  }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  querySelector: jest.fn(() => null),
  readyState: 'complete',
};

global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock browser APIs
global.alert = jest.fn();
global.prompt = jest.fn();
global.confirm = jest.fn();

// Mock console to reduce test noise (optional)
// global.console = { ...console, log: jest.fn() };
