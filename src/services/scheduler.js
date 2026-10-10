import ScheduledJob from "../models/ScheduledJob.js";
import Message from "../models/Message.js";

let running = false;

export function startScheduler() {
  const interval = Number(process.env.SCHEDULER_INTERVAL_MS || 10000);

  setInterval(async () => {
    if (running) return;
    running = true;

    try {
      const jobs = await ScheduledJob.find({
        status: "pending",
        scheduledAt: { $lte: new Date() }
      }).limit(50);

      for (const job of jobs) {
        try {
          // Claim the job atomically so multiple server instances do not


          // process the same scheduled message.
          const claimed = await ScheduledJob.findOneAndUpdate(
            { _id: job._id, status: "pending" },
            { $set: { status: "completed", processedAt: new Date() } },
            { new: true }
          );

          if (!claimed) continue;

          await Message.create({
            message: claimed.message,
            scheduledJobId: claimed._id
          });

          // console.log(`Scheduled message inserted: ${claimed._id}`);
        } catch (error) {
          await ScheduledJob.findByIdAndUpdate(job._id, {
            status: "failed",
            error: error.message
          });
        }
      }
    } catch (error) {
      console.error("Scheduler error:", error.message);
    } finally {
      running = false;
    }
  }, interval);

  console.log(`Scheduler started. Interval: ${interval}ms`);
}
