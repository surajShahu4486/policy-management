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

    // Connect MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    // CSV file
    const workbook = XLSX.readFile(workerData.filePath);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet);

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {

        try {

            // Get data from Excel
            const agentName = row["Agent Name"];
            const firstName = row["First Name"];
            const email = row["Email"];
            const phoneNumber = row["Phone Number"];

            const accountName = row["Account Name"];

            const categoryName = row["category_name"];
            const companyName = row["company_name"];

            const policyNumber = row["Policy Number"];

            // Required fields
            if (!firstName || !policyNumber) {
                skipped++;
                continue;
            }

            // 1. Agent
            let agent = await Agent.findOne({
                agentName: agentName
            });

            if (!agent) {
                agent = await Agent.create({
                    agentName: agentName
                });
            }

            // 2. User
            let user = await User.findOne({
                email: email
            });

            if (!user) {
                user = await User.create({
                    firstName: firstName,
                    dob: row["DOB"],
                    address: row["Address"],
                    phoneNumber: phoneNumber,
                    state: row["State"],
                    zipCode: row["Zip Code"],
                    email: email,
                    gender: row["Gender"],
                    userType: row["User Type"],
                    username: row["Username"] || firstName,
                    agentId: agent._id
                });
            }

            // 3. Account
            if (accountName) {

                const account = await Account.findOne({
                    accountName: accountName
                });

                if (!account) {
                    await Account.create({
                        accountName: accountName
                    });
                }
            }

            // 4. LOB
            let lob = await LOB.findOne({
                categoryName: categoryName
            });

            if (!lob) {
                lob = await LOB.create({
                    categoryName: categoryName
                });
            }

            // 5. Carrier
            let carrier = await Carrier.findOne({
                companyName: companyName
            });

            if (!carrier) {
                carrier = await Carrier.create({
                    companyName: companyName
                });
            }

            // 6. Policy
            const policy = await Policy.findOne({
                policyNumber: policyNumber
            });

            if (!policy) {

                await Policy.create({
                    policyNumber: policyNumber,
                    policyStartDate: row["Policy Start Date"],
                    policyEndDate: row["Policy End Date"],
                    policyCategoryId: lob._id,
                    companyId: carrier._id,
                    userId: user._id
                });
            }

            imported++;

        } catch (error) {

            skipped++;

            console.log("Error:", error.message);
        }
    }

    await mongoose.disconnect();

    return {
        success: true,
        message: "File imported successfully",
        totalRows: rows.length,
        imported: imported,
        skipped: skipped
    };
}


// Start worker
processFile()
    .then((result) => {
        parentPort.postMessage(result);
    })
    .catch((error) => {

        parentPort.postMessage({
            success: false,
            message: error.message
        });

    });