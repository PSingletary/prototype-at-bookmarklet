# AT Protocol Space Invaders Game Development Plan

## Project Overview

This project develops a JavaScript-based fixed shooter game that integrates with the AT Protocol. The game will be launched via a bookmarklet and uses user data from the AT Protocol to determine game resources. 

### Core Game Mechanics
- **Ammunition System**: Player's total likes given determines available shots, for the day
- **Multiplier System**: Based on lexicon diversity in user's account

### Technical Implementation
**AT Protocol Authentication**: Preferred authentication method:
   - OAuth flow
   - Session-based authentication
   - API key system
   - Browser-based authentication

**Bookmarklet Distribution**: Distribution strategy:
   - Manual installation instructions
   - Browser extension integration
   - Hosted installation page

## Repository Structure

**Simplified Structure for Bookmarklet Game:**

```
/prototype-at-bookmarklet/
├── game.js                    # Complete game implementation (all-in-one)
├── at-protocol.js            # AT Protocol API client
├── bookmarklet.js            # Final minified bookmarklet
├── index.html                # Development/testing page
├── test.html                 # Simple test harness
├── package.json              # Build dependencies only
├── build.js                  # Simple build script to minify and bundle
├── README.md
└── plan.md
```

**Why This Simple Structure?**

For a bookmarklet game, complexity is the enemy. The bookmarklet needs to be:
- **Single file** - Everything bundled into one JavaScript file
- **Self-contained** - No external dependencies or imports  
- **Lightweight** - Under 2MB to load quickly
- **Standalone** - Works on any website without setup

The original complex structure would create unnecessary overhead. A bookmarklet should be:
1. One HTML file for development/testing
2. One large JavaScript file with everything bundled
3. One build script to minify and create the bookmarklet
4. One AT Protocol client (can be bundled into main file)

## Dependencies

### External Dependencies
- **AT Protocol API** - Requires stable API endpoints and authentication
- **Modern Browser** - Canvas API, ES6+ support, localStorage
- **Internet Connection** - For AT Protocol authentication and data fetching

### Development Dependencies  
- **Node.js** - For build tools (optional, can use online minifiers)
- **AT Protocol SDK** - If available, otherwise raw HTTP requests
- **Canvas API** - Native browser support

### Critical Dependencies to Address
1. **AT Protocol Authentication** - Need to clarify which auth method
2. **AT Protocol API Stability** - Version pinning and fallback strategies  
3. **CORS Requirements** - May need proxy for cross-origin requests
4. **Browser Compatibility** - Canvas and localStorage support matrix

## Development Phases

### Phase 1: Core Game (2-3 days)
- Create basic Space Invaders game in `game.js`
- Implement canvas rendering, player, enemies, bullets
- Basic collision detection and scoring

### Phase 2: AT Protocol Integration (2-3 days)  
- Build `at-protocol.js` client for user data
- Integrate likes count for ammunition
- Add lexicon multiplier system

### Phase 3: Bookmarklet Wrapper (1 day)
- Create bookmarklet loader in `bookmarklet.js` 
- Handle overlay display and site isolation
- Add daily limit enforcement

### Phase 4: Testing & Polish (1-2 days)
- Test across different websites and browsers
- Performance optimization and minification
- Basic error handling

## Technical Architecture

### Game Implementation (game.js)
- **Single file** with all game logic
- **Canvas rendering** using 2D context API
- **Simple game loop** with requestAnimationFrame
- **Object-oriented** structure for entities (Player, Enemy, Bullet)

### AT Protocol Integration (at-protocol.js)
- **HTTP fetch** calls to AT Protocol API
- **Simple authentication** flow (OAuth 2.0 or session-based)
- **Basic caching** in localStorage
- **Error handling** for API failures

### Bookmarklet Wrapper (bookmarklet.js)
- **Immediate execution** function to avoid conflicts
- **DOM manipulation** to create game overlay
- **CSS injection** for styling without conflicts
- **Cleanup** when game ends

## Testing Strategy

### Manual Testing
- **Browser compatibility** - Test in Chrome, Firefox, Safari, Edge
- **Website compatibility** - Test on different sites (news sites, social media, etc.)
- **Mobile testing** - Basic responsiveness on phones/tablets
- **Performance testing** - Ensure smooth 60fps gameplay

### Development Testing
- **AT Protocol API** testing with real user accounts
- **Game mechanics** validation manually
- **Bookmarklet functionality** across various websites

## Key Requirements

### Performance Targets
- **< 2MB** total bookmarklet size
- **< 3 seconds** load time
- **60 FPS** gameplay
- **Cross-browser compatibility** for major browsers

### Security Basics
- **No credential storage** in bookmarklet
- **HTTPS-only** API communication  
- **Input sanitization** for user data
- **XSS prevention** in bookmarklet context

## Simple Deployment

1. **Host bookmarklet.js** on a CDN or static hosting
2. **Create simple installation page** with copy-paste instructions
3. **Test across major websites** and browsers
4. **Share via social media** for distribution

This simplified plan focuses on what's actually needed for a functional bookmarklet game rather than over-engineering the architecture.
