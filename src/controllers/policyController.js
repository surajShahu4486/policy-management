import User from "../models/User.js";
import Policy from "../models/Policy.js";
import LOB from "../models/LOB.js";
import Carrier from "../models/Carrier.js";

export async function searchPolicy(req, res, next) {

    try {

        const username = String(req.query.username || "").trim();

        if (!username) {
            return res.status(400).json({
                success: false,
                message: "username is required"
            });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: username, $options: "i" } },
                { firstName: { $regex: username, $options: "i" } },
                { email: { $regex: username, $options: "i" } }
            ]
        });

        if (!users.length) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const policies = await Policy.find({
            userId: {
                $in: users.map(user => user._id)
            }
        })
        .populate("userId", "firstName username email phoneNumber")
        .populate("policyCategoryId", "categoryName")
        .populate("companyId", "companyName");

        res.json({
            success: true,
            count: policies.length,
            data: policies
        });

    } catch (error) {

        next(error);
    }
}


export async function aggregatePoliciesByUser(req, res, next) {

    try {

        const result = await Policy.aggregate([

            {
                $group: {
                    _id: "$userId",
                    policyCount: {
                        $sum: 1
                    },
                    policies: {
                        $push: "$$ROOT"
                    }
                }
            },

            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },

            {
                $unwind: "$user"
            },

            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    firstName: "$user.firstName",
                    username: "$user.username",
                    email: "$user.email",
                    policyCount: 1,
                    policies: 1
                }
            },

            {
                $sort: {
                    policyCount: -1
                }
            }

        ]);

        res.json({
            success: true,
            count: result.length,
            data: result
        });

    } catch (error) {

        next(error);
    }
}