const fs = require("fs");
const formidable = require("formidable");
const User = require("../database/models/userModel");

async function userUpdate(req) {
  try {
    // Variables
    let userUpdateFields;
    let updateBody = {};
    let allFields = {};

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
        if (files) {
          const file = files.profilepic;

          // Get the image extension
          const ext = file.originalFilename.substring(
            file.originalFilename.lastIndexOf(".")
          );

          // File path
          const fullFileName = `${file.newFilename}${ext}`;
          const filePath = `resources/images/users/${fullFileName}`;

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
            allFields.profilepic = fullFileName;
            console.log("allFields", allFields);
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
    console.log(user);
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
        console.log("userUpdateFields", userUpdateFields);
        if (key !== "user") {
          updateBody[key] = value;
        }
      }
      console.log("updatedBody", updateBody);
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
        return { status: 200, message: "User Successfully updated" };
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
    }
    throw error;
  }
}

module.exports = userUpdate;
