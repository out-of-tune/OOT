/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '\\.[jt]sx?$': 'ts-jest'
  },
  globals: {
      'ts-jest': {
          useESM: true
      }
  },
  moduleNameMapper: {
      '(.+)\\.js': '$1'
  },
  extensionsToTreatAsEsm: ['.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/']
};
