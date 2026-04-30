module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?))',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/index.ts'],
};
