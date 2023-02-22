const {
  importBoysAndGirls,
  haveMatched,
  haveDisliked,
  hasLiked,
} = require("./suggester-dependencies");

class Suggester {
  constructor(importBoysAndGirls, haveMatched, hasLiked, haveDisliked) {
    this.importBoysAndGirls = importBoysAndGirls;
    this.haveMatched = haveMatched;
    this.hasLiked = hasLiked;
    this.haveDisliked = haveDisliked;

    this.boys; //temporary undefined
    this.girls; //temporary undefined

    this.graph; //dummy for now
  }

  async updateScores() {
    await this.updateUsers();
  }

  async updateUsers() {
    const { boys, girls } = await this.importBoysAndGirls();
    this.boys = boys;
    this.girls = girls;
    this.updateScores();
  }

  async getBoysAndGirls() {
    //to wait if users have not been fetched
    if (this.boys === undefined || this.girls === undefined) {
      await this.updateUsers();
    }
    return { boys: this.boys, girls: this.girls };
  }

  async getSuggestedUsers(userId) {
    const { boys, girls } = await this.getBoysAndGirls();
    const finder = (user) => user.id === userId;
    const user = boys.find(finder) ?? girls.find(finder);
    if (!user) {
      throw new Error(`userId ${userId} not found when suggesting users`);
    }
    const oppositeGenderUsers = user.sex === "male" ? girls : boys;
    const scoreUserPairs = [];

    for (const otherUser of oppositeGenderUsers) {
      const otherScore = user.score(otherUser);
      const myScore = otherUser.score(user);
      const hasLiked = await this.hasLiked(user.id, otherUser.id);
      const haveDisliked = await this.haveDisliked(user.id, otherUser.id);
      const haveMatched = await this.haveMatched(user.id, otherUser.id);
      const isInHideEmails =
        user.hideEmails.includes(otherUser.email) ||
        otherUser.hideEmails.includes(user.email);
      console.log(`
      -------------------
      ${user.hideEmails}
      ${user.email}
      ${otherUser.hideEmails}
      ${otherUser.email}
      -------------------`);

      console.log(haveDisliked, hasLiked, haveMatched, isInHideEmails);
      let score;
      if (
        otherScore < 0 ||
        myScore < 0 ||
        hasLiked ||
        haveDisliked ||
        haveMatched ||
        isInHideEmails
      ) {
        score = -1;
      } else {
        score = otherScore + myScore;
      }

      const scoreUserPair = { score: score, user: otherUser };
      scoreUserPairs.push(scoreUserPair);
    }

    //   scoreUserPairs.forEach((pair) =>
    //   console.log(pair.user.firstName, pair.score)
    // );

    const suggestedUsers = scoreUserPairs
      .filter((scoreUserPair) => scoreUserPair.score >= 0)
      .sort((sup1, sup2) => sup1.score - sup2.score)
      .map((scoreUserPair) => {
        const user = scoreUserPair.user;
        return user.getPublicInfo();
      });
    return suggestedUsers;
  }
}

const suggester = new Suggester(
  importBoysAndGirls,
  haveMatched,
  hasLiked,
  haveDisliked
);
module.exports = { suggester };

async function test() {
  const wanterBoy = { id: "wb", sex: "male", score: () => 10 };
  const eherBoy = { id: "eb", sex: "male", score: () => 5 };
  const neverBoy = { id: "nb", sex: "male", score: () => -1 };
  const boys = [wanterBoy, eherBoy, neverBoy];

  const wanterGirl = { id: "wg", sex: "female", score: () => 10 };
  const eherGirl = { id: "eg", sex: "female", score: () => 5 };
  const neverGirl = { id: "ng", sex: "female", score: () => -1 };
  const girls = [wanterGirl, eherGirl, neverGirl];

  function freshUsers() {
    function importBoysAndGirls() {
      return { boys, girls };
    }
    async function haveMatched() {
      return false;
    }

    async function haveDisliked() {
      return false;
    }

    const suggester = new Suggester(
      importBoysAndGirls,
      haveMatched,
      haveDisliked
    );
    //console.log(suggester);
    //console.log(await suggester.getSuggestions("wb"));
    //console.log(await suggester.getSuggestions("nb"));
    //console.log(await suggester.getSuggestions("eb"));
  }
  //freshUsers()

  async function allMatchedUsers() {
    function importBoysAndGirls() {
      return { boys, girls };
    }
    async function haveMatched() {
      return true;
    }

    async function haveDisliked() {
      return false;
    }

    const suggester = new Suggester(
      importBoysAndGirls,
      haveMatched,
      haveDisliked
    );
    //console.log(suggester);
    console.log(await suggester.getSuggestions("wb"));
    console.log(await suggester.getSuggestions("nb"));
    console.log(await suggester.getSuggestions("eb"));
  }
  //allMatchedUsers();

  async function allDislikedUsers() {
    function importBoysAndGirls() {
      return { boys, girls };
    }
    async function haveMatched() {
      return false;
    }

    async function haveDisliked() {
      return true;
    }

    const suggester = new Suggester(
      importBoysAndGirls,
      haveMatched,
      haveDisliked
    );
    //console.log(suggester);
    console.log(await suggester.getSuggestions("wb"));
    console.log(await suggester.getSuggestions("nb"));
    console.log(await suggester.getSuggestions("eb"));
  }
  //allDislikedUsers();

  async function realUsers() {
    const suggester = new Suggester(
      importBoysAndGirls,
      haveMatched,
      haveDisliked
    );
    console.log(await suggester.getBoysAndGirls());
    console.log(await suggester.getSuggestedUsers("63ef13bc6d5541e459a5c6b4"));
  }
  realUsers();
}
// test();
