module.exports = {
  setupFilesAfterEnv: ['./tests/jest.setup.js'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/backend/**/*.test.js']
}