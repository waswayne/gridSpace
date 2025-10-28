import { getConfig } from '../config/env.js';
import { getDatabaseConnection } from '../config/db.js';

export class HealthService {
  constructor({ startTime = Date.now(), getDb = () => getDatabaseConnection(), config = getConfig() } = {}) {
    this.startTime = startTime;
    this.getDb = getDb;
    this.config = config;
  }

  async check() {
    const connection = this.getDb();

    const readyState = connection?.readyState ?? 0;
    const status = readyState === 1 ? 'connected' : readyState === 2 ? 'connecting' : 'disconnected';

    return {
      status: 'ok',
      version: this.config?.version ?? '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        mongodb: {
          status,
          readyState,
        },
      },
    };
  }
}
