# AT Protocol Space Invaders Bookmarklet

A Space Invaders-style game that integrates with the AT Protocol. The game uses your AT Protocol engagement data (likes, lexicons) to determine game mechanics like ammunition and score multipliers.

## Features

- **AT Protocol Integration**: Uses your likes count for ammunition and lexicon diversity for multipliers
- **Bookmarklet Format**: Run on any website by clicking a bookmark
- **Daily Limits**: Prevents abuse with usage tracking
- **Cross-Platform**: Works in all modern browsers

## Quick Start

1. **Development**: Open `index.html` in your browser
2. **Testing**: Use `test.html` to verify functionality
3. **Build**: Run `npm install && npm run build` to create the bookmarklet
4. **Install**: Drag the bookmarklet link to your bookmarks bar

## File Structure

```
├── game.js           # Complete Space Invaders game
├── at-protocol.js    # AT Protocol API client
├── bookmarklet.js    # Bookmarklet wrapper
├── index.html        # Development environment
├── test.html         # Test harness
├── build.js          # Build script
├── package.json      # Dependencies
└── plan.md          # Development plan
```

## Game Mechanics

- **Ammunition**: Total number of likes you've given on AT Protocol
- **Multipliers**: Based on lexicon diversity in your account
- **Daily Limits**: 10 games per day maximum
- **Authentication**: Uses AT Protocol handle for data fetching

## Development

```bash
# Install dependencies
npm install

# Run local server
npm run dev

# Build bookmarklet
npm run build
```

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

Requires modern JavaScript features (ES6+) and Canvas API support.
