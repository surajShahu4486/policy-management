
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
        message: "Please provide a username, name, or email"
      });
    }

    // Escape special regex characters
    const search = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Search user by username, first name, or email
    const users = await User.find({
      $or: [
        { username: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
    });

    console.log("Search value:", username);
    console.log("Users found:", users.length);

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "User not found. Check the name, username, email, or database."
      });
    }

    // Find policies for matching users
    const policies = await Policy.find({
      userId: { $in: users.map(user => user._id) }
    })
      .populate("userId", "firstName username email phoneNumber")
      .populate("policyCategoryId", "categoryName")
      .populate("companyId", "companyName")
      .lean();

    return res.json({
      success: true,
      count: policies.length,
      message: policies.length
        ? "Policies found successfully"
        : "User found, but no policies are assigned",
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
          policyCount: { $sum: 1 },
          policies: { $push: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: User.collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
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
      { $sort: { policyCount: -1 } }
    ]);

    return res.json({
      success: true,
      count: result.length,
      data: result
    });

  } catch (error) {
    next(error);
  }
}
