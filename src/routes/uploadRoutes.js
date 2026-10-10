import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Worker } from "worker_threads";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../../uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".xlsx", ".xls", ".csv"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only XLSX, XLS or CSV files are allowed"));
    }
  }
});

router.post("/upload", upload.single("file"), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Upload a file using form-data field: file"
    });
  }

  const worker = new Worker(
    new URL("../workers/uploadWorker.js", import.meta.url),
    {
      workerData: {
        filePath: req.file.path,
        originalName: req.file.originalname
      }
    }
  );

  worker.on("message", (result) => {
    if (result.success) {
      return res.status(202).json(result);
    }

    return res.status(500).json(result);
  });

  worker.on("error", (error) => {
    next(error);
  });

  worker.on("exit", (code) => {
    if (code !== 0) {
      console.error(`Upload worker stopped with exit code ${code}`);
    }
  });
});

export default router;
