/**
 * Build script for AT Protocol Space Invaders bookmarklet
 * Minifies and bundles the game into a single bookmarklet
 */

const fs = require('fs');
const path = require('path');

// Simple minifier (in production, use terser)
function minifyJS(code) {
    return code
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/\/\/.*$/gm, '') // Remove line comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/;\s*}/g, ';}') // Remove spaces before closing braces
        .replace(/{\s*/g, '{') // Remove spaces after opening braces
        .replace(/\s*}/g, '}') // Remove spaces before closing braces
        .replace(/\s*=\s*/g, '=') // Remove spaces around equals
        .replace(/\s*,\s*/g, ',') // Remove spaces around commas
        .replace(/\s*:\s*/g, ':') // Remove spaces around colons
        .trim();
}

// Create bookmarklet code
function createBookmarklet() {
    try {
        // Read source files
        const atProtocolCode = fs.readFileSync('./at-protocol.js', 'utf8');
        const gameCode = fs.readFileSync('./game.js', 'utf8');
        
        // Read bookmarklet wrapper and extract the main function
        const bookmarkletWrapper = fs.readFileSync('./bookmarklet.js', 'utf8');
        
        // Create the full bookmarklet code
        const fullCode = `
(function() {
    'use strict';
    
    // Prevent multiple instances
    if (window.spaceInvadersGameLoaded) return;
    window.spaceInvadersGameLoaded = true;

    // Inline AT Protocol Client
    ${atProtocolCode}
    
    // Inline Space Invaders Game
    ${gameCode}
    
    // Bookmarklet wrapper code
    ${bookmarkletWrapper.replace(/^\(function\(\)\s*\{[\s\S]*?\}\)\(\);?\s*$/, '')}
    
    // Initialize game
    try {
        createGameEnvironment();
        const game = new SpaceInvadersGame();
        game.init();
    } catch (error) {
        console.error('Game initialization failed:', error);
    }
})();
        `;
        
        // Minify the code
        const minifiedCode = minifyJS(fullCode);
        
        // Create the bookmarklet URL
        const bookmarkletURL = `javascript:${encodeURIComponent(minifiedCode)}`;
        
        // Write the bookmarklet files
        fs.writeFileSync('./bookmarklet.min.js', minifiedCode);
        
        // Create an HTML file with the bookmarklet link
        const bookmarkletHTML = `<!DOCTYPE html>
<html>
<head>
    <title>AT Protocol Space Invaders Bookmarklet</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 50px; text-align: center; }
        .bookmarklet { display: inline-block; padding: 15px 30px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 10px; }
        .bookmarklet:hover { background: #0052a3; }
        .instructions { max-width: 600px; margin: 0 auto; text-align: left; }
    </style>
</head>
<body>
    <h1>AT Protocol Space Invaders</h1>
    <p>Drag the link below to your bookmarks bar to play on any website:</p>
    <a href="${bookmarkletURL}" class="bookmarklet">🚀 Space Invaders</a>
    
    <div class="instructions">
        <h2>How to Install:</h2>
        <ol>
            <li>Drag the "🚀 Space Invaders" link above to your browser's bookmarks bar</li>
            <li>Visit any website</li>
            <li>Click the bookmarklet to launch the game</li>
        </ol>
        
        <h2>Game Features:</h2>
        <ul>
            <li><strong>Ammunition:</strong> Based on your AT Protocol likes count</li>
            <li><strong>Multipliers:</strong> Based on your account's lexicon diversity</li>
            <li><strong>Daily Limits:</strong> 10 games per day to prevent abuse</li>
            <li><strong>Cross-Platform:</strong> Works on any website</li>
        </ul>
        
        <h2>Controls:</h2>
        <ul>
            <li>Arrow keys to move</li>
            <li>Spacebar to shoot</li>
            <li>P to pause</li>
            <li>Escape to exit</li>
        </ul>
    </div>
</body>
</html>`;
        
        fs.writeFileSync('./bookmarklet.html', bookmarkletHTML);
        
        console.log('✅ Bookmarklet built successfully!');
        console.log(`📦 Minified size: ${(minifiedCode.length / 1024).toFixed(2)} KB`);
        console.log('📁 Files created:');
        console.log('   - bookmarklet.min.js (minified code)');
        console.log('   - bookmarklet.html (installation page)');
        
        return {
            code: minifiedCode,
            url: bookmarkletURL,
            size: minifiedCode.length
        };
        
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

// Run the build
if (require.main === module) {
    createBookmarklet();
}

module.exports = { createBookmarklet, minifyJS };
