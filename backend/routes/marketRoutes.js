const express = require("express");
const { addMarketData, getMarketData, getMarketById, updateMarketData, deleteMarketData, seedMarketData, addRating } = require("../controllers/marketController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Admin routes
router.post("/", auth("admin"), addMarketData);
router.post("/seed", auth("admin"), seedMarketData);

// Public routes
router.get("/", getMarketData);
router.get("/:id", getMarketById);

// Admin management
router.put("/:id", auth("admin"), updateMarketData);
router.delete("/:id", auth("admin"), deleteMarketData);

// Rating route (for farmers)
router.post("/:id/rate", auth("farmer"), addRating);

module.exports = router;
