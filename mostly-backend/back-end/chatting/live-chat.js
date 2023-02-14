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
  }

  _getOtherGender(gender) {
    if (gender === "male") return "female";
    else if (gender === "female") return "male";
    else throw new Error(`${gender} not found`);
  }

  _addEventHandlers(gender) {
    const webSocket = this.genderSocketPairs[gender];
    const otherGender = this._getOtherGender(gender);

    webSocket.on("message", (message) => {
      message = message.toString();
      this._saveMessageToDb(gender, message);

      if (this.isOnline(otherGender)) {
        this._transferMessage(otherGender, message);
      } else {
        this._countAsUnread(gender);
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

  _saveMessageToDb(senderGender, message) {
    console.log("saving", senderGender, message);
  }

  _transferMessage(recieverGender, message) {
    const recieverWebSocket = this.genderSocketPairs[recieverGender];
    recieverWebSocket.send(message, { binary: false });
  }

  _countAsUnread(recieverUserId) {
    console.log(`${recieverUserId} did not read message`);
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
  }
}

module.exports = { LiveChat };
