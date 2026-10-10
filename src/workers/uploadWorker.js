
import "dotenv/config";
import { parentPort, workerData } from "worker_threads";
import mongoose from "mongoose";
import XLSX from "xlsx";

import Agent from "../models/Agent.js";
import User from "../models/User.js";
import Account from "../models/Account.js";
import LOB from "../models/LOB.js";
import Carrier from "../models/Carrier.js";
import Policy from "../models/Policy.js";

async function processFile() {
  try {
    // 1. Connect MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });

    // 2. Read CSV or Excel file
    const workbook = XLSX.readFile(workerData.filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      defval: ""
    });

    console.log("Total rows:", rows.length);
    console.log("CSV columns:", Object.keys(rows[0] || {}));

    let imported = 0;
    let skipped = 0;

    // 3. Process each row
    for (const row of rows) {
      try {
        // Actual CSV column names
        const agentName = row.agent;
        const firstName = row.firstname;
        const email = row.email;
        const phoneNumber = row.phone;
        const accountName = row.account_name;
        const categoryName = row.category_name;
        const companyName = row.company_name;
        const policyNumber = row.policy_number;

        // Required fields
        if (!firstName || !policyNumber || !email ||
            !categoryName || !companyName) {
          skipped++;
          continue;
        }

        // 4. Agent
        let agent = await Agent.findOne({ agentName });

        if (!agent) {
          agent = await Agent.create({ agentName });
        }

        // 5. User
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            firstName,
            dob: row.dob || null,
            address: row.address,
            phoneNumber,
            state: row.state,
            zipCode: row.zip,
            email,
            gender: row.gender,
            userType: row.userType,
            username: firstName,
            agentId: agent._id
          });
        }

        // 6. Account
        if (accountName) {
          let account = await Account.findOne({ accountName });

          if (!account) {
            await Account.create({ accountName });
          }
        }

        // 7. LOB (policy category)
        let lob = await LOB.findOne({ categoryName });

        if (!lob) {
          lob = await LOB.create({ categoryName });
        }

        // 8. Carrier (insurance company)
        let carrier = await Carrier.findOne({ companyName });

        if (!carrier) {
          carrier = await Carrier.create({ companyName });
        }

        // 9. Policy
        const existingPolicy = await Policy.findOne({
          policyNumber
        });

        if (!existingPolicy) {
          await Policy.create({
            policyNumber,
            policyStartDate: row.policy_start_date || null,
            policyEndDate: row.policy_end_date || null,
            policyCategoryId: lob._id,
            companyId: carrier._id,
            userId: user._id
          });
        }

        imported++;

      } catch (error) {
        skipped++;
        console.error(
          "Row error:",
          row.policy_number,
          error.message
        );
      }
    }

    return {
      success: true,
      message: "CSV processing completed",
      totalRows: rows.length,
      processed: imported,
      skipped
    };

  } finally {
    // 10. Close MongoDB connection
    await mongoose.disconnect();
  }
}

// Start worker
processFile()
  .then((result) => {
    parentPort.postMessage(result);
  })
  .catch((error) => {
    console.error("Upload worker error:", error);

    parentPort.postMessage({
      success: false,
      message: error.message
    });
  });
