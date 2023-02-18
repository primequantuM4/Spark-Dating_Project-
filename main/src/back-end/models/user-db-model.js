const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  firstName: { type: String, required: true },
  lastName: { type: String, required: true },

  sex: { type: String, required: true, enum: ["male", "female"] },
  religion: { type: String, required: true },
  birthday: { type: String, required: true },
  bio: { type: String, required: true },

  photoUrl: String,

  religiousPreferences: [String],
  height: { type: Number, default: null },
  minHeight: { type: Number, default: null },
  maxHeight: { type: Number, default: null },
  minAge: { type: Number, default: null },
  maxAge: { type: Number, default: null },
});

const UserDbModel = mongoose.model("user", UserSchema, "users");
module.exports = { UserDbModel };
