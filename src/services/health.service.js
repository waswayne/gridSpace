import { NotImplementedError } from '../utils/errors.js';

export class HealthService {
  async check() {
    throw new NotImplementedError('HealthService.check is not implemented yet.');
  }
}
