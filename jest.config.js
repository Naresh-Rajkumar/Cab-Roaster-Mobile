/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  collectCoverageFrom: [
    'App.js',
    'index.js',
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!**/__tests__/**',
    '!src/services/mock/**',
    '!src/data/mockData.js',
    '!src/mocks/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/__tests__/fileMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.js'],
};
