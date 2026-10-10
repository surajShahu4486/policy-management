import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./src/config/db.js";

import policyRoutes from "./src/routes/policyRoutes.js";
import scheduleRoutes from "./src/routes/scheduleRoutes.js";

import { startCpuMonitor } from "./src/services/cpuMonitor.js";
import { startScheduler } from "./src/services/scheduler.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", uploadRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/schedule", scheduleRoutes);

// 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("Error:", err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});


// Start Express server FIRST
app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

    // Start CPU monitor
    startCpuMonitor();

    // Start scheduler
    startScheduler();

    // Connect MongoDB
    connectDB();
});