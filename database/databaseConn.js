// Imports
const path = require("path");
const dotenv = require("dotenv");
const pathEnv = path.join(__dirname, "../.env");
dotenv.config({ path: pathEnv });
const mongoose = require("mongoose");

async function connectDB() {
  // Variables
  const dbPasswd = process.env.PASSWD;
  const dbString = process.env.DB_CONN_STRING.replace("<password>", dbPasswd);

  try {
    // Conenct with the database
    const dbConnectObject = await mongoose.connect(dbString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(dbConnectObject.connections);
    console.log(`Connected to db`);
    return dbConnectObject;
  } catch (error) {
    console.log(`Error connecting to db ${JSON.stringify(error)}`);
    throw error;
  }
}

module.exports = connectDB;
