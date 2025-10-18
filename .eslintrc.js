module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': 'error',
    'curly': 'error',
  },
  globals: {
    // Browser globals
    window: 'readonly',
    document: 'readonly',
    localStorage: 'readonly',
    prompt: 'readonly',
    alert: 'readonly',
    console: 'readonly',
    
    // Game-specific globals
    ATProtocolClient: 'readonly',
    SpaceInvadersGame: 'readonly',
    spaceInvadersGameLoaded: 'writable',
  },
};
