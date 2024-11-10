//  u means user enter password 123 salt add some string like abc , now password is abc123
//  then hashing make it rdtfyguh567 and store it if hacker enter he will see this scramble
//  rdtfyguh567  not origional

const { createHmac, randomBytes } = require("crypto");
const mongoose = require("mongoose");

const { Schema } = require("mongoose");
const { createToken } = require("../service/auth");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    salt: {
      type: String,
      // required: true ,
    },

    password: {
      type: String,
      required: true,
    },

    profileImageURL: {
      type: String,
      default: "/images/image.png",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return;

  const salt = randomBytes(16).toString();
  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  this.salt = salt;
  this.password = hashedPassword;
  next();
});

userSchema.static("matchPasswordAndGenerateToken", async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("user not found");

  const salt = user.salt;
  const hashedPassword = user.password;
  const userHashedPass = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

    if (hashedPassword != userHashedPass) throw new Error("Incorrect Password");

   return createToken(user)
});

const User = mongoose.model("user", userSchema);

module.exports = User;
