/**
 * AT Protocol API Client
 * Handles authentication and data fetching for the Space Invaders game
 */

class ATProtocolClient {
    constructor() {
        this.baseURL = 'https://bsky.social/xrpc'; // Default AT Protocol endpoint
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Authenticate user with AT Protocol
     */
    async authenticate() {
        // Check if we have cached session
        const cached = this.getCache('user_session');
        if (cached && cached.handle && cached.authenticated) {
            return cached;
        }

        // Simple authentication - in a real implementation, this would be OAuth
        // For now, we'll simulate with localStorage or prompt user
        let identifier = localStorage.getItem('at_protocol_handle');
        
        if (!identifier || identifier.trim() === '') {
            // Only prompt if we don't have a stored value and we're in a browser environment
            if (typeof prompt !== 'undefined') {
                identifier = prompt('Enter your AT Protocol handle (e.g., username.bsky.social):');
            } else {
                identifier = 'test.user.bsky.social'; // Fallback for testing
            }
        }
        
        if (!identifier || identifier.trim() === '') {
            throw new Error('No identifier provided');
        }

        identifier = identifier.trim();

        // Store for future use
        try {
            localStorage.setItem('at_protocol_handle', identifier);
        } catch (storageError) {
            // Could not store handle in localStorage
        }

        const session = {
            handle: identifier,
            authenticated: true,
            timestamp: Date.now()
        };

        this.setCache('user_session', session);
        return session;
    }

    /**
     * Get user's total likes count for ammunition
     */
    async getUserLikesCount(session) {
        try {
            if (!session || !session.handle) {
                throw new Error('Invalid session provided');
            }

            const cacheKey = `likes_count_${session.handle}`;
            const cached = this.getCache(cacheKey);
            if (cached !== null) {
                return cached;
            }

            // In a real implementation, this would fetch from AT Protocol API
            // For now, we'll simulate with localStorage or generate a number
            let likesCount = localStorage.getItem(`likes_count_${session.handle}`);
            
            if (!likesCount) {
                // Simulate API call - generate random number based on handle
                likesCount = this.simulateLikesCount(session.handle);
                localStorage.setItem(`likes_count_${session.handle}`, likesCount.toString());
            } else {
                likesCount = parseInt(likesCount, 10);
                if (isNaN(likesCount)) {
                    likesCount = this.simulateLikesCount(session.handle);
                    localStorage.setItem(`likes_count_${session.handle}`, likesCount.toString());
                }
            }

            this.setCache(cacheKey, likesCount);
            return likesCount;

        } catch (error) {
            // Fallback to default ammunition
            return 100;
        }
    }

    /**
     * Get user's lexicon diversity for multiplier calculation
     */
    async getUserLexicons(session) {
        try {
            const cacheKey = `lexicons_${session.handle}`;
            const cached = this.getCache(cacheKey);
            if (cached) {
                return cached;
            }

            // In a real implementation, this would analyze user's posts
            // For now, we'll simulate with localStorage or generate
            let lexicons = localStorage.getItem(`lexicons_${session.handle}`);
            
            if (!lexicons) {
                // Simulate lexicon analysis
                lexicons = this.simulateLexiconAnalysis(session.handle);
                localStorage.setItem(`lexicons_${session.handle}`, JSON.stringify(lexicons));
            } else {
                lexicons = JSON.parse(lexicons);
            }

            this.setCache(cacheKey, lexicons);
            return lexicons;

        } catch (error) {
            // Fallback to basic lexicon
            return ['basic'];
        }
    }

    /**
     * Check daily usage limits
     */
    checkDailyLimit(session) {
        if (!session || !session.handle) {
            return { used: 0, limit: 10, remaining: 10 };
        }

        const today = new Date().toDateString();
        const key = `daily_usage_${session.handle}_${today}`;
        const usage = parseInt(localStorage.getItem(key) || '0', 10);
        
        // Daily limit of 10 games per day
        return {
            used: isNaN(usage) ? 0 : usage,
            limit: 10,
            remaining: Math.max(0, 10 - (isNaN(usage) ? 0 : usage))
        };
    }

    /**
     * Record game session for daily limit tracking
     */
    recordGameSession(session) {
        if (!session || !session.handle) {
            return;
        }

        try {
            const today = new Date().toDateString();
            const key = `daily_usage_${session.handle}_${today}`;
            const currentUsage = parseInt(localStorage.getItem(key) || '0', 10);
            const newUsage = (isNaN(currentUsage) ? 0 : currentUsage) + 1;
            localStorage.setItem(key, newUsage.toString());
        } catch (error) {
            // Failed to record game session - continue silently
        }
    }

    /**
     * Simulate likes count based on handle
     */
    simulateLikesCount(handle) {
        // Generate a pseudo-random but consistent number based on handle
        let hash = 0;
        for (let i = 0; i < handle.length; i++) {
            hash = ((hash << 5) - hash + handle.charCodeAt(i)) & 0xffffffff;
        }
        return Math.abs(hash) % 1000 + 50; // Between 50-1049 likes
    }

    /**
     * Simulate lexicon analysis based on handle
     */
    simulateLexiconAnalysis(handle) {
        const commonLexicons = [
            'social', 'tech', 'creative', 'business', 'art', 
            'music', 'gaming', 'education', 'health', 'food'
        ];
        
        let hash = 0;
        for (let i = 0; i < handle.length; i++) {
            hash = ((hash << 5) - hash + handle.charCodeAt(i)) & 0xffffffff;
        }
        
        const numLexicons = Math.abs(hash) % 4 + 1; // 1-4 lexicons
        const userLexicons = [];
        
        for (let i = 0; i < numLexicons; i++) {
            const lexiconIndex = Math.abs(hash + i) % commonLexicons.length;
            if (!userLexicons.includes(commonLexicons[lexiconIndex])) {
                userLexicons.push(commonLexicons[lexiconIndex]);
            }
        }
        
        return userLexicons.length > 0 ? userLexicons : ['social'];
    }

    /**
     * Calculate multiplier based on lexicon diversity
     */
    calculateMultiplier(lexicons) {
        const baseMultiplier = 1.0;
        const diversityBonus = Math.min(lexicons.length * 0.2, 1.0); // Max 1.0 bonus for 5+ lexicons
        return baseMultiplier + diversityBonus;
    }

    /**
     * Cache management
     */
    setCache(key, value) {
        this.cache.set(key, {
            value: value,
            timestamp: Date.now()
        });
    }

    getCache(key) {
        const cached = this.cache.get(key);
        if (!cached) {
            return null;
        }
        
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.value;
    }

    /**
     * Clear all cached data
     */
    clearCache() {
        this.cache.clear();
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ATProtocolClient;
} else {
    window.ATProtocolClient = ATProtocolClient;
}
