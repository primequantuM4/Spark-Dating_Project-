const { UserDbModel } = require("../models/user-db-model");
const { DislikeDbModel } = require("../models/dislike-db-model");
const { LikeDbModel } = require("../models/like-db-model");
const { MatchDbModel } = require("../models/match-db-model");
const { User } = require("../common/user");

async function importBoysAndGirls() {
  const allUserDocuments = await UserDbModel.find({});
  const boys = [];
  const girls = [];

  for (const userDocument of allUserDocuments) {
    const user = new User(userDocument);
    if (user.sex === "male") {
      boys.push(user);
    } else {
      girls.push(user);
    }
  }

  return { boys, girls };
}

async function haveMatched(user1Id, user2Id) {
  const result = await MatchDbModel.findOne({
    $or: [
      { boyId: user1Id, girlId: user2Id },
      { boyId: user2Id, girlId: user1Id },
    ],
  });

  if (result) return true;
  else return false;
}

async function haveDisliked(user1Id, user2Id) {
  const result = await DislikeDbModel.findOne({
    $or: [
      { dislikerId: user1Id, dislikedId: user2Id },
      { dislikerId: user2Id, dislikedId: user1Id },
    ],
  });

  if (result) return true;
  else return false;
}

async function hasLiked(likerId, likedId) {
  const result = await LikeDbModel.findOne({
    likerId,
    likedId,
  });

  if (result) return true;
  else return false;
}

module.exports = {
  importBoysAndGirls,
  haveMatched,
  haveDisliked,
  hasLiked,
};

async function test() {
  //console.log(await importBoysAndGirls());
  // console.log(
  //   await haveMatched("63eeea2ec3bc1ba9fbc935d2", "63eee922696bcccacf35f79b")
  // );
  // console.log(
  //   await haveDisliked("63eeea2ec3bc1ba9fbc935d2", "63eee922696bcccacf35f79b")
  // );
}
//test();
