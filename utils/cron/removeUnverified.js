const User = require("../../database/models/userModel");
const fs = require("fs");

const removeUnverifiedUsers = async () => {
  let unverifiedExpiredUsers = [];
  try {
    // Get the users with verified flag 'false' and token time is <= current time
    unverifiedExpiredUsers = await User.find({
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

    // If users are deleted
    if (unverifiedExpiredUsers.length > 0) {
      fs.appendFile(
        "./utils/cron/deleted.txt",
        JSON.stringify(allUsers) + "\n",
        function (err) {
          if (err) {
            return;
          }
        }
      );
    }
  } catch (error) {
    const content = {
      users: unverifiedExpiredUsers,
      error: error,
    };

    if (content.users.length > 0) {
      fs.appendFile(
        "./utils/cron/error.txt",
        JSON.stringify(content) + "\n",
        function (err) {
          if (err) {
            return;
          }
        }
      );
    }
    return;
  }
};

module.exports = removeUnverifiedUsers;
