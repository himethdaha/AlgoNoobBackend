const User = require("../database/models/userModel");
const { deleteUser } = require("../utils/email/emailSender");

async function userDelete(decodedJwt) {
  try {
    // Get the id from the token
    const id = decodedJwt.id;

    // Check if a user exists for it
    const user = await User.find({ _id: id });

    if (user.length === 0) {
      throw (err = {
        status: 404,
        message: "Can not find user",
      });
    }

    // Delete user
    const deletedUser = await User.findOneAndDelete({ id: user._id });

    if (!deletedUser) {
      throw (err = {
        status: 400,
        message: "No user to be deleted",
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
    if (error.status) {
      throw (err = {
        status: error.status,
        message: error.message,
      });
    } else {
      throw (err = {
        status: 500,
        message: `Couldn't verify user due to backend failure: ${error}`,
      });
    }
  }
}

module.exports = userDelete;
