import mongoose from 'mongoose';

const { Schema } = mongoose;

const WorkspaceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    capacity: {
      type: Number,
      min: 0,
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    location: {
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      country: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

export const WorkspaceModel = mongoose.models.Workspace || mongoose.model('Workspace', WorkspaceSchema);
