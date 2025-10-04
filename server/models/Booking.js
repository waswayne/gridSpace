import mongoose from '../libs/mongoose.js';

const bookingSchema = new mongoose.Schema({
  space: { type: mongoose.Schema.Types.ObjectId, ref: "Space", required: true },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
}, { timestamps: true });

bookingSchema.index({ space: 1, startTime: 1, endTime: 1 }, { unique: false });

export default mongoose.model("Booking", bookingSchema);