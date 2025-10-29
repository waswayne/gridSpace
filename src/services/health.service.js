import { getConfig } from '../config/env.js';
import { getDatabaseConnection } from '../config/db.js';

export class HealthService {
  constructor({ startTime = Date.now(), getDb = () => getDatabaseConnection(), config = null } = {}) {
    this.startTime = startTime;
    this.getDb = getDb;
    this.config = config;
  }

  resolveConfig() {
    if (this.config) {
      return this.config;
    }

    try {
      this.config = getConfig();
    } catch (error) {
      this.config = null;
    }

    return this.config;
  }

  async check() {
    const connection = this.getDb();
    const resolvedConfig = this.resolveConfig();

    const readyState = connection?.readyState ?? 0;
    const status = readyState === 1 ? 'connected' : readyState === 2 ? 'connecting' : 'disconnected';

    return {
      status: 'ok',
      version: resolvedConfig?.version ?? '1.0.0',
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
