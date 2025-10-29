import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const { Schema } = mongoose;

const bookingStatuses = ['pending', 'upcoming', 'in_progress', 'completed', 'cancelled'];
const paymentStatuses = ['pending', 'paid', 'refunded', 'failed', 'partially_refunded'];
const cancellationReasons = ['user_request', 'host_request', 'payment_timeout', 'system_error', 'other'];
const bookingTypes = ['hourly', 'daily', 'weekly', 'monthly'];

const BookingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    spaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Space',
      required: [true, 'Space ID is required'],
      index: true,
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [500, 'Base price must be at least ₦500'],
    },
    markupPercentage: {
      type: Number,
      default: 15,
      min: 0,
      max: 100,
    },
    markupAmount: {
      type: Number,
      required: [true, 'Markup amount is required'],
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [500, 'Total amount must be at least ₦500'],
    },
    hostEarnings: {
      type: Number,
      required: [true, 'Host earnings amount is required'],
      min: [500, 'Host earnings must be at least ₦500'],
    },
    bookingType: {
      type: String,
      enum: bookingTypes,
      default: 'hourly',
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      validate: {
        validator(value) {
          return value > new Date();
        },
        message: 'Start time must be in the future',
      },
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      validate: {
        validator(value) {
          return value > this.startTime;
        },
        message: 'End time must be after start time',
      },
    },
    guestCount: {
      type: Number,
      required: true,
      min: [1, 'At least 1 guest is required'],
      max: [100, 'Cannot exceed 100 guests'],
      default: 1,
    },
    status: {
      type: String,
      enum: bookingStatuses,
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: paymentStatuses,
      default: 'pending',
    },
    rescheduleHistory: [
      {
        originalStart: Date,
        originalEnd: Date,
        newStart: Date,
        newEnd: Date,
        rescheduledAt: {
          type: Date,
          default: Date.now,
        },
        rescheduledBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        reason: String,
      },
    ],
    cancellationInfo: {
      cancelledAt: Date,
      cancelledBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      reason: {
        type: String,
        enum: cancellationReasons,
      },
      refundAmount: Number,
      notes: String,
    },
    expiresAt: {
      type: Date,
      required() {
        return this.status === 'pending';
      },
    },
    specialRequests: {
      type: String,
      maxlength: [500, 'Special requests cannot exceed 500 characters'],
      trim: true,
    },
    hostNotes: {
      type: String,
      maxlength: [500, 'Host notes cannot exceed 500 characters'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const UNIT_MS = {
  hourly: 1000 * 60 * 60,
  daily: 1000 * 60 * 60 * 24,
  weekly: 1000 * 60 * 60 * 24 * 7,
  monthly: 1000 * 60 * 60 * 24 * 30,
};

const recalculateDuration = (booking) => {
  if (!booking.startTime || !booking.endTime) {
    return booking.duration ?? 1;
  }

  const unitMs = UNIT_MS[booking.bookingType] ?? UNIT_MS.hourly;
  const diffMs = booking.endTime - booking.startTime;
  return Math.max(1, Math.ceil(diffMs / unitMs));
};

const recalculatePricing = (booking) => {
  const basePrice = booking.basePrice ?? 0;
  const duration = booking.duration ?? 1;
  const markupPercentage = booking.markupPercentage ?? 0;
  const totalBasePrice = basePrice * duration;
  const markupAmount = Math.round(totalBasePrice * (markupPercentage / 100));

  booking.markupAmount = markupAmount;
  booking.totalAmount = totalBasePrice + markupAmount;
  booking.hostEarnings = totalBasePrice;
};

BookingSchema.pre('validate', function handlePreValidate(next) {
  if (this.isModified('startTime') || this.isModified('endTime') || this.isModified('bookingType')) {
    this.duration = recalculateDuration(this);
  }

  recalculatePricing(this);

  if (this.status === 'pending' && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  }

  next();
});

BookingSchema.plugin(mongoosePaginate);

BookingSchema.index({ spaceId: 1, startTime: 1, endTime: 1 });
BookingSchema.index({ userId: 1, status: 1 });
BookingSchema.index({ spaceId: 1, status: 1 });
BookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
BookingSchema.index({ status: 1, paymentStatus: 1 });
BookingSchema.index({ 'cancellationInfo.cancelledAt': 1 });

BookingSchema.virtual('isUpcoming').get(function computeIsUpcoming() {
  return ['pending', 'upcoming'].includes(this.status) && this.startTime > new Date();
});

BookingSchema.virtual('canReschedule').get(function computeCanReschedule() {
  const hoursUntilStart = (this.startTime - new Date()) / (1000 * 60 * 60);
  return ['pending', 'upcoming'].includes(this.status) && hoursUntilStart > 2;
});

BookingSchema.virtual('canCancel').get(function computeCanCancel() {
  const hoursUntilStart = (this.startTime - new Date()) / (1000 * 60 * 60);
  return ['pending', 'upcoming'].includes(this.status) && hoursUntilStart > 2;
});

BookingSchema.virtual('formattedDate').get(function computeFormattedDate() {
  return this.startTime.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

BookingSchema.virtual('formattedTime').get(function computeFormattedTime() {
  return `${this.startTime.toLocaleTimeString()} to ${this.endTime.toLocaleTimeString()}`;
});

BookingSchema.set('toJSON', { virtuals: true });

export const BookingModel =
  mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
