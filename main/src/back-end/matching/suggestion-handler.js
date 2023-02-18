const { UserDbModel } = require("../models/user-db-model");
const { LikeDbModel } = require("../models/like-db-model");
const { DislikeDbModel } = require("../models/dislike-db-model");
const { MatchDbModel } = require("../models/match-db-model");

const { suggester } = require("./suggester");

class SuggestionHandler {
  async like(likerId, likedId) {
    const likeRelationship = new LikeDbModel({ likerId, likedId });
    const likeCreateResult = await likeRelationship.save();
    let matchCreateResult;

    const canMatch = await this.canMatch(likerId, likedId);
    if (canMatch) {
      matchCreateResult = await this.match(likerId, likedId);
    }
    await suggester.updateScores();

    return matchCreateResult ?? likeCreateResult;
  }

  async dislike(dislikerId, dislikedId) {
    const dislikeRelationship = new DislikeDbModel({ dislikerId, dislikedId });
    const result = await dislikeRelationship.save();
    await suggester.updateScores();
    return result;
  }

  async canMatch(user1Id, user2Id) {
    const oneLikesTwo = await LikeDbModel.findOne({
      likerId: user1Id,
      likedId: user2Id,
    });

    const twoLikesOne = await LikeDbModel.findOne({
      likerId: user2Id,
      likedId: user1Id,
    });

    if (oneLikesTwo && twoLikesOne) {
      return true;
    } else {
      return false;
    }
  }

  async match(user1Id, user2Id) {
    const deleteLikeResult = await LikeDbModel.deleteMany({
      $or: [
        { likerId: user1Id, likedId: user2Id },
        { likerId: user2Id, likedId: user1Id },
      ],
    });

    const user1 = await UserDbModel.findOne({ _id: user1Id });

    const user1IsMale = user1.sex === "male";
    const matchRelationship = new MatchDbModel({
      boyId: user1IsMale ? user1Id : user2Id,
      girlId: user1IsMale ? user2Id : user1Id,
    });
    const matchCreateResult = await matchRelationship.save();
    return matchCreateResult;
  }

  async getSuggestedUsers(userId) {
    const users = await suggester.getSuggestedUsers(userId);
    return users;
  }
}

const suggestionHandler = new SuggestionHandler();
module.exports = { suggestionHandler }; //good for consistent naming accross files
