// server.js
import express from "express";
import dotenvFlow from "dotenv-flow";
import connectDB from "./config/db.js";
import solventRoutes from "./routes/solvent.routes.js";
import prepRoutes from "./routes/prep.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import { verifyToken, allowSection } from "./middleware/auth.js";
import morgan from "morgan";

dotenvFlow.config();
console.log("NODE_ENV:", process.env.NODE_ENV);

const app = express();

// --- Dynamic CORS Configuration ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://hemraj-operator-performance-system.vercel.app",
  "https://hemraj-operator-performance-system-nine.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // server-to-server requests
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --- Middleware ---
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

// --- Ensure MongoDB connection before requests ---
let isConnected = false;
const ensureDBConnection = async () => {
  if (isConnected) return;
  try {
    await connectDB();
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  }
};

// Always ensure DB connection for each request (Vercel stateless environment)
app.use(async (req, res, next) => {
  await ensureDBConnection();
  next();
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/solvent", verifyToken, allowSection("solvent"), solventRoutes);
app.use("/api/prep", verifyToken, allowSection("prep"), prepRoutes);

// --- Temp Dashboard Route ---
app.post("/api/prep/dashboard", verifyToken, allowSection("prep"), (req, res) => {
  const { date, operator } = req.body;

  console.log("[server.js] Dashboard Request Received:");
  console.log("  Date:", date);
  console.log("  Operator:", operator);

  res.status(200).json({
    success: true,
    message: "Data received successfully",
    received: { date, operator },
  });
});

// --- Error Handler ---
app.use((err, req, res, next) => {
  console.error(" Error:", err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

// --- Root Route ---
app.get("/", (req, res) => {
  res.send("FTU Production Logger API is running...");
});

// --- Vercel / Local Mode Switch ---
if (process.env.NODE_ENV === "development") {
  const PORT = process.env.PORT || 5000;
  ensureDBConnection().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running locally on http://localhost:${PORT}`);
    });
  });
} else {
  console.log("Running in serverless (Vercel) mode — no app.listen()");
}

export default app;
