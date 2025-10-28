import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const { Schema } = mongoose;

const amenitiesEnum = [
  'WiFi',
  'Projector',
  'Whiteboard',
  'Air Conditioning',
  'Power Backup',
  'Parking',
  'Coffee/Tea',
  'Printer/Scanner',
  'Conference Phone',
  'Monitor',
  'Kitchen',
  'Restroom',
];

const purposesEnum = [
  'Remote Work',
  'Study Session',
  'Team Meetings',
  'Networking',
  'Presentations',
  'Creative Work',
  'Interview',
  'Training',
  'Client Meeting',
];

const timeSlotDays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const WorkspaceSchema = new Schema(
  {
    hostId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Host ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Space title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Space description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Price per hour is required'],
      min: [500, 'Minimum price per hour is ₦500'],
      max: [50000, 'Maximum price per hour is ₦50,000'],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => !value || value.length <= 5,
        message: 'Cannot upload more than 5 images',
      },
    },
    amenities: [
      {
        type: String,
        enum: amenitiesEnum,
      },
    ],
    purposes: [
      {
        type: String,
        enum: purposesEnum,
      },
    ],
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1 person'],
      max: [100, 'Capacity cannot exceed 100 people'],
    },
    timeSlots: [
      {
        day: {
          type: String,
          required: true,
          enum: timeSlotDays,
        },
        startTime: {
          type: String,
          required: true,
          match: [/^([01]\d|2[0-3]):([0-5]\d)$/u, 'Start time must be in HH:MM format'],
        },
        endTime: {
          type: String,
          required: true,
          match: [/^([01]\d|2[0-3]):([0-5]\d)$/u, 'End time must be in HH:MM format'],
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

WorkspaceSchema.pre('save', function preSave(next) {
  this.updatedAt = Date.now();
  next();
});

WorkspaceSchema.plugin(mongoosePaginate);

WorkspaceSchema.index({ hostId: 1, isActive: 1 });
WorkspaceSchema.index({ location: 1, isActive: 1 });
WorkspaceSchema.index({ pricePerHour: 1, isActive: 1 });
WorkspaceSchema.index({ purposes: 1, isActive: 1 });

export const WorkspaceModel =
  mongoose.models.Space || mongoose.model('Space', WorkspaceSchema);
