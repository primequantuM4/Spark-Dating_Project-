const { AgeFromDateString } = require("age-calculator");

class User {
  constructor(userDocument) {
    this.setProperties(userDocument);
  }

  errorIfInvalidRange(range, properyName) {
    if (range[0] > range[1]) {
      throw new Error(`bad ${properyName} range order-> ${range}`);
    }
  }

  getPublicInfo() {
    const { id, firstName, lastName, age, sex, religion, bio, imageUrl } = this;
    return { id, firstName, lastName, age, sex, religion, bio, imageUrl };
  }

  setProperties(userDocument) {
    //must haves
    this.id = userDocument._id.toString();
    this.firstName = userDocument.firstName;
    this.lastName = userDocument.lastName;

    this.sex = userDocument.sex;
    this.religion = userDocument.religion;

    const birthday = userDocument.birthday;
    const age = new AgeFromDateString(birthday).age;
    this.age = age;

    this.bio = userDocument.bio;
    this.imageUrl = userDocument.imageUrl;

    //TODO delete this
    this.imageUrl =
      this.sex === "male"
        ? "/profile-photos/man.jpeg"
        : "/profile-photos/woman.jpeg";

    //optionals

    if (userDocument.minAge && userDocument.maxAge) {
      this.ageRange = [userDocument.minAge, userDocument.maxAge];
      this.errorIfInvalidRange(this.ageRange, "age range");
    }

    this.religiousPreferences = userDocument.religiousPreferences;

    this.height = userDocument.height;
    if (userDocument.minHeight && userDocument.maxHeight) {
      this.heightRange = [userDocument.minHeight, userDocument.maxHeight];
      this.errorIfInvalidRange(this.heightRange, "height range");
    }
  }

  scoreAge(otherUser) {
    if (!this.ageRange) return 0;
    const othersAge = otherUser.age;

    const min = this.ageRange[0];
    const max = this.ageRange[1];

    if (othersAge < min || othersAge > max) {
      return -1;
    } else {
      const sweetSpot = (min + max) / 2;

      const gap = Math.abs(sweetSpot - othersAge);
      const range = max - min;

      const gapPercent = gap / range; //min= 50%, max = 100%
      return Math.floor(10 - 10 * gapPercent);
    }
  }

  scoreHeight(otherUser) {
    const otherHeight = otherUser.height;
    if (!otherHeight) return 0;
    if (!this.heightRange) return 0;

    const min = this.heightRange[0];
    const max = this.heightRange[1];

    const sweetSpot = (min + max) / 2;

    const gap = Math.abs(sweetSpot - otherHeight);
    const range = max - min;

    const gapPercent = gap / range; //min= 50%, max = 100%
    return Math.floor(10 - 10 * gapPercent);
  }

  evaluateReligion(otherUser) {
    const religion = this.religion;
    const otherReligion = otherUser.religion;

    const religiousPreferences = this.religiousPreferences;
    if (!religiousPreferences) {
      return religion === otherReligion ? 10 : -1;
    } else if (religiousPreferences.includes(otherReligion)) {
      return 10;
    } else {
      return -1;
    }
  }

  score(otherUser) {
    const religionScore = this.evaluateReligion(otherUser);
    if (religionScore < 0) return -1;

    const ageScore = this.scoreAge(otherUser);
    if (ageScore < 0) return -1;

    const heightScore = this.scoreHeight(otherUser);
    if (heightScore < 0) return -1;

    const totalScore = religionScore + ageScore + heightScore;
    return totalScore;
  }
}

module.exports = { User };

function test() {
  const abebe = {
    _id: "abebe",
    birthday: new Date().toLocaleDateString(),
    age: 20,
    sex: "male",
    firstName: "abebe",
    lastName: "kebede",
    height: 150,
    imageUrl: "/images/abebe.jpg",
    minAge: 18,
    maxAge: 22,
    minHeight: 130,
    maxHeight: 170,
    religion: "a",
    religiousPreferences: ["a", "b", "c"],
  };

  const kebede = {
    _id: "chala",
    birthdate: new Date(),
    age: 21,
    sex: "male",
    firstName: "chala",
    lastName: "mamo",
    imageUrl: "/images/chala.jpg",
    religion: "a",
  };

  const beti = {
    _id: "beti",
    birthday: new Date().toLocaleDateString(),

    age: 20,
    sex: "female",
    firstName: "beti",
    lastName: "anberbir",
    height: 150,
    imageUrl: "/images/abebe.jpg",
    minAge: 18,
    maxAge: 22,
    minHeight: 130,
    maxHeight: 170,
    religion: "a",
    religiousPreferences: ["a", "b"],
  };

  const ayelech = {
    _id: "ayelech",
    birthdate: new Date(),
    age: 20,
    sex: "female",
    firstName: "beti",
    lastName: "anberbir",
    imageUrl: "/images/ayelech.jpg",
    religion: "z",
  };

  const abebeUser = new User(abebe);
  //const kebedeUser = new User(kebede);
  const betiUser = new User(beti);
  //const ayelechUser = new User(ayelech);

  console.log(abebeUser.firstName);

  //console.log(abebeUser.scoreAge(betiUser));
  // console.log(abebeUser.scoreHeight(betiUser));
  // console.log(abebeUser.evaluateReligion(betiUser));

  // console.log(abebeUser.score(betiUser));
  // console.log(abebeUser.score(ayelechUser));

  //console.log(betiUser.score(abebeUser));

  //console.log(betiUser.score(kebede));
}
//test();

async function test2() {
  const birthdate = "2000-01-01";
  const result = new AgeFromDateString(birthdate).age;
  console.log(result);
}
//test2();

async function test3() {
  const boy = {
    _id: "63ef138a6d5541e459a5c6af",
    email: "abebe@gmail.com",
    password: "abebe",
    firstName: "Abebe",
    lastName: "Kebede",
    sex: "male",
    religion: "catholic",
    birthday: "2000-01-01",
    bio: "The fault in our dreams",

    religiousPreferences: ["catholic"],

    height: 150,
    minHeight: 100,
    maxHeight: 200,
    minAge: 18,
    maxAge: 30,
  };

  const girl = {
    _id: "63ef13bc6d5541e459a5c6b4",
    email: "mamitu@gmail.com",
    password: "mamitu",
    firstName: "Mamitu",
    lastName: "Anberbir",
    sex: "female",
    religion: "catholic",
    birthday: "2000-01-01",
    bio: "The fault in our dreams",
    religiousPreferences: ["catholic"],
    height: 150,
    minHeight: 100,
    maxHeight: 200,
    minAge: 18,
    maxAge: 30,
    __v: 0,
  };

  const boyUser = new User(boy);
  const girlUser = new User(girl);

  // console.log(boyUser.age);
  // console.log(girlUser.age);

  console.log(boyUser.scoreAge(girlUser));
  console.log(boyUser.scoreHeight(girlUser));
  console.log(boyUser.evaluateReligion(girlUser));
  console.log(girlUser.getPublicInfo());
  //console.log(boyUser.score(girlUser))
}
//test3();
