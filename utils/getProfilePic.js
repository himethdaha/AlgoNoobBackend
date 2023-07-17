const fs = require("fs");
const { pipeline } = require("stream");
const { promisify } = require("util");

// My modules
const { getObject } = require("../Cloud/s3Ops");

const getProfilePic = async (user) => {
  // Read default or user image
  try {
    return new Promise((resolve, reject) => {
      let response;
      // Check if the image is the default or user uploaded
      const fileName = user[0]?.profilepic || user.profilepic;
      // Params for the S3 bucket
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${process.env.KEY}${
          user[0]?.userName || user.userName
        }/${fileName}`,
      };
      console.log(
        "🚀 ~ file: getProfilePic.js:24 ~ returnnewPromise ~ params:",
        params
      );

      // Response body is of Readable stream format
      getObject(params)
        .then((response) => {
          // Create a writable stream. Remember the file is created into the disk
          const writeStream = fs.createWriteStream("output.jpeg");
          // Pipe the readable stream to the writeable stream
          response.pipe(writeStream);

          response.on("end", () => {
            console.log("FInished reading the stream");
            writeStream.end();
          });

          response.on("error", (err) => {
            console.log(
              "🚀 ~ file: getProfilePic.js:59 ~ response.on ~ err:",
              err
            );
            reject(`An error occurred during the pipeline. ${err}`);
          });

          // Event handler to check if the stream is written completely
          writeStream.on("finish", () => {
            console.log("Done writing the stream");
            // Begin processing the stream
            // Read the file from disk and write it to memory as a buffer
            fs.readFile("output.jpeg", (err, imageBuffer) => {
              if (err) {
                console.log(
                  "🚀 ~ file: getProfilePic.js:61 ~ writeStream.on ~ err:",
                  err
                );
                reject(`An error occurred while processing the stream: ${err}`);
              }

              const encodedImage = imageBuffer.toString("base64");

              const imageSrc = `data:image/jpeg;base64,${encodedImage}`;

              // Unlink output file
              fs.unlink("output.jpeg", (err) => {
                if (err) {
                  reject(`An error occurred while unlink. ${err}`);
                }
              });
              resolve(imageSrc);
            });
          });

          writeStream.on("error", (error) => {
            console.log(`An error occured while writing the stream. ${error}`);
            const err = `An error occured while writing the stream. ${error}`;
            reject(err);
          });
        })
        .catch((err) => {
          console.log(
            "🚀 ~ file: getProfilePic.js:36 ~ returnnewPromise ~ err:",
            err
          );
          reject(`An error occured while getting user pfp ${err}`);
        });
    });
  } catch (error) {
    const err = {
      status: 500,
      message: `Can't read image: ${error}`,
    };

    throw err;
  }
};

module.exports = getProfilePic;
