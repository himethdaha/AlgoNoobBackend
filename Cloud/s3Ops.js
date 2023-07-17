const {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { s3Client } = require("./clients");

module.exports = {
  deleteObject: async function (params, prevUser) {
    try {
      const deletedObject = new DeleteObjectCommand({
        Bucket: params.Bucket,
        Key: `${params.Key}${prevUser[0].profilepic}`,
      });

      const deleteResponse = await s3Client().send(deletedObject);
      return `Successfully deleted object ${deleteResponse}`;
    } catch (error) {
      const err = `Error while deleting object ${error}`;
      throw err;
    }
  },

  createObject: async function (params) {
    try {
      const createdObject = new PutObjectCommand({
        Bucket: params.Bucket,
        Key: params.Key,
        Body: params.Body,
      });
      console.log("🚀 ~ file: s3Ops.js:31 ~ createdObject:", createdObject);

      const createResponse = await s3Client().send(createdObject);
      return `Successfully created object ${createResponse}`;
    } catch (error) {
      console.log("🚀 ~ file: s3Ops.js:35 ~ error:", error);
      const err = `Error while creating object ${error}`;
      throw err;
    }
  },

  getObject: async function (params) {
    try {
      const getObject = new GetObjectCommand({
        Bucket: params.Bucket,
        Key: `${params.Key}`,
      });
      console.log("🚀 ~ file: s3Ops.js:48 ~ getObject:", params);

      const getResponse = await s3Client().send(getObject);
      return getResponse.Body;
    } catch (error) {
      console.log("🚀 ~ file: s3Ops.js:52 ~ error:", error);
      const err = `Error while getting object ${error}`;
      throw err;
    }
  },
};
