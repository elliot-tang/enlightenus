module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./tests/jest.setup.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['<rootDir>/tests/frontend/**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@expo/vector-icons/MaterialIcons$': '<rootDir>/tests/__mocks__/@expo/vector-icons/MaterialIcons',
    '^@app/(.*)$': '<rootDir>/$1',
  },
};