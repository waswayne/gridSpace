import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
    index: true
  },
  spaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Space",
    required: [true, "Space ID is required"],
    index: true
  },
  startTime: {
    type: Date,
    required: [true, "Start time is required"],
    validate: {
      validator: function(startTime) {
        return startTime > new Date(); // Prevent past bookings
      },
      message: "Start time must be in the future"
    }
  },
  endTime: {
    type: Date,
    required: [true, "End time is required"],
    validate: {
      validator: function(endTime) {
        return endTime > this.startTime;
      },
      message: "End time must be after start time"
    }
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed", "rejected"],
    default: "pending"
  },
  totalAmount: {
    type: Number,
    required: [true, "Total amount is required"],
    min: [500, "Total amount must be at least ₦500"]
  },
  hoursBooked: {
    type: Number,
    required: [true, "Hours booked is required"],
    min: [1, "Minimum booking duration is 1 hour"],
    max: [24, "Maximum booking duration is 24 hours"]
  },
  // Nigerian payment context
  paymentMethod: {
    type: String,
    enum: ["wallet", "transfer", "card"],
    default: "wallet"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },
  hostNotes: {
    type: String,
    trim: true,
    maxlength: [500, "Host notes cannot exceed 500 characters"]
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [500, "Special requests cannot exceed 500 characters"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
bookingSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  
  // Calculate hours booked and total amount
  if (this.isModified("startTime") || this.isModified("endTime")) {
    const hours = Math.ceil((this.endTime - this.startTime) / (1000 * 60 * 60));
    this.hoursBooked = hours;
    
    // Total amount will be calculated in controller with space price
  }
  
  next();
});

// Compound indexes for efficient querying and conflict detection
bookingSchema.index({ spaceId: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ spaceId: 1, status: 1 });
bookingSchema.index({ createdAt: 1 });

// Virtual for checking if booking is active
bookingSchema.virtual("isActive").get(function() {
  return ["pending", "confirmed"].includes(this.status);
});

// Ensure virtual fields are serialized
bookingSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Booking", bookingSchema);