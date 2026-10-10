import express from "express";
import {
  searchPolicy,
  aggregatePoliciesByUser
} from "../controllers/policyController.js";

const router = express.Router();

router.get("/search", searchPolicy);
router.get("/aggregate", aggregatePoliciesByUser);

export default router;
