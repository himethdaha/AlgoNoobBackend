// Imports
const mongoose = require("mongoose");
const isEmail = require("validator/lib/isEmail");

const userSchema = new mongoose.Schema({
  // Email address
  emailAddress: {
    type: String,
    required: [true, "Email address is required"],
    trim: true,
    unique: true,
    validate: [isEmail, "Email is invalid"],
  },
  // Username
  userName: {
    type: String,
    required: [true, "Username address is required"],
    unique: true,
    maxLength: [10, "Username can't be longer than 10 characters"],
  },
  // Password
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [6, "Password must be at least 6 characters"],
    validate: {
      validator: function (value) {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[!@#$%^&*()\-=+{};:,<.>|[\]/?]).{6,}$/gm.test(
          value
        );
      },
      message:
        "Password must contain at least one lowercase letter, one uppercase letter, one number, one special character and at least 6 characters",
    },
  },
  // Password confirmation
  passwordConfirm: {
    type: String,
    required: [true, "Confirm Password is required"],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
    },
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
