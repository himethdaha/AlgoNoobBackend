const fs = require("fs");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);

const getProfilePic = async (user) => {
  console.log("🚀 ~ file: getProfilePic.js:6 ~ getProfilePic ~ user:", user);
  // Read default or user image
  try {
    // Check if the image is the default or user uploaded
    const imagePath = user[0]?.profilepic || user.profilepic;
    const mimeType = imagePath.substring(imagePath.lastIndexOf(".") + 1);

    // Create a buffer
    const image = await readFileAsync(
      `C:\\Users\\himet\\OneDrive\\Documents\\React\\my-first-nodejs-backend\\resources\\images\\users\\${imagePath}`
    );

    const encodedImage = image.toString("base64");
    const imageSrc = `data:image/${mimeType};base64,${encodedImage}`;

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
