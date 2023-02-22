const { sessionMiddleware } = require("../common/session");
const { LiveChat } = require("./live-chat");
const { MatchDbModel } = require("../models/match-db-model");

const liveChats = [];

async function handleNewWebSocket(webSocket, req) {
  const chatId = getChatId(req);
  const userId = await getUserId(req);
  const chatDocument = await MatchDbModel.findOne({ _id: chatId });

  if (!userId) {
    webSocket.close(1000, "could not find user id, try logging in");
    return;
  }

  if (!isMemberOfChat(userId, chatDocument)) {
    webSocket.close(1000, `you are not a memeber of ${chatId}`);
    return;
  }

  const gender = getGender(userId, chatDocument);

  const existingLiveChat = liveChats[chatId];

  if (existingLiveChat === undefined) {
    const newLiveChat = new LiveChat(gender, webSocket, chatId, liveChats);
    liveChats[chatId] = newLiveChat;
    //
  } else if (existingLiveChat.isOnline(gender)) {
    const userFriendlyErr = `open this page only once`;
    const devErr = ` chat ${chatId} has ${gender} online.`;
    webSocket.close(1000, userFriendlyErr + "\n" + devErr);
    //
  } else {
    existingLiveChat.join(gender, webSocket);
  }
}

function isMemberOfChat(userId, chatDocument) {
  const isBoyId = chatDocument.boyId.toString() === userId;
  const isGirlId = chatDocument.girlId.toString() === userId;
  return isBoyId || isGirlId;
}

function getGender(userId, chatDocument) {
  const isBoyId = chatDocument.boyId.toString() === userId;
  return isBoyId ? "male" : "female";
}

function getUserId(req) {
  return new Promise((onSuccess, onFail) => {
    const next = function () {
      const userId = req.session.userId;
      onSuccess(userId);
    };
    sessionMiddleware(req, {}, next);
  });
}

function getChatId(req) {
  const slashChatId = req.url;
  const chatId = slashChatId.slice(1);
  return chatId;
}

module.exports = { handleNewWebSocket };
