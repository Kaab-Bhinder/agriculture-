const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // If the provided MONGO_URI doesn't include a database name, append one
    // so Mongoose doesn't default to the `test` database.
    const defaultDb = process.env.MONGO_DB_NAME || "agridb"; // changeable via env
    let uri = process.env.MONGO_URI || `mongodb://localhost:27017`;

    // Detect if a DB name is already present in the URI. This regex looks for
    // a slash followed by non-slash/non-? characters before an optional query.
    const hasDbName = /\/[^\/\?]+(\?|$)/.test(uri);
    if (!hasDbName) {
      // Ensure there's no trailing slash
      uri = uri.replace(/\/*$/, "") + "/" + defaultDb;
    }

    // Connect
    await mongoose.connect(uri);
    console.log(`✅ MongoDB connected (db: ${defaultDb})`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
