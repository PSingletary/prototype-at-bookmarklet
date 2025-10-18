/**
 * Tests for Space Invaders Game
 */

const SpaceInvadersGame = require('../game.js');

// Mock Canvas API
const mockCanvas = {
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

// Mock document methods
global.document = {
  createElement: jest.fn((tagName) => {
    if (tagName === 'canvas') {
      return mockCanvas;
    }
    return { style: {}, appendChild: jest.fn() };
  }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  body: {
    appendChild: jest.fn(),
    style: {},
  },
  querySelector: jest.fn(() => null),
};

global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));

// Mock ATProtocolClient
class MockATProtocolClient {
  constructor() {
    this.authenticated = true;
  }
  
  async authenticate() {
    return { handle: 'test.user', authenticated: true };
  }
  
  async getUserLikesCount() {
    return 100;
  }
  
  async getUserLexicons() {
    return ['social', 'tech'];
  }
  
  calculateMultiplier() {
    return 1.4;
  }
  
  checkDailyLimit() {
    return { remaining: 5 };
  }
  
  recordGameSession() {}
}

// Set up the mock before requiring the game module
global.ATProtocolClient = MockATProtocolClient;

describe('SpaceInvadersGame', () => {
  let game;

  beforeEach(() => {
    jest.clearAllMocks();
    game = new SpaceInvadersGame();
    // Mock the canvas context
    game.ctx = mockCanvas.getContext('2d');
  });

  describe('constructor', () => {
    test('should initialize with default values', () => {
      expect(game.gameState).toBe('loading');
      expect(game.score).toBe(0);
      expect(game.ammunition).toBe(100);
      expect(game.multiplier).toBe(1.0);
      expect(game.lives).toBe(3);
      expect(game.level).toBe(1);
      expect(game.canvasWidth).toBe(800);
      expect(game.canvasHeight).toBe(600);
    });
  });

  describe('initPlayer', () => {
    test('should initialize player at correct position', () => {
      game.canvasWidth = 800;
      game.canvasHeight = 600;
      
      game.initPlayer();
      
      expect(game.player).toBeDefined();
      expect(game.player.x).toBe(375); // (800/2) - 25
      expect(game.player.y).toBe(550); // 600 - 50
      expect(game.player.width).toBe(50);
      expect(game.player.height).toBe(30);
    });
  });

  describe('initEnemies', () => {
    test('should create correct number of enemies', () => {
      game.initEnemies();
      
      expect(game.enemies).toHaveLength(50); // 5 rows × 10 columns
    });

    test('should position enemies correctly', () => {
      game.initEnemies();
      
      const firstEnemy = game.enemies[0];
      expect(firstEnemy.x).toBe(100);
      expect(firstEnemy.y).toBe(80);
      expect(firstEnemy.width).toBe(30);
      expect(firstEnemy.height).toBe(20);
    });

    test('should set correct colors for different rows', () => {
      game.initEnemies();
      
      expect(game.enemies[0].color).toBe('#ff0000'); // First row (row 0)
      expect(game.enemies[20].color).toBe('#ff8800'); // Middle row (row 2)
      expect(game.enemies[40].color).toBe('#ffff00'); // Last row (row 4)
    });
  });

  describe('checkRectCollision', () => {
    test('should detect collision between rectangles', () => {
      const rect1 = { x: 0, y: 0, width: 10, height: 10 };
      const rect2 = { x: 5, y: 5, width: 10, height: 10 };
      
      expect(game.checkRectCollision(rect1, rect2)).toBe(true);
    });

    test('should not detect collision when rectangles do not overlap', () => {
      const rect1 = { x: 0, y: 0, width: 10, height: 10 };
      const rect2 = { x: 20, y: 20, width: 10, height: 10 };
      
      expect(game.checkRectCollision(rect1, rect2)).toBe(false);
    });
  });

  describe('shoot', () => {
    beforeEach(() => {
      game.gameState = 'playing';
      game.ammunition = 5;
      game.player = { x: 100, y: 500, width: 50 };
    });

    test('should create bullet when ammunition available', () => {
      const initialBulletCount = game.bullets.length;
      
      game.shoot();
      
      expect(game.bullets).toHaveLength(initialBulletCount + 1);
      expect(game.bullets[0].x).toBe(123); // player.x + player.width/2 - 2
      expect(game.bullets[0].y).toBe(500);
      expect(game.ammunition).toBe(4);
    });

    test('should not shoot when no ammunition', () => {
      game.ammunition = 0;
      const initialBulletCount = game.bullets.length;
      
      game.shoot();
      
      expect(game.bullets).toHaveLength(initialBulletCount);
    });

    test('should not shoot when not in playing state', () => {
      game.gameState = 'menu';
      const initialBulletCount = game.bullets.length;
      
      game.shoot();
      
      expect(game.bullets).toHaveLength(initialBulletCount);
    });
  });

  describe('updateBullets', () => {
    beforeEach(() => {
      game.bullets = [
        { x: 100, y: 100, speed: 5 },
        { x: 200, y: -10, speed: 5 }, // This should be removed
      ];
      game.enemyBullets = [
        { x: 150, y: 300, speed: 3 },
        { x: 250, y: 700, speed: 3 }, // This should be removed
      ];
      game.canvasHeight = 600;
    });

    test('should move bullets correctly and remove out-of-bounds bullets', () => {
      game.updateBullets();
      
      expect(game.bullets).toHaveLength(1);
      expect(game.bullets[0].y).toBe(95); // 100 - 5
      expect(game.enemyBullets).toHaveLength(1);
      expect(game.enemyBullets[0].y).toBe(303); // 300 + 3
    });
  });

  describe('updatePlayer', () => {
    beforeEach(() => {
      game.player = { x: 400, y: 500, width: 50, speed: 5 };
      game.canvasWidth = 800;
    });

    test('should move player left when left key pressed', () => {
      game.keys = { 'ArrowLeft': true };
      
      game.updatePlayer();
      
      expect(game.player.x).toBe(395);
    });

    test('should move player right when right key pressed', () => {
      game.keys = { 'ArrowRight': true };
      
      game.updatePlayer();
      
      expect(game.player.x).toBe(405);
    });

    test('should not move beyond canvas boundaries', () => {
      game.player.x = 0;
      game.keys = { 'ArrowLeft': true };
      
      game.updatePlayer();
      
      expect(game.player.x).toBe(0);
    });
  });

  describe('game state management', () => {
    test('should start game from menu state', () => {
      game.gameState = 'menu';
      
      game.startGame();
      
      expect(game.gameState).toBe('playing');
    });

    test('should toggle pause correctly', () => {
      game.gameState = 'playing';
      game.togglePause();
      expect(game.gameState).toBe('paused');
      
      game.togglePause();
      expect(game.gameState).toBe('playing');
    });

    test('should set game over state', () => {
      game.gameOver();
      expect(game.gameState).toBe('gameover');
    });
  });
});
