/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  testEnvironment: 'node',
  transform: {
    '\\.[jt]sx?$': ['ts-jest', {useESM: true}]
  },
  moduleNameMapper: {
      '(.+)\\.[jt]s': '$1'
  },
  extensionsToTreatAsEsm: ['.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/']
};
