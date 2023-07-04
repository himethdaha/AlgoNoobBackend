const User = require("../../database/models/userModel");
const fs = require("fs");

const removeUnverifiedUsers = async () => {
  try {
    console.log("running");
    // Get the users with verified flag 'false' and token time is <= current time
    const unverifiedExpiredUsers = await User.find({
      verified: false,
      verifiedExpiry: { $lt: Date.now() },
    });
    console.log(
      "🚀 ~ file: removeUnverified.js:11 ~ removeUnverifiedUsers ~ unverifiedExpiredUsers:",
      unverifiedExpiredUsers
    );

    // Delete all unverified users
    await User.deleteMany({
      _id: { $in: unverifiedExpiredUsers.map((user) => user._id) },
    });
  } catch (error) {
    const content = {
      users: unverifiedExpiredUsers,
      error: error,
    };

    fs.writeFile("./error.txt", JSON.stringify(content), function (err) {
      if (err) {
        console.log("🚀 ~ file: removeUnverified.js:29 ~ err:", err);
        return;
      }
      console.log("Done writing error");
    });
  }
};

// Run the cron job every 1 hour
const cron = setInterval(removeUnverifiedUsers, 1000);
console.log("🚀 ~ file: removeUnverified.js:39 ~ cron:", cron);
