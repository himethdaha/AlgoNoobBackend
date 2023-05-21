// Imports
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validatorLib = require("validator");

const userSchema = new mongoose.Schema(
  {
    // Email address
    emailAddress: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      unique: true,
      validate: [
        {
          validator: function (value) {
            const escapedEmail = validatorLib.escape(value);
            return validatorLib.isEmail(escapedEmail);
          },
          message: "Email is invalid",
        },
      ],
    },
    // Username
    userName: {
      type: String,
      required: [true, "Username address is required"],
      unique: true,
      maxLength: [10, "Username can't be longer than 10 characters"],
      validate: [
        {
          validator: function (value) {
            return validatorLib.escape(value);
          },
          message: "Username is invalid",
        },
      ],
    },
    // Password
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters"],
      validate: [
        {
          validator: function (value) {
            return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[!@#$%^&*()\-=+{};:,<.>|[\]/?]).{6,}$/gm.test(
              value
            );
          },
          message:
            "Password must contain at least one lowercase letter, one uppercase letter, one number, one special character and at least 6 characters",
        },
      ],
    },
  },
  // Include virtual properties in the JSON representation
  { toJSON: { virtuals: true } }
);

// Virtual Properties
// Password confirmation

userSchema
  .virtual("passwordConfirm")
  .get(function () {
    return this._passwordConfirm;
  })
  .set(function (value) {
    this._passwordConfirm = value;
  });

// Hooks

// Pre-hook
// To validate password confirmation
userSchema.pre("save", function (next) {
  if (!this.isModified("password") && !this.isNew) {
    return next();
  }
  if (this.passwordConfirm === null) {
    return next(new Error("Confirm Password is required"));
  }
  if (this.password !== this.passwordConfirm) {
    return next(new Error("Confirm Password is invalid"));
  }

  next();
});

// To hash the password
userSchema.pre("save", function (next) {
  // Get salt rounds
  const user = this;
  const saltRounds = Number(process.env.SALT_ROUNDS);

  // Auto-gen salt and hash
  bcrypt.genSalt(saltRounds, function (err, salt) {
    if (err) {
      return next(new Error(`Could not generate salt. ${err}`));
    } else {
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          return next(
            new Error(`Could not generate hash for password. ${err}`)
          );
        } else {
          user.password = hash;
          next();
        }
      });
    }
  });
});

const User = mongoose.model("User", userSchema);
module.exports = User;
