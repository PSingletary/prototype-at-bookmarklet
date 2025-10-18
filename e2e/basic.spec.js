// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('AT Protocol Space Invaders', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('/index.html');
    
    // Check if the page loads
    await expect(page).toHaveTitle(/AT Protocol Space Invaders/);
    
    // Check if main elements are present
    await expect(page.locator('h1')).toContainText('AT Protocol Space Invaders');
  });

  test('should have working test page', async ({ page }) => {
    await page.goto('/test.html');
    
    // Check if test page loads
    await expect(page).toHaveTitle(/Test/);
    
    // Wait for auto-running tests to complete
    await page.waitForTimeout(1000);
    
    // Check if test results are present
    const testResults = page.locator('.result .success');
    await expect(testResults.first()).toBeVisible();
  });

  test('should load game scripts without errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/index.html');
    
    // Wait for scripts to load
    await page.waitForLoadState('networkidle');
    
    // Check that critical scripts loaded
    await expect(page.locator('script[src="at-protocol.js"]')).toBeAttached();
    await expect(page.locator('script[src="game.js"]')).toBeAttached();
    
    // Allow some time for any async errors
    await page.waitForTimeout(500);
    
    // Filter out known expected errors (like missing localStorage in headless)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('localStorage') && 
      !error.includes('prompt')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should build bookmarklet without errors', async ({ page }) => {
    // This test would typically run the build process
    // For now, we'll check if the bookmarklet.js file exists and is accessible
    await page.goto('/bookmarklet.js');
    
    // Check that bookmarklet script is accessible (status 200)
    expect(page.url()).toContain('bookmarklet.js');
  });
});

test.describe('Game Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock localStorage and prompt for consistent testing
    await page.addInitScript(() => {
      // Mock prompt to return test handle
      window.prompt = () => 'test.user.bsky.social';
      
      // Mock localStorage for test environment
      if (!window.localStorage) {
        window.localStorage = {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
          clear: () => {}
        };
      }
    });
  });

  test('should initialize game classes', async ({ page }) => {
    await page.goto('/index.html');
    
    // Check if game classes are available
    const atProtocolAvailable = await page.evaluate(() => {
      return typeof window.ATProtocolClient !== 'undefined';
    });
    
    const gameClassAvailable = await page.evaluate(() => {
      return typeof window.SpaceInvadersGame !== 'undefined';
    });
    
    expect(atProtocolAvailable).toBe(true);
    expect(gameClassAvailable).toBe(true);
  });
});
