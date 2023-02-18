const { MatchDbModel } = require("../models/match-db-model");

class LiveChat {
  constructor(gender, webSocket, chatId, liveChats) {
    this.chatId = chatId;
    this.liveChats = liveChats;
    this.genderSocketPairs = {
      male: undefined,
      female: undefined,
    };

    this.genderSocketPairs[gender] = webSocket;
    this._addEventHandlers(gender);
    this._resetUnreadCount(gender);
  }

  _getOtherGender(gender) {
    if (gender === "male") return "female";
    else if (gender === "female") return "male";
    else throw new Error(`${gender} not found`);
  }

  _addEventHandlers(gender) {
    const webSocket = this.genderSocketPairs[gender];
    const otherGender = this._getOtherGender(gender);

    webSocket.on("message", async (message) => {
      message = message.toString();
      await this._saveMessageToDb(gender, message);

      if (this.isOnline(otherGender)) {
        this._transferMessage(otherGender, message);
      } else {
        await this._countAsUnread(otherGender);
      }
    });

    webSocket.on("close", () => {
      this.genderSocketPairs[gender] = undefined;
      if (this.genderSocketPairs[otherGender] === undefined) {
        this._deleteSelf();
      }
    });
  }

  _deleteSelf() {
    this.liveChats[this.chatId] = undefined;
  }

  async _saveMessageToDb(senderGender, message) {
    const messageInDocument = {
      content: message,
      sentByBoy: senderGender === "male",
    };
    const result = await MatchDbModel.findOneAndUpdate(
      { _id: this.chatId },
      {
        $push: { messages: messageInDocument },
      }
    );
    console.log("saved message to db");
  }

  _transferMessage(recieverGender, message) {
    const recieverWebSocket = this.genderSocketPairs[recieverGender];
    recieverWebSocket.send(message, { binary: false });
  }

  async _countAsUnread(recieverGender) {
    console.log(`${recieverGender} did not read message`);

    let updateCommand;
    if (recieverGender === "male") {
      updateCommand = { $inc: { unreadByBoyCount: 1 } };
    } else {
      updateCommand = { $inc: { unreadByGirlCount: 1 } };
    }

    const result = await MatchDbModel.findOneAndUpdate(
      { _id: this.chatId },
      updateCommand
    );
  }

  async _resetUnreadCount(gender) {
    let updateCommand;
    if (gender === "male") {
      updateCommand = { unreadByBoyCount: 0 };
    } else {
      updateCommand = { unreadByGirlCount: 0 };
    }

    const result = await MatchDbModel.findOneAndUpdate(
      { _id: this.chatId },
      updateCommand
    );
  }

  //public
  isOnline(userId) {
    return this.genderSocketPairs[userId] !== undefined;
  }

  join(gender, webSocket) {
    if (this.isOnline(gender)) {
      const errorMessage = `cant join, ${gender} in ${this.chatId} is online already`;
      throw new Error(errorMessage);
    }
    this.genderSocketPairs[gender] = webSocket;

    const otherGender = this._getOtherGender(gender);
    if (!this.isOnline(otherGender)) {
      throw new Error(`one offline even after joining chat ${this.chatId}`);
    }

    this._addEventHandlers(gender);
    this._resetUnreadCount(gender);
  }
}

module.exports = { LiveChat };
