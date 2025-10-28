import { HealthService } from '../services/health.service.js';
import { NotImplementedError } from '../utils/errors.js';

export class HealthController {
  constructor({ healthService = new HealthService() } = {}) {
    this.healthService = healthService;
    this.status = this.status.bind(this);
  }

  async status(req, res, next) {
    try {
      throw new NotImplementedError('HealthController.status is not implemented yet.');
    } catch (error) {
      return next(error);
    }
  }
}
