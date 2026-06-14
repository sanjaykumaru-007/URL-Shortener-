import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import urlRoutes from "./routes/urlRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { redirectUrl } from "./controllers/urlController.js";

import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// Middleware
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

app.use(express.json());

// Routes
app.get('/r/:shortCode', redirectUrl);
app.use("/api/auth", authRoutes);
app.use("/api/urls", urlRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Error handler
app.use(errorHandler);

export default app;