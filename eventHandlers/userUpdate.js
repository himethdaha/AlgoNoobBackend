const fs = require("fs");
const formidable = require("formidable");
const User = require("../database/models/userModel");
const getProfilePic = require("../utils/getProfilePic");

async function userUpdate(req) {
  try {
    // Variables
    let userUpdateFields;
    let updateBody = {};
    let allFields = {};
    let image;
    let updatedUserName;
    let changeuserName = false;
    let changeProfilePic = false;

    // Create instance of formidable to handle file data
    const form = new formidable.IncomingForm();

    // Get the form data
    const getFormData = new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.log(err);
          reject(
            (err = {
              status: 500,
              message: "Error while parsing form data",
            })
          );
        }
        // Get form fields data
        allFields = JSON.parse(fields.jsonData);

        // Access files
        if (Object.keys(files).length > 0) {
          console.log("files", files);
          const file = files.profilepic;

          // File path
          const filePath = `resources/images/users/${file.originalFilename}`;

          // Files destination
          fs.rename(file.filepath, filePath, (err) => {
            if (err) {
              reject(
                (err = {
                  status: 500,
                  message: "Error while saving profile picture",
                })
              );
            }
            allFields.profilepic = file.originalFilename;
          });
        }

        resolve(allFields);
      });
    });

    userUpdateFields = await getFormData;

    // Find user based on username in url
    const user = await User.find({
      userName: userUpdateFields.user,
    }).exec();

    const err = {
      status: 400,
      message: "Can not find user 🥹",
    };

    //If not user found
    if (user.length === 0) {
      throw err;
    } else {
      // Get the entries from the body to be updated
      for (const [key, value] of Object.entries(userUpdateFields)) {
        if (key !== "user") {
          updateBody[key] = value;
        }
        if (key === "userName") {
          console.log("🚀 ~ file: userUpdate.js:83 ~ userUpdate ~ name:", key);
          changeuserName = true;
        }
        if (key === "profilepic") {
          console.log("🚀 ~ file: userUpdate.js:87 ~ userUpdate ~ image:", key);
          changeProfilePic = true;
        }
      }
      // Get the fields from the request and update them
      const updatedUser = await User.findOneAndUpdate(
        { userName: userUpdateFields.user },
        { ...updateBody },
        {
          runValidators: true,
          new: true,
        }
      );
      if (updatedUser) {
        await updatedUser.save();
        console.log("DONE UPDATING");

        let returningObj = {
          status: 200,
          message: "User Successfully updated",
        };

        // Must send new profile pic and username if changed
        if (changeProfilePic) {
          console.log("chaning pfp");
          // Get the default/new user profile picture
          image = await getProfilePic(updatedUser);
          returningObj.image = image;
        }

        if (changeuserName) {
          returningObj.userName = updatedUser.userName;
        }

        return returningObj;
      } else {
        throw (err = {
          status: 500,
          message: "Error updating the user",
        });
      }
    }
  } catch (error) {
    if (error.code === 11000) {
      throw (error = {
        status: 400,
        message:
          "Updating values already exists. Please try again with new values",
      });
    } else if (error.status) {
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
    throw error;
  }
}

module.exports = userUpdate;
