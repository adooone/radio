import { describe, expect, it } from 'bun:test';
import { testUtils } from './setup';

describe('Wave Backend - Basic Tests', () => {
  it('should have test utilities available', () => {
    expect(testUtils).toBeDefined();
    expect(testUtils.createMockContext).toBeFunction();
    expect(testUtils.wait).toBeFunction();
    expect(testUtils.generateTestTimestamp).toBeFunction();
  });

  it('should generate consistent test timestamps', () => {
    const timestamp = testUtils.generateTestTimestamp();
    expect(timestamp).toBe('2024-01-15T10:30:00.000Z');
  });

  it('should create mock context correctly', () => {
    const mockContext = testUtils.createMockContext('/api/test', 'GET');
    expect(mockContext.req.url).toBe('/api/test');
    expect(mockContext.req.method).toBe('GET');
    expect(mockContext.req.param).toBeFunction();
    expect(mockContext.json).toBeFunction();
  });

  it('should handle async wait utility', async () => {
    const start = Date.now();
    await testUtils.wait(10);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(10);
  });
});
