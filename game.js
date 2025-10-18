/**
 * Space Invaders Game Implementation
 * Integrates with AT Protocol for ammunition and multipliers
 */

class SpaceInvadersGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'loading'; // loading, menu, playing, paused, gameover
        this.score = 0;
        this.ammunition = 100;
        this.multiplier = 1.0;
        this.lives = 3;
        this.level = 1;
        
        // Game entities
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        
        // Game settings
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        this.gameSpeed = 1;
        this.lastTime = 0;
        
        // Input handling
        this.keys = {};
        
        // AT Protocol client
        this.atClient = new ATProtocolClient();
        this.userSession = null;
    }

    /**
     * Initialize the game
     */
    async init() {
        try {
            // Authenticate with AT Protocol
            this.userSession = await this.atClient.authenticate();
            
            // Get user data for game mechanics
            const likesCount = await this.atClient.getUserLikesCount(this.userSession);
            const lexicons = await this.atClient.getUserLexicons(this.userSession);
            
            // Set ammunition based on likes count
            this.ammunition = Math.min(likesCount, 1000); // Cap at 1000
            
            // Calculate multiplier based on lexicon diversity
            this.multiplier = this.atClient.calculateMultiplier(lexicons);
            
            // Check daily limits
            const dailyLimit = this.atClient.checkDailyLimit(this.userSession);
            if (dailyLimit.remaining <= 0) {
                this.showMessage('Daily limit reached. Come back tomorrow!', 'error');
                return;
            }
            
            // Create game canvas
            this.createCanvas();
            
            // Initialize game entities
            this.initPlayer();
            this.initEnemies();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Start game loop
            this.gameState = 'menu';
            this.gameLoop();
            
        } catch (error) {
            console.error('Game initialization failed:', error);
            this.showMessage('Failed to load game. Please refresh and try again.', 'error');
        }
    }

    /**
     * Create the game canvas
     */
    createCanvas() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.canvas.style.border = '2px solid #333';
        this.canvas.style.backgroundColor = '#000';
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '20px auto';
        
        this.ctx = this.canvas.getContext('2d');
        
        // Add to page (will be handled by bookmarklet wrapper)
        document.body.appendChild(this.canvas);
    }

    /**
     * Initialize player
     */
    initPlayer() {
        this.player = {
            x: this.canvasWidth / 2 - 25,
            y: this.canvasHeight - 50,
            width: 50,
            height: 30,
            speed: 5,
            color: '#00ff00'
        };
    }

    /**
     * Initialize enemy formations
     */
    initEnemies() {
        this.enemies = [];
        const enemyRows = 5;
        const enemyCols = 10;
        const spacing = 60;
        
        for (let row = 0; row < enemyRows; row++) {
            for (let col = 0; col < enemyCols; col++) {
                this.enemies.push({
                    x: 100 + col * spacing,
                    y: 80 + row * 40,
                    width: 30,
                    height: 20,
                    speed: 1,
                    color: row < 2 ? '#ff0000' : row < 4 ? '#ff8800' : '#ffff00',
                    direction: 1
                });
            }
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Store references for proper cleanup
        this.handleKeyDown = (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                this.shoot();
            }
            if (e.code === 'KeyP') {
                this.togglePause();
            }
            if (e.code === 'Enter' && this.gameState === 'menu') {
                this.startGame();
            }
        };

        this.handleKeyUp = (e) => {
            this.keys[e.code] = false;
        };

        // Add event listeners
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    /**
     * Main game loop
     */
    gameLoop(currentTime = 0) {
        if (this.gameState === 'playing' || this.gameState === 'menu' || this.gameState === 'paused' || this.gameState === 'gameover') {
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            this.update(deltaTime);
            this.render();
        }
        
        if (this.gameState !== 'loading') {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    /**
     * Update game state
     */
    update(deltaTime) {
        // Only update game logic when playing
        if (this.gameState === 'playing') {
            // Update player
            this.updatePlayer();
            
            // Update enemies
            this.updateEnemies();
            
            // Update bullets
            this.updateBullets();
            
            // Check collisions
            this.checkCollisions();
            
            // Check win/lose conditions
            this.checkGameConditions();
        }
    }

    /**
     * Update player position
     */
    updatePlayer() {
        if (this.player) {
            if (this.keys['ArrowLeft'] && this.player.x > 0) {
                this.player.x -= this.player.speed;
            }
            if (this.keys['ArrowRight'] && this.player.x < this.canvasWidth - this.player.width) {
                this.player.x += this.player.speed;
            }
        }
    }

    /**
     * Update enemy movement
     */
    updateEnemies() {
        let changeDirection = false;
        
        // Check if any enemy hits the edge
        for (let enemy of this.enemies) {
            if (enemy.x <= 0 || enemy.x >= this.canvasWidth - enemy.width) {
                changeDirection = true;
                break;
            }
        }
        
        // Move enemies
        for (let enemy of this.enemies) {
            if (changeDirection) {
                enemy.direction *= -1;
                enemy.y += 20;
            }
            enemy.x += enemy.speed * enemy.direction * this.gameSpeed;
            
            // Random shooting
            if (Math.random() < 0.001) {
                this.enemyShoot(enemy);
            }
        }
    }

    /**
     * Update bullet positions
     */
    updateBullets() {
        // Update player bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > 0;
        });
        
        // Update enemy bullets
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.y += bullet.speed;
            return bullet.y < this.canvasHeight;
        });
    }

    /**
     * Player shoot
     */
    shoot() {
        if (this.gameState === 'playing' && this.ammunition > 0) {
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - 2,
                y: this.player.y,
                width: 4,
                height: 10,
                speed: 7,
                color: '#00ff00'
            });
            this.ammunition--;
        }
    }

    /**
     * Enemy shoot
     */
    enemyShoot(enemy) {
        this.enemyBullets.push({
            x: enemy.x + enemy.width / 2 - 2,
            y: enemy.y + enemy.height,
            width: 4,
            height: 10,
            speed: 3,
            color: '#ff0000'
        });
    }

    /**
     * Check for collisions
     */
    checkCollisions() {
        // Check bullet-enemy collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (this.checkRectCollision(this.bullets[i], this.enemies[j])) {
                    // Hit enemy
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    
                    // Add score with multiplier
                    this.score += Math.floor(100 * this.multiplier);
                    break;
                }
            }
        }
        
        // Check enemy bullet-player collisions
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            if (this.checkRectCollision(this.enemyBullets[i], this.player)) {
                this.enemyBullets.splice(i, 1);
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver();
                }
                break;
            }
        }
        
        // Check enemy-player collisions
        for (let enemy of this.enemies) {
            if (this.checkRectCollision(enemy, this.player)) {
                this.gameOver();
                break;
            }
        }
    }

    /**
     * Check rectangular collision
     */
    checkRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    /**
     * Check win/lose conditions
     */
    checkGameConditions() {
        // Check win condition
        if (this.enemies.length === 0) {
            this.level++;
            this.gameSpeed += 0.1;
            this.initEnemies();
            this.showMessage(`Level ${this.level}!`, 'success');
        }
        
        // Check lose condition (enemies reach bottom)
        for (let enemy of this.enemies) {
            if (enemy.y >= this.canvasHeight - 100) {
                this.gameOver();
                break;
            }
        }
    }

    /**
     * Render the game
     */
    render() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Render player
        this.renderPlayer();
        
        // Render enemies
        this.renderEnemies();
        
        // Render bullets
        this.renderBullets();
        
        // Render UI
        this.renderUI();
        
        // Render game state specific elements
        if (this.gameState === 'menu') {
            this.renderMenu();
        } else if (this.gameState === 'gameover') {
            this.renderGameOver();
        } else if (this.gameState === 'paused') {
            this.renderPaused();
        }
    }

    /**
     * Render player
     */
    renderPlayer() {
        if (this.player && this.ctx) {
            this.ctx.fillStyle = this.player.color;
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        }
    }

    /**
     * Render enemies
     */
    renderEnemies() {
        for (let enemy of this.enemies) {
            this.ctx.fillStyle = enemy.color;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
    }

    /**
     * Render bullets
     */
    renderBullets() {
        // Player bullets
        for (let bullet of this.bullets) {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // Enemy bullets
        for (let bullet of this.enemyBullets) {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
    }

    /**
     * Render UI elements
     */
    renderUI() {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Arial';
        
        // Score
        this.ctx.fillText(`Score: ${this.score}`, 10, 25);
        
        // Ammunition
        this.ctx.fillText(`Ammo: ${this.ammunition}`, 10, 50);
        
        // Lives
        this.ctx.fillText(`Lives: ${this.lives}`, 10, 75);
        
        // Level
        this.ctx.fillText(`Level: ${this.level}`, 10, 100);
        
        // Multiplier
        this.ctx.fillText(`Multiplier: ${this.multiplier.toFixed(1)}x`, 10, 125);
        
        // Controls
        this.ctx.font = '12px Arial';
        this.ctx.fillText('Controls: Arrow keys to move, Space to shoot, P to pause', 10, this.canvasHeight - 10);
    }

    /**
     * Render menu
     */
    renderMenu() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Menu text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('AT Protocol Space Invaders', this.canvasWidth / 2, 200);
        
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`Ammunition: ${this.ammunition}`, this.canvasWidth / 2, 250);
        this.ctx.fillText(`Multiplier: ${this.multiplier.toFixed(1)}x`, this.canvasWidth / 2, 280);
        
        this.ctx.fillText('Press ENTER to start', this.canvasWidth / 2, 350);
        this.ctx.textAlign = 'left';
    }

    /**
     * Render paused screen
     */
    renderPaused() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Paused text
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvasWidth / 2, 250);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Press P to resume', this.canvasWidth / 2, 300);
        this.ctx.textAlign = 'left';
    }

    /**
     * Render game over screen
     */
    renderGameOver() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Game over text
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = '36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvasWidth / 2, 250);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvasWidth / 2, 300);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Refresh to play again', this.canvasWidth / 2, 350);
        this.ctx.textAlign = 'left';
    }

    /**
     * Start the game
     */
    startGame() {
        if (this.gameState === 'menu') {
            this.gameState = 'playing';
            this.atClient.recordGameSession(this.userSession);
        }
    }

    /**
     * Toggle pause
     */
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
        }
    }

    /**
     * Game over
     */
    gameOver() {
        this.gameState = 'gameover';
    }

    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        // Simple alert for now - could be enhanced with better UI
        alert(message);
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        // Remove event listeners properly
        if (this.handleKeyDown) {
            document.removeEventListener('keydown', this.handleKeyDown);
        }
        if (this.handleKeyUp) {
            document.removeEventListener('keyup', this.handleKeyUp);
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpaceInvadersGame;
} else if (typeof window !== 'undefined') {
    window.SpaceInvadersGame = SpaceInvadersGame;
    
    // Auto-start if this file is loaded directly (not via bookmarklet)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.querySelector('canvas') === null) {
                const game = new SpaceInvadersGame();
                game.init();
            }
        });
    }
}
