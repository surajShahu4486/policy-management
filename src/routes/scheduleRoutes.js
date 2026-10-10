
import express from "express";
import ScheduledJob from "../models/ScheduledJob.js";

const router = express.Router();

// Schedule a message
router.post("/", async (req, res) => {
    try {
        const { message, day, time } = req.body;

        if (!message || !day || !time) {
            return res.status(400).json({
                message: "Message, day and time are required"
            });
        }

        const scheduledAt = new Date(`${day}T${time}:00`);

        if (isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
            return res.status(400).json({
                message: "Please enter a valid future date and time"
            });
        }

        const job = await ScheduledJob.create({
            message: message.trim(),
            scheduledAt
        });

        res.status(201).json({
            success: true,
            message: "Message scheduled successfully",
            data: job
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get scheduled messages
router.get("/", async (req, res) => {
    try {
        const jobs = await ScheduledJob.find()
            .sort({ scheduledAt: 1 });

        res.json({
            success: true,
            count: jobs.length,
            data: jobs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
