module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['**/tests/**/*.test.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: ['src/**/*.js', '!src/index.js', '!src/db.js'],
  coverageDirectory: 'coverage',
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleFileExtensions: ['js'],
  testPathIgnorePatterns: ['/node_modules/'],
  globals: {
    'babel-jest': {
      useESModules: true,
    },
  },
};
