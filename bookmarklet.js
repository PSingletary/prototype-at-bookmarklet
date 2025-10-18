/**
 * Bookmarklet Wrapper for AT Protocol Space Invaders Game
 * Creates isolated game environment on any website
 */

(function() {
    'use strict';
    
    // Prevent multiple instances
    if (window.spaceInvadersGameLoaded) {
        return;
    }
    window.spaceInvadersGameLoaded = true;

    // Game instance
    let game = null;
    let overlay = null;
    let gameContainer = null;

    // Create isolated game environment
    function createGameEnvironment() {
        // Remove existing game if present
        if (overlay) {
            overlay.remove();
        }

        // Create full-screen overlay
        overlay = document.createElement('div');
        overlay.id = 'space-invaders-overlay';
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.9) !important;
            z-index: 999999 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            font-family: Arial, sans-serif !important;
        `;

        // Create game container
        gameContainer = document.createElement('div');
        gameContainer.style.cssText = `
            background: #222 !important;
            padding: 20px !important;
            border-radius: 10px !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
            position: relative !important;
        `;

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
            position: absolute !important;
            top: 10px !important;
            right: 15px !important;
            background: #ff4444 !important;
            color: white !important;
            border: none !important;
            border-radius: 50% !important;
            width: 30px !important;
            height: 30px !important;
            font-size: 18px !important;
            cursor: pointer !important;
            z-index: 1 !important;
        `;
        closeButton.onclick = destroyGame;

        // Add title
        const title = document.createElement('h2');
        title.textContent = 'AT Protocol Space Invaders';
        title.style.cssText = `
            color: white !important;
            text-align: center !important;
            margin: 0 0 20px 0 !important;
            font-size: 24px !important;
        `;

        // Assemble overlay
        gameContainer.appendChild(closeButton);
        gameContainer.appendChild(title);
        overlay.appendChild(gameContainer);

        // Add to page
        document.body.appendChild(overlay);

        // Prevent page scrolling
        document.body.style.overflow = 'hidden';
    }

    // Load and execute game code
    async function loadGame() {
        try {
            createGameEnvironment();

            // Create and initialize the game
            if (typeof ATProtocolClient !== 'undefined' && typeof SpaceInvadersGame !== 'undefined') {
                // Game classes are available, initialize the game
                game = new SpaceInvadersGame();
                
                // Override the canvas creation to use our container
                const originalCreateCanvas = game.createCanvas;
                game.createCanvas = function() {
                    this.canvas = document.createElement('canvas');
                    this.canvas.width = this.canvasWidth;
                    this.canvas.height = this.canvasHeight;
                    this.canvas.style.border = '2px solid #333';
                    this.canvas.style.backgroundColor = '#000';
                    this.canvas.style.display = 'block';
                    
                    this.ctx = this.canvas.getContext('2d');
                    
                    // Add to our game container instead of document.body
                    gameContainer.appendChild(this.canvas);
                };
                
                await game.init();
            } else {
                // Fallback: show message that this is the development version
                const placeholder = document.createElement('div');
                placeholder.style.cssText = `
                    width: 800px !important;
                    height: 600px !important;
                    background: #000 !important;
                    border: 2px solid #333 !important;
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    color: white !important;
                    font-size: 18px !important;
                `;
                placeholder.innerHTML = `
                    <div style="text-align: center;">
                        <h3>AT Protocol Space Invaders</h3>
                        <p>Development version - loading game classes...</p>
                        <p>Game classes not loaded. This bookmarklet is ready for production build.</p>
                    </div>
                `;
                gameContainer.appendChild(placeholder);
            }

        } catch (error) {
            console.error('Failed to load game:', error);
            showError('Failed to load the game. Please try again.');
        }
    }

    // Show error message
    function showError(message) {
        if (!gameContainer) return;

        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            color: #ff4444 !important;
            text-align: center !important;
            padding: 20px !important;
            font-size: 16px !important;
        `;
        errorDiv.textContent = message;
        gameContainer.appendChild(errorDiv);
    }

    // Destroy game and cleanup
    function destroyGame() {
        if (overlay) {
            overlay.remove();
            overlay = null;
            gameContainer = null;
        }

        if (game) {
            game.destroy();
            game = null;
        }

        // Remove escape key listener
        if (escapeHandler) {
            document.removeEventListener('keydown', escapeHandler);
        }

        // Restore page scrolling
        document.body.style.overflow = '';

        // Reset flag to allow reloading
        window.spaceInvadersGameLoaded = false;
    }

    // Handle escape key to close
    function handleKeyPress(event) {
        if (event.key === 'Escape') {
            destroyGame();
        }
    }

    // Add escape key listener
    document.addEventListener('keydown', handleKeyPress);

    // Store reference for cleanup
    let escapeHandler = handleKeyPress;

    // Prevent conflicts with host page
    function preventConflicts() {
        // Store original functions that might conflict
        const originalAlert = window.alert;
        const originalConsole = window.console;

        // Override global functions temporarily if needed
        // This is handled more gracefully in the actual implementation
    }

    // Initialize
    preventConflicts();
    loadGame();
})();
