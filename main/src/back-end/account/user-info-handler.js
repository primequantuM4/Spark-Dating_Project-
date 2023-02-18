const { UserDbModel } = require("../models/user-db-model");
const { suggester } = require("../matching/suggester");

const { MatchDbModel } = require("../models/match-db-model");
const { LikeDbModel } = require("../models/like-db-model");
const { DislikeDbModel } = require("../models/dislike-db-model");

class UserInfoHandler {
  signup() {
    //dummy for now
  }
  async fillProfile(newProfile) {
    console.log(newProfile);
    const newUserDocument = new UserDbModel(newProfile);
    try {
      const result = await newUserDocument.save();
      suggester.updateUsers();
      return result;
    } catch (error) {
      if (error.code === 11000) {
        return { error: "email is already used", code: 11000 };
      } else {
        throw error;
      }
    }
  }

  async getProfile(userId) {
    const userDocument = await UserDbModel.findOne({ _id: userId });
    console.log(userDocument);
    return userDocument;
  }

  async savePhoto() {
    //save photo to photos folder
  }

  async editProfile(profile, userId) {
    const savedPart = {
      password: profile.password,

      religion: profile.religion,
      birthday: profile.birthday,
      bio: profile.bio,

      minAge: profile.minAge,
      maxAge: profile.maxAge,
      minHeight: profile.minHeight,
      maxHeight: profile.maxHeight,
      height: profile.height,
      religiousPreferences: profile.religiousPreferences,
    };

    //TODO: suggester.updateScores()
    const result = await UserDbModel.updateOne({ _id: userId }, savedPart);
    return result;
  }

  async deleteAccount(userId) {
    const mResult = await MatchDbModel.deleteOne({
      $or: [{ boyId: userId }, { girlId: userId }],
    });
    const lResult = await LikeDbModel.deleteOne({ _id: userId });
    const dResult = await DislikeDbModel.deleteOne({ _id: userId });
    const uResult = await UserDbModel.deleteOne({ _id: userId });
    return { account: "succesfully deleted" };
  }
}

const userInfoHandler = new UserInfoHandler();
module.exports = { userInfoHandler };

async function test() {
  console.log(await userInfoHandler.getProfile(1));
}
//test();
