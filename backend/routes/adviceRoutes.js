const express = require("express");
const router = express.Router();
const MarketData = require("../models/MarketData");
const auth = require("../middleware/authMiddleware");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.AI_KEY);

// Simple English → Urdu dictionary
const translations = {
  "Price Surge Opportunity": "قیمت میں اضافے کا موقع",
  "Winter Crop Planning": "سردیوں کی فصل کی منصوبہ بندی",
  "Crop Rotation Reminder": "فصلوں کی گردش کی یاد دہانی",
  "AI-Powered Insights": "مصنوعی ذہانت پر مبنی مشورہ",
  "Start preparing for winter crops. Consider planting leafy greens and root vegetables.":
    "سردیوں کی فصلوں کی تیاری شروع کریں۔ پتوں والی سبزیاں اور جڑ والی فصلیں لگانے پر غور کریں۔",
  "Remember to rotate crops to maintain soil health and prevent pest buildup.":
    "مٹی کی صحت برقرار رکھنے اور کیڑوں کے پھیلاؤ کو روکنے کے لیے فصلوں کی گردش یاد رکھیں۔",
  "AI model unavailable — using logic-based insights only.":
    "AI ماڈل دستیاب نہیں — صرف منطقی بصیرت استعمال کی جا رہی ہے۔",
  "✅ Smart farming advice generated successfully":
    "✅ سمارٹ زراعت کا مشورہ کامیابی سے تیار کر لیا گیا ہے",
  "Failed to generate advice": "مشورہ تیار کرنے میں ناکامی ہوئی"
};

// Helper to translate advice into Urdu
const translateAdvice = (adviceList) => {
  return adviceList.map((item) => ({
    title: translations[item.title] || item.title,
    level: item.level,
    description: translations[item.description] || item.description
  }));
};

router.get("/smart-advice", auth("farmer"), async (req, res) => {
  try {
    // Determine requested language: query param ?lang=ur takes precedence,
    // otherwise honor Accept-Language header (e.g. 'ur' or 'ur-PK'), default to 'en'.
    let lang = req.query.lang || 'en'; // ?lang=ur for Urdu
    if (!req.query.lang && req.headers['accept-language']) {
      const al = req.headers['accept-language'].toLowerCase();
      if (al.startsWith('ur')) lang = 'ur';
    }

    const marketData = await MarketData.find();

    const adviceList = [];

    // Example 1: Detect price surge
    const surgeItems = marketData.filter(item => {
      const prices = item.prices;
      const change = prices[prices.length - 1] - prices[0];
      return change >= 50;
    });
    if (surgeItems.length > 0) {
      adviceList.push({
        title: "Price Surge Opportunity",
        level: "high",
        description: `${surgeItems[0].name} prices are rising (+Rs. ${surgeItems[0].prices[6] - surgeItems[0].prices[0]}). Consider selling soon.`,
      });
    }

    // Example 2
    adviceList.push({
      title: "Winter Crop Planning",
      level: "low",
      description: "Start preparing for winter crops. Consider planting leafy greens and root vegetables.",
    });

    // Example 3
    adviceList.push({
      title: "Crop Rotation Reminder",
      level: "low",
      description: "Remember to rotate crops to maintain soil health and prevent pest buildup.",
    });

    // Optional: AI-generated
    let aiAdvice = "";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const prompt = `
        Based on current market trends in Pakistan:
        ${marketData
          .slice(0, 4)
          .map(
            (item) =>
              `${item.name} in ${item.region} is priced between ${item.prices[0]}–${item.prices[6]} Rs/kg`
          )
          .join(", ")}.
        Suggest 1-2 sentences of helpful farming advice in ${lang === "ur" ? "Urdu" : "English"}.
      `;
      const result = await model.generateContent(prompt);
      aiAdvice = result.response.text();
    } catch (err) {
      aiAdvice = translations["AI model unavailable — using logic-based insights only."];
    }

    adviceList.push({
      title: "AI-Powered Insights",
      level: "medium",
      description: aiAdvice,
    });

    // Translate if Urdu requested
    const finalAdvice = lang === "ur" ? translateAdvice(adviceList) : adviceList;

    res.json({
      message:
        lang === "ur"
          ? translations["✅ Smart farming advice generated successfully"]
          : "✅ Smart farming advice generated successfully",
      advice: finalAdvice,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to generate advice",
      error: err.message,
    });
  }
});

module.exports = router;