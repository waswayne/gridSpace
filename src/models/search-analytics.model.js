import mongoose from 'mongoose';

const { Schema } = mongoose;

const searchAnalyticsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    sessionId: {
      type: String,
      required: true,
    },
    searchQuery: {
      type: String,
      trim: true,
    },
    filters: {
      location: String,
      priceMin: Number,
      priceMax: Number,
      capacity: Number,
      purposes: [String],
      amenities: [String],
    },
    resultsCount: {
      type: Number,
      required: true,
    },
    zeroResults: {
      type: Boolean,
      required: true,
    },
    userAgent: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

searchAnalyticsSchema.index({ timestamp: -1 });
searchAnalyticsSchema.index({ searchQuery: 1 });
searchAnalyticsSchema.index({ zeroResults: 1 });
searchAnalyticsSchema.index({ 'filters.location': 1 });

export const SearchAnalyticsModel =
  mongoose.models.SearchAnalytics || mongoose.model('SearchAnalytics', searchAnalyticsSchema);
