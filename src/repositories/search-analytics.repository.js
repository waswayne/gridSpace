import { SearchAnalyticsModel } from '../models/search-analytics.model.js';

export class SearchAnalyticsRepository {
  constructor({ searchAnalyticsModel = SearchAnalyticsModel } = {}) {
    this.searchAnalyticsModel = searchAnalyticsModel;
  }

  async createLog(entry) {
    return this.searchAnalyticsModel.create(entry);
  }
}
