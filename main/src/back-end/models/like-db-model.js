const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;
const LikeSchema = mongoose.Schema({
  likerId: { type: ObjectId, required: true },
  likedId: { type: ObjectId, required: true },
});

//to not like twice
LikeSchema.index({ likerId: 1, likedId: 1 }, { unique: true });

const LikeDbModel = mongoose.model("like", LikeSchema, "likes");
module.exports = { LikeDbModel };
