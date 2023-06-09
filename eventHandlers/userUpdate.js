const fs = require("fs");
const formidable = require("formidable");
const User = require("../database/models/userModel");

async function userUpdate(body) {
  try {
    // Variables
    // Find user based on username in url
    const user = await User.find({ userName: body.user }).exec();

    const err = {
      status: 400,
      message: "Can not find user 🥹",
    };

    //If not user found
    if (user.length === 0) {
      throw err;
    } else {
      let updateBody = {};
      // Get the entries from the body to be updated
      for (const [key, value] of Object.entries(body)) {
        if (key !== "user") {
          updateBody[key] = value;
        }
      }
      //   Get the fields from the request and update them
      const updatedUser = await User.findOneAndUpdate(
        { userName: body.user },
        { ...updateBody },
        {
          runValidators: true,
          new: true,
        }
      );
      console.log(updatedUser);
      if (updatedUser) {
        await updatedUser.save();
      } else {
        const err = {
          status: 500,
          message: "Error updating the user",
        };

        throw err;
      }
    }
  } catch (error) {
    if (error.code === 11000) {
      throw (error = {
        status: 400,
        message:
          "Updating values already exists. Please try again with new values",
      });
    }
    throw error;
  }
}

module.exports = userUpdate;
