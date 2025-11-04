const mongoose = require("mongoose");

const marketDataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  region: { type: String, required: true },
  category: {
    type: String,
    enum: ["Fruit", "Vegetable", "Grain", "Spice"],
    required: true
  },
  unit: { type: String, default: "kg" },
  prices: { type: [Number], required: true },

  // ⭐ Ratings
  // Ratings with optional per-user tracking
  averageRating: { type: Number, default: 0 }, // e.g. 4.3
  ratingCount: { type: Number, default: 0 },   // total number of ratings
  ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now }
    }
  ],

  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MarketData", marketDataSchema);