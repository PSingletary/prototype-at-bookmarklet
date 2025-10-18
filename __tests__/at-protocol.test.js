/**
 * Tests for AT Protocol Client
 */

const ATProtocolClient = require('../at-protocol.js');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock prompt
global.prompt = jest.fn();

describe('ATProtocolClient', () => {
  let client;

  beforeEach(() => {
    client = new ATProtocolClient();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    global.prompt.mockClear();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should initialize with default values', () => {
      expect(client.baseURL).toBe('https://bsky.social/xrpc');
      expect(client.cache).toBeInstanceOf(Map);
      expect(client.cacheTimeout).toBe(5 * 60 * 1000);
    });
  });

  describe('authenticate', () => {
    test('should return cached session if available', async () => {
      const cachedSession = {
        handle: 'test.user',
        authenticated: true,
        timestamp: Date.now()
      };
      
      jest.spyOn(client, 'getCache').mockReturnValue(cachedSession);
      
      const result = await client.authenticate();
      
      expect(result).toEqual(cachedSession);
      expect(localStorageMock.getItem).not.toHaveBeenCalled();
    });

    test('should create new session when no cached session', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      global.prompt.mockReturnValue('test.user.bsky.social');
      
      const result = await client.authenticate();
      
      expect(result.handle).toBe('test.user.bsky.social');
      expect(result.authenticated).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('at_protocol_handle', 'test.user.bsky.social');
    });

    test('should throw error when no identifier provided', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      global.prompt.mockReturnValue('');
      
      await expect(client.authenticate()).rejects.toThrow('No identifier provided');
    });
  });

  describe('getUserLikesCount', () => {
    test('should return cached value if available', async () => {
      const session = { handle: 'test.user' };
      jest.spyOn(client, 'getCache').mockReturnValue(150);
      
      const result = await client.getUserLikesCount(session);
      
      expect(result).toBe(150);
    });

    test('should generate new value when not cached', async () => {
      const session = { handle: 'test.user' };
      localStorageMock.getItem.mockReturnValue(null);
      jest.spyOn(client, 'getCache').mockReturnValue(null);
      jest.spyOn(client, 'simulateLikesCount').mockReturnValue(250);
      
      const result = await client.getUserLikesCount(session);
      
      expect(result).toBe(250);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('likes_count_test.user', '250');
    });

    test('should return default on error', async () => {
      const invalidSession = null;
      
      const result = await client.getUserLikesCount(invalidSession);
      
      expect(result).toBe(100);
    });
  });

  describe('getUserLexicons', () => {
    test('should return cached lexicons if available', async () => {
      const session = { handle: 'test.user' };
      const cachedLexicons = ['social', 'tech'];
      jest.spyOn(client, 'getCache').mockReturnValue(cachedLexicons);
      
      const result = await client.getUserLexicons(session);
      
      expect(result).toEqual(cachedLexicons);
    });

    test('should return default lexicons on error', async () => {
      const invalidSession = null;
      
      const result = await client.getUserLexicons(invalidSession);
      
      expect(result).toEqual(['basic']);
    });
  });

  describe('checkDailyLimit', () => {
    test('should return correct daily limit data', () => {
      const session = { handle: 'test.user' };
      localStorageMock.getItem.mockReturnValue('3');
      
      const result = client.checkDailyLimit(session);
      
      expect(result).toEqual({
        used: 3,
        limit: 10,
        remaining: 7
      });
    });

    test('should handle missing session gracefully', () => {
      const result = client.checkDailyLimit(null);
      
      expect(result).toEqual({
        used: 0,
        limit: 10,
        remaining: 10
      });
    });
  });

  describe('calculateMultiplier', () => {
    test('should calculate multiplier based on lexicon count', () => {
      expect(client.calculateMultiplier(['social'])).toBe(1.2);
      expect(client.calculateMultiplier(['social', 'tech'])).toBe(1.4);
      expect(client.calculateMultiplier(['social', 'tech', 'creative', 'business', 'art'])).toBe(2.0);
    });
  });

  describe('simulateLikesCount', () => {
    test('should return consistent values for same handle', () => {
      const handle = 'test.user.bsky.social';
      const result1 = client.simulateLikesCount(handle);
      const result2 = client.simulateLikesCount(handle);
      
      expect(result1).toBe(result2);
      expect(typeof result1).toBe('number');
      expect(result1).toBeGreaterThanOrEqual(50);
      expect(result1).toBeLessThanOrEqual(1049);
    });
  });

  describe('cache management', () => {
    test('should set and get cache correctly', () => {
      const key = 'test-key';
      const value = { test: 'value' };
      
      client.setCache(key, value);
      const result = client.getCache(key);
      
      expect(result).toEqual(value);
    });

    test('should return null for expired cache', () => {
      const key = 'test-key';
      const value = { test: 'value' };
      
      client.setCache(key, value);
      // Mock expired timestamp
      const cached = client.cache.get(key);
      cached.timestamp = Date.now() - (client.cacheTimeout + 1000);
      
      const result = client.getCache(key);
      
      expect(result).toBeNull();
    });
  });
});
