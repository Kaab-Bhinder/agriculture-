const MarketData = require("../models/MarketData");

// Admin adds new item
exports.addMarketData = async (req, res) => {
  try {
    const { name, region, category, unit, prices } = req.body;
    const data = await MarketData.create({ name, region, category, unit, prices });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all market data
exports.getMarketData = async (req, res) => {
  try {
    const data = await MarketData.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single market item by id
exports.getMarketById = async (req, res) => {
  try {
    const item = await MarketData.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Market item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update existing data (admin)
exports.updateMarketData = async (req, res) => {
  try {
    const updated = await MarketData.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete data (admin)
exports.deleteMarketData = async (req, res) => {
  try {
    await MarketData.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Seed sample market data (admin)
exports.seedMarketData = async (req, res) => {
  try {
    const sample = req.body.items || [
      {
        name: "Tomato",
        region: "Lahore",
        category: "Vegetable",
        unit: "kg",
        prices: [60, 62, 65, 64, 66, 68, 70]
      },
      {
        name: "Wheat",
        region: "Multan",
        category: "Grain",
        unit: "kg",
        prices: [120, 118, 122, 121, 123, 125, 124]
      },
      {
        name: "Mango",
        region: "Hyderabad",
        category: "Fruit",
        unit: "dozen",
        prices: [200, 210, 220, 215, 230, 225, 235]
      },
      {
        name: "Turmeric",
        region: "Karachi",
        category: "Spice",
        unit: "kg",
        prices: [450, 455, 460, 470, 465, 480, 490]
      }
    ];

    // Insert while avoiding exact duplicates (name + region)
    const created = [];
    for (const item of sample) {
      const exists = await MarketData.findOne({ name: item.name, region: item.region });
      if (!exists) {
        const doc = await MarketData.create(item);
        created.push(doc);
      }
    }

    res.status(201).json({ createdCount: created.length, created });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add or update a user's rating for an item (farmer)
exports.addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user?.id; // From auth middleware

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const item = await MarketData.findById(id);
    if (!item) return res.status(404).json({ message: 'Market data not found' });

    // ensure ratings array exists
    item.ratings = item.ratings || [];

    // If user already rated, update it
    const existing = item.ratings.find(r => r.userId?.toString() === userId?.toString());
    if (existing) {
      const old = existing.rating;
      existing.rating = rating;
      // recalc average
      const total = (item.averageRating || 0) * (item.ratingCount || 0);
      item.averageRating = parseFloat(((total - old + rating) / item.ratingCount).toFixed(2));
      await item.save();
      return res.json({ message: 'Rating updated', averageRating: item.averageRating, ratingCount: item.ratingCount });
    }

    // add new
    item.ratings.push({ userId, rating });
    const total = (item.averageRating || 0) * (item.ratingCount || 0);
    item.ratingCount = (item.ratingCount || 0) + 1;
    item.averageRating = parseFloat(((total + rating) / item.ratingCount).toFixed(2));
    await item.save();

    res.json({ message: 'Rating added', averageRating: item.averageRating, ratingCount: item.ratingCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
