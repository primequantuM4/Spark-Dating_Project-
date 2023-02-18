const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;
const MatchSchema = mongoose.Schema({
  boyId: { type: ObjectId, required: true },
  girlId: { type: ObjectId, required: true },

  unreadByBoyCount: { type: Number, required: true, default: 0 },
  unreadByGirlCount: { type: Number, required: true, default: 0 },

  messages: [
    {
      content: { type: String, required: true },
      sentByBoy: { type: Boolean, required: true },
    },
  ],
});

//to not matchTwice
MatchSchema.index({ boyId: 1, girlId: 1 }, { unique: true });

const MatchDbModel = mongoose.model("match", MatchSchema, "matches");
module.exports = { MatchDbModel };
