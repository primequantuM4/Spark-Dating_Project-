const { LiveChat } = require("./live-chat");
module.exports = { handleNewConnection };
const liveChats = [];

function handleNewWebSocket(webSocket, req) {
  const chatId = getChatId(req);
  const userId = getUserId(req);

  if (!userId) {
    webSocket.close(1000, "could not find user id, try logging in");
    return;
  }

  if (!isMemberOfChat(userId, chatId)) {
    webSocket.close(1000, `you are not a memeber of ${chatId}`);
    return;
  }

  const gender = getGender(userId, chatId);

  const existingLiveChat = liveChats[chatId];

  if (existingLiveChat === undefined) {
    const newLiveChat = new LiveChat(gender, webSocket, chatId, liveChats);
    liveChats[chatId] = newLiveChat;
  } else if (existingLiveChat.isOnline(gender)) {
    const userFriendlyErr = `open this page only once`;
    const devErr = ` chat ${chatId} has ${gender} online.`;
    webSocket.close(1000, userFriendlyErr + "\n" + devErr);
  } else {
    existingLiveChat.join(gender, webSocket);
  }
}

function isMemberOfChat(userId, chatId) {
  return true;
}

function getGender(userId, chatId) {
  return userId === 1 ? "male" : "female";
}

function getUserId(req) {
  const params = parse(req.url, true).query;
  const sessionId = params["sid"];

  const sessions = [
    { sid: "11", uid: 1 },
    { sid: "12", uid: 2 },
    { sid: "13", uid: 3 },
    { sid: "14", uid: 4 },
    { sid: "15", uid: 5 },
  ];
  const session = sessions.find((session) => session.sid === `${sessionId}`);
  return session?.uid;
}

function getChatId(req) {
  const slashChatId = req.url;
  const chatId = slashChatId.slice(1);
  return chatId;
}
