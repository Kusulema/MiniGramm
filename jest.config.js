/** @type {import('ts-jest').JestConfigWithTsJest}
 */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^(\.{1,2}/.*)\.js$': '$1',
  },
  transform: {
    '^.+\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  testMatch: [
    "**/test/**/*.test.ts",
    "**/test/**/*.test.js"
  ],
  // For frontend files, we might need a setup file to mock DOM elements if necessary.
  // setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};