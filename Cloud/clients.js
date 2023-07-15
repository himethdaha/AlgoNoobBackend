const { S3Client } = require("@aws-sdk/client-s3");

module.exports = {
  s3Client: function () {
    // Create a S3 client
    const REGION = "us-east-1";

    const s3Client = new S3Client({
      region: REGION,
      endpoint: "https://s3.us-east-1.amazonaws.com",
    });

    return s3Client;
  },
};
