// Imports
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
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
    // Password retry count for logins
    passwordRetryCount: {
      type: Number,
      default: 0,
    },
    passwordRetryCountExpiration: {
      type: Date,
    },
    // To block the user from loggin in further
    maxPasswordRetryCount: {
      type: Number,
      default: 0,
    },
    // Password reset token
    passwordResetToken: {
      type: String,
    },
    // Password reset token expiration time
    passwordResetTokenExpirationTime: {
      type: Date,
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
  if (!this.isModified("password")) {
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
  const user = this;
  // If password isn't changed, skip hashing
  if (!user.isModified("password")) {
    return next();
  } else {
    // Get salt rounds
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
  }
});

// Methods
userSchema.methods.createResetPasswordToken = async function () {
  const user = this;
  console.log("user schema", user);

  // Create a 32 random byte
  const randomBytes = crypto.randomBytes(32).toString("hex");
  const saltRounds = Number(process.env.SALT_ROUNDS);

  try {
    // Generate salt and hash
    const saltGenerated = await bcrypt.genSalt(saltRounds);
    const resetToken = await bcrypt.hash(randomBytes, saltGenerated);

    //save the hashed token to the database as a temporary password
    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpirationTime = Date.now() + 10 * 60 * 1000;
    await user.save();
    // return the 32 random byte to be used by the user
    return randomBytes;
  } catch (error) {
    const err = {
      status: 500,
      message: `Error when creating reset password token. ${error}`,
    };
    throw err;
  }
};
const User = mongoose.model("User", userSchema);
module.exports = User;
