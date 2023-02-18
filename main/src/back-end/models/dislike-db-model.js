const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;
const DislikeSchema = mongoose.Schema({
  dislikerId: { type: ObjectId, required: true },
  dislikedId: { type: ObjectId, required: true },
});

//to not dislike twice
DislikeSchema.index({ dislikerId: 1, dislikedId: 1 }, { unique: true });

const DislikeDbModel = mongoose.model("dislike", DislikeSchema, "dislikes");
module.exports = { DislikeDbModel };
