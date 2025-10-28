import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthService } from '../../src/services/health.service.js';

describe('HealthService', () => {
  let mockConnection;
  let service;

  beforeEach(() => {
    mockConnection = { readyState: 1 };
    service = new HealthService({
      getDb: () => mockConnection,
      config: { version: 'test-version' },
      startTime: Date.now() - 1000,
    });
  });

  it('returns service health summary when check succeeds', async () => {
    const result = await service.check();

    expect(result.status).toBe('ok');
    expect(result.version).toBe('test-version');
    expect(result.services.mongodb.status).toBe('connected');
    expect(result.services.mongodb.readyState).toBe(1);
    expect(typeof result.uptime).toBe('number');
    expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('marks mongodb as disconnected when readyState is 0', async () => {
    mockConnection.readyState = 0;

    const result = await service.check();

    expect(result.services.mongodb.status).toBe('disconnected');
  });
});
