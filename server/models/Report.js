import mongoose from '../libs/mongoose.js';

const reportSchema = new mongoose.Schema({
  space: { type: mongoose.Schema.Types.ObjectId, ref: "Space", required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true, trim: true, maxlength: 500 },
  status: { type: String, enum: ["open", "reviewed", "resolved"], default: "open" },
}, { timestamps: true });

export default mongoose.model("Report", reportSchema);