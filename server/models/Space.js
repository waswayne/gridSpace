import mongoose from '../libs/mongoose.js';

const spaceSchema = new mongoose.Schema({
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 2000 },
  address: { type: String, required: true, trim: true },
  coordinates: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], index: "2dsphere", required: true },
  },
  pricePerHour: { type: Number, required: true, min: 0 },
  photos: [{ url: String, public_id: String }],
  amenities: [{ type: String, trim: true }],
  rules: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Space", spaceSchema);