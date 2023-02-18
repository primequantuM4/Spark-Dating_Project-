const { User } = require("../common/user");
const { MatchDbModel } = require("../models/match-db-model");
const { UserDbModel } = require("../models/user-db-model");

class ChatHandler {
  async getUserAndChatInfo(myId) {
    const instruction = { $or: [{ boyId: myId }, { girlId: myId }] };
    const matchDocs = await MatchDbModel.find(instruction);
    if (!matchDocs.length) return [];

    const amBoy = matchDocs[0].boyId.toString() === myId;
    const userAndChatInfoPromises = [];

    for (const matchDoc of matchDocs) {
      const otherUserId = amBoy ? matchDoc.girlId : matchDoc.boyId;
      const chatId = matchDoc._id.toString();
      const unreadCount = amBoy
        ? matchDoc.unreadByBoyCount
        : matchDoc.unreadByGirlCount;

      const promise = this.userAndChatInfoPromise(
        otherUserId,
        chatId,
        unreadCount
      );
      userAndChatInfoPromises.push(promise);
    }

    return await Promise.all(userAndChatInfoPromises);
  }

  userAndChatInfoPromise(otherUserId, chatId, unreadCount) {
    return UserDbModel.findOne({ _id: otherUserId }).then((otherUserDoc) => {
      const user = new User(otherUserDoc).getPublicInfo();
      const chatInfo = { unreadCount, chatId };
      return { user, chatInfo };
    });
  }

  async getUserAndMessages(userId, chatId) {
    const matchDoc = await MatchDbModel.findOne({ _id: chatId });
    const isBoy = userId === matchDoc.boyId.toString();

    const otherUserId = isBoy ? matchDoc.girlId : matchDoc.boyId;

    const otherUserDoc = await UserDbModel.findOne({ _id: otherUserId });
    const otherUser = new User(otherUserDoc);
    const otherUserPublicInfo = otherUser.getPublicInfo();

    return {
      user: otherUserPublicInfo,
      messages: matchDoc.messages,
    };
  }
}

const chatHandler = new ChatHandler();
module.exports = { chatHandler };
