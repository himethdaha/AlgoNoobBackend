const User = require("../../database/models/userModel");
const fs = require("fs");

const removeUnverifiedUsers = async () => {
  try {
    // Get the users with verified flag 'false' and token time is <= current time
    const unverifiedExpiredUsers = await User.find({
      verified: false,
      verifiedExpiry: { $lt: Date.now() },
    });

    // Delete all unverified users
    const deleted = await User.deleteMany({
      _id: { $in: unverifiedExpiredUsers.map((user) => user._id) },
    });

    const allUsers = {
      unverifiedExpiredUsers,
      deleted,
    };

    fs.writeFile("./deleted.txt", JSON.stringify(allUsers), function (err) {
      if (err) {
        console.log("🚀 ~ file: removeUnverified.js:29 ~ err:", err);
        return;
      }
      console.log("Done writing error");
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

module.exports = removeUnverifiedUsers;
