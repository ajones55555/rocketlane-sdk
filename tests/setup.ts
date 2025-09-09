// Jest setup file for testing
// This file is run once before all test files

// Mock environment variables for testing
process.env.ROCKETLANE_API_KEY = 'test-api-key';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};