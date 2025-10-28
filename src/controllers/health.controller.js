import { HealthService } from '../services/health.service.js';

export class HealthController {
  constructor({ healthService = new HealthService() } = {}) {
    this.healthService = healthService;
    this.status = this.status.bind(this);
  }

  async status(req, res, next) {
    try {
      const result = await this.healthService.check();

      return res.status(200).json({
        success: true,
        message: 'Service is healthy',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
