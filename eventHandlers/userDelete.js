const User = require("../database/models/userModel");
const { deleteUser } = require("../utils/email/emailSender");

async function userDelete(decodedJwt) {
  console.log(
    "🚀 ~ file: userDelete.js:5 ~ userDelete ~ decodedJwt:",
    decodedJwt
  );
  try {
    console.log("running");
    // Get the id from the token
    const id = decodedJwt.id;
    console.log("🚀 ~ file: userDelete.js:13 ~ userDelete ~ id:", id);

    // Check if a user exists for it
    const user = await User.find({ _id: id });
    console.log("🚀 ~ file: userDelete.js:17 ~ userDelete ~ user:", user);

    if (!user) {
      console.log("no user found");
      throw (err = {
        status: 404,
        message: "Can not find user",
      });
    }

    // Delete user
    const deletedUser = await User.findOneAndDelete({ id: user._id });
    console.log(
      "🚀 ~ file: userDelete.js:20 ~ userDelete ~ deletedUser:",
      deletedUser
    );

    if (!deletedUser) {
      throw (err = {
        status: 400,
        message: "No users deleted",
      });
    }
    try {
      // Send the confirmation email
      await deleteUser({
        userEmail: deletedUser.emailAddress,
        userName: deletedUser.userName,
        subject: `User Deletion`,
      });
      return {
        status: 200,
        message: "User deleted successfully",
      };
    } catch (error) {
      throw (err = {
        status: 500,
        message: `Error occurred while deleting user. Please try again. ${error}`,
      });
    }
  } catch (error) {
    console.log("🚀 ~ file: userDelete.js:58 ~ userDelete ~ error:", error);
    if (error.status) {
      console.log("with status");
      throw (err = {
        status: error.status,
        message: error.message,
      });
    }

    throw error;
  }
}

module.exports = userDelete;
