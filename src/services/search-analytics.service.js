import { logger } from '../config/logger.js';

export class SearchAnalyticsService {
  constructor({ searchAnalyticsRepository } = {}) {
    if (!searchAnalyticsRepository) {
      throw new Error('SearchAnalyticsService requires a searchAnalyticsRepository');
    }

    this.searchAnalyticsRepository = searchAnalyticsRepository;
  }

  async logSearch(entry) {
    try {
      await this.searchAnalyticsRepository.createLog(entry);
    } catch (error) {
      logger.error('Failed to log search analytics', {
        error: error.message,
      });
    }
  }
}
