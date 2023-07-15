// Imported modules
const fs = require("fs");
const formidable = require("formidable");
const sharp = require("sharp");

// My modules
const User = require("../database/models/userModel");
const getProfilePic = require("../utils/getProfilePic");
const { deleteObject, createObject } = require("../Cloud/s3Ops");

async function userUpdate(req) {
  try {
    // Variables
    let userUpdateFields;
    let updateBody = {};
    let allFields = {};
    let image;
    let changeuserName = false;
    let changeProfilePic = false;

    // Params for the S3 bucket
    let params = {
      Bucket: process.env.BUCKET_NAME,
      Key: process.env.KEY,
    };
    console.log("🚀 ~ file: userUpdate.js:40 ~ userUpdate ~ params:", params);

    // Create instance of formidable to handle file data
    const form = new formidable.IncomingForm();

    // Get the form data
    const getFormData = (prevUser) => {
      return new Promise((resolve, reject) => {
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
          console.log(
            "🚀 ~ file: userUpdate.js:46 ~ form.parse ~ allFields:",
            allFields
          );

          // Access files
          if (Object.keys(files).length > 0) {
            console.log("files", files);
            const file = files.profilepic;
            const fileBuffer = fs.readFileSync(file.filepath);
            console.log(
              "🚀 ~ file: userUpdate.js:49 ~ form.parse ~ fileBuffer:",
              fileBuffer
            );

            // pfp name to be saved
            const fileName = `${allFields.user}.jpeg`;

            // Add filename to params
            params.fileName = fileName;

            console.log(
              "🚀 ~ file: userUpdate.js:52 ~ form.parse ~ fileName:",
              fileName
            );
            // Resize image and save to filesystem
            const imageBuffer = sharp(fileBuffer)
              .resize(110, 110)
              .toFormat("jpeg")
              .jpeg({ quality: 90 })
              .toBuffer();

            // Add buffer to params body
            params.Body = imageBuffer;

            // Check if the user already has a pfp uploaded
            if (prevUser[0].profilepic !== "default.jpeg") {
              // Remove that first from the S3bucket
              deleteObject(params, prevUser)
                .then((response) => {
                  console.log(
                    "🚀 ~ file: userUpdate.js:89 ~ form.parse ~ response:",
                    response
                  );
                  resolve(response);
                })
                .catch((error) => {
                  reject(
                    `An error occured while deleting previous user image in S3. ${error}`
                  );
                });
            }

            // Send the data to the S3
            createObject(params)
              .then((response) => {
                console.log(
                  "🚀 ~ file: userUpdate.js:131 ~ .then ~ response:",
                  response
                );

                resolve(response);
              })
              .catch((error) => {
                reject(
                  `An error occured while creating user image in S3. ${error}`
                );
              });

            allFields.profilepic = fileName;
          }

          resolve(allFields);
        });
      });
    };

    // Find user based on username
    const prevUser = await User.find({
      userName: userUpdateFields.user,
    }).exec();

    console.log(
      "🚀 ~ file: userUpdate.js:71 ~ userUpdate ~ prevUser:",
      prevUser
    );

    userUpdateFields = await getFormData(prevUser);

    // Then, update
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
          console.log("changing pfp");
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
    console.log("🚀 ~ file: userUpdate.js:163 ~ userUpdate ~ error:", error);
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
  }
}

module.exports = userUpdate;
