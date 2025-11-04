const express = require("express");
const dotenv = require("dotenv");
const path = require('path');

// If server.js is started from the repository root (e.g. `node backend/server.js`),
// change the current working directory to this file's directory so that
// relative requires (and node module resolution) use backend/node_modules.
// This ensures optional dependencies installed in `backend/node_modules` are
// resolvable even when the process was started from the repo root.
try {
	process.chdir(__dirname);
	console.log('Changed working directory to', process.cwd());
} catch (err) {
	console.warn('Failed to change cwd to server directory:', err && err.message);
}
const cors = require("cors");
const connectDB = require("./config/db");
const adviceRoutes = require("./routes/adviceRoutes");
dotenv.config();
// additionally try to load a weather API key file if present (weatherapikey.env)
dotenv.config({ path: path.join(__dirname, 'weatherapikey.env') });
// Diagnostic: log whether the weather API key is present (do not print the key)
console.log('WEATHER_API_KEY present:', !!process.env.WEATHER_API_KEY);

// Ensure a JWT secret is available. If not present, provide a development fallback
// so local login/signup doesn't crash with a low-level error. This fallback is
// intended only for local development — set JWT_SECRET in your backend/.env for
// production or shared environments.
if (!process.env.JWT_SECRET) {
	console.warn(
		'WARNING: JWT_SECRET is not set. Falling back to an insecure development secret.\n' +
			'Please add JWT_SECRET in backend/.env or export it in your shell before running the server.'
	);
	process.env.JWT_SECRET = 'dev-secret-please-change';
}
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/market", require("./routes/marketRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/weather", require("./routes/weatherRoutes"));
app.use("/api/advice", adviceRoutes);

app.get("/", (req, res) => res.send("Smart Agriculture Market Tracker API running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌾 Server running on port ${PORT}`));
