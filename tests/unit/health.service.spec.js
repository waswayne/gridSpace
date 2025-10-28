import { describe, it, expect } from 'vitest';
import { HealthService } from '../../src/services/health.service.js';
import { NotImplementedError } from '../../src/utils/errors.js';

describe('HealthService', () => {
  it('throws NotImplementedError for check()', async () => {
    const service = new HealthService();
    await expect(service.check()).rejects.toBeInstanceOf(NotImplementedError);
  });
});
