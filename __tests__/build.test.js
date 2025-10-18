/**
 * Tests for Build Script
 */

const fs = require('fs');
const path = require('path');
const { createBookmarklet, minifyJS } = require('../build.js');

// Mock fs operations
jest.mock('fs');

describe('Build Script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('minifyJS', () => {
    test('should remove comments', () => {
      const code = `
        // This is a comment
        var x = 1;
        /* This is a block comment */
        var y = 2;
      `;
      
      const result = minifyJS(code);
      
      expect(result).not.toContain('// This is a comment');
      expect(result).not.toContain('/* This is a block comment */');
      expect(result).toContain('var x=1');
      expect(result).toContain('var y=2');
    });

    test('should compress whitespace', () => {
      const code = `
        var   x    =    1;
        var    y   =    2;
      `;
      
      const result = minifyJS(code);
      
      expect(result).toMatch(/var x=1/);
      expect(result).toMatch(/var y=2/);
    });

    test('should handle empty input', () => {
      expect(minifyJS('')).toBe('');
      expect(minifyJS('   ')).toBe('');
    });
  });

  describe('createBookmarklet', () => {
    const mockFileContent = {
      'at-protocol.js': 'class ATProtocolClient {}',
      'game.js': 'class SpaceInvadersGame {}',
      'bookmarklet.js': '(function() { /* bookmarklet code */ })();'
    };

    beforeEach(() => {
      fs.readFileSync.mockImplementation((filePath) => {
        const fileName = path.basename(filePath);
        return mockFileContent[fileName] || '';
      });
      
      fs.writeFileSync.mockImplementation(() => {});
    });

    test('should read required source files', () => {
      createBookmarklet();

      expect(fs.readFileSync).toHaveBeenCalledWith('./at-protocol.js', 'utf8');
      expect(fs.readFileSync).toHaveBeenCalledWith('./game.js', 'utf8');
      expect(fs.readFileSync).toHaveBeenCalledWith('./bookmarklet.js', 'utf8');
    });

    test('should create bookmarklet files', () => {
      createBookmarklet();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        './bookmarklet.min.js',
        expect.any(String)
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        './bookmarklet.html',
        expect.stringContaining('Space Invaders')
      );
    });

    test('should handle file read errors', () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      expect(() => {
        try {
          createBookmarklet();
        } catch (error) {
          throw error;
        }
      }).toThrow();
    });

    test('should return build information', () => {
      const result = createBookmarklet();

      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('size');
      expect(typeof result.size).toBe('number');
      expect(result.url).toMatch(/^javascript:/);
    });
  });
});
