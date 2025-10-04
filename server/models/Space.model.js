import mongoose from "mongoose";

const spaceSchema = new mongoose.Schema({
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Host ID is required"],
    index: true
  },
  title: {
    type: String,
    required: [true, "Space title is required"],
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"]
  },
  description: {
    type: String,
    required: [true, "Space description is required"],
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"]
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true,
    // Nigerian cities context: Lagos, Abuja, Port Harcourt, Ibadan, etc.
  },
  address: {
    type: String,
    trim: true,
    // Specific address for Nigerian locations
  },
  pricePerHour: {
    type: Number,
    required: [true, "Price per hour is required"],
    min: [500, "Minimum price per hour is ₦500"], // Nigerian Naira context
    max: [50000, "Maximum price per hour is ₦50,000"] // Reasonable upper limit
  },
  images: [{
    type: String, // Cloudinary URLs
    validate: {
      validator: function(images) {
        return images.length <= 10; // Maximum 10 images per space
      },
      message: "Cannot upload more than 10 images"
    }
  }],
  amenities: [{
    type: String,
    enum: [
      "WiFi", "Projector", "Whiteboard", "Air Conditioning", 
      "Power Backup", "Parking", "Coffee/Tea", "Printer/Scanner",
      "Conference Phone", "Monitor", "Kitchen", "Restroom"
      // Nigerian context: Power backup is crucial
    ]
  }],
  purposes: [{
    type: String,
    enum: [
      "Remote Work", "Study Session", "Team Meetings", 
      "Networking", "Presentations", "Creative Work",
      "Interview", "Training", "Client Meeting"
    ]
  }],
  capacity: {
    type: Number,
    required: [true, "Capacity is required"],
    min: [1, "Capacity must be at least 1 person"],
    max: [100, "Capacity cannot exceed 100 people"]
  },
  isActive: {
    type: Boolean,
    default: true
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
spaceSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound indexes for efficient querying
spaceSchema.index({ hostId: 1, isActive: 1 });
spaceSchema.index({ location: 1, isActive: 1 });
spaceSchema.index({ pricePerHour: 1, isActive: 1 });
spaceSchema.index({ purposes: 1, isActive: 1 });

export default mongoose.model("Space", spaceSchema);