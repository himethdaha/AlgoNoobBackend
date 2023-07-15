const fs = require("fs");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);

// My modules
const { getObject } = require("../Cloud/s3Ops");

const getProfilePic = async (user) => {
  // Read default or user image
  try {
    let image;
    // Check if the image is the default or user uploaded
    const fileName = user[0]?.profilepic || user.profilepic;
    // Params for the S3 bucket
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `${process.env.KEY}/${fileName}`,
    };

    // TODO:  get the buffer from S3
    getObject(params)
      .then((response) => {
        console.log(
          "🚀 ~ file: getProfilePic.js:22 ~ getObject ~ response:",
          response
        );
        image = response;
      })
      .catch((error) => {
        console.log("🚀 ~ file: getProfilePic.js:28 ~ getObject ~ err:", err);
        const err = `Error while calling getObject. ${error}`;
        throw err;
      });
    // TODO: Everytime a user signs up have the default.jpeg uplaoded to S3

    const encodedImage = image.toString("base64");
    const imageSrc = `data:image/jpeg;base64,${encodedImage}`;

    return imageSrc;
  } catch (error) {
    const err = {
      status: 500,
      message: `Can't read image: ${error}`,
    };

    throw err;
  }
};

module.exports = getProfilePic;
