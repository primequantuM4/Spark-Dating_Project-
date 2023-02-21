const { AgeFromDateString } = require("age-calculator");
const { getDistance } = require("geolib");

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
    const { id, firstName, lastName, age, sex, religion, bio, photoUrl } = this;
    return { id, firstName, lastName, age, sex, religion, bio, photoUrl };
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
    this.photoUrl = userDocument.photoUrl;

    //optionals

    if (userDocument.minAge && userDocument.maxAge) {
      this.ageRange = [userDocument.minAge, userDocument.maxAge];
      this.errorIfInvalidRange(this.ageRange, "age range");
    } else {
      this.ageRange = null;
    }

    this.religiousPreferences = userDocument.religiousPreferences?.length
      ? userDocument.religiousPreferences
      : null;

    this.height = userDocument.height;
    if (userDocument.minHeight && userDocument.maxHeight) {
      this.heightRange = [userDocument.minHeight, userDocument.maxHeight];
      this.errorIfInvalidRange(this.heightRange, "height range");
    } else {
      this.heightRange = null;
    }

    this.hobbies = userDocument.hobbies?.length ? userDocument.hobbies : null;
    this.educationLevel = userDocument.educationLevel || null;
    this.preferredEducationLevel = userDocument.preferredEducationLevel || null;

    this.latitude = userDocument.latitude || null;
    this.longitude = userDocument.longitude || null;
    this.kmRadius = userDocument.kmRadius || null;
  }

  scoreAge(otherUser) {
    let score;
    if (this.ageRange && otherUser.age) {
      const othersAge = otherUser.age;

      const min = this.ageRange[0];
      const max = this.ageRange[1];

      if (othersAge < min || othersAge > max) {
        score = -1;
      } else {
        const sweetSpot = (min + max) / 2;

        const gap = Math.abs(sweetSpot - othersAge);
        const range = max - min;

        const gapPercent = gap / range; //min= 50%, max = 100%
        score = Math.floor(10 - 10 * gapPercent);
      }
    } else {
      score = 0;
    }

    console.log(`
      ${this.firstName} score age ${otherUser.firstName} = ${score}
      `);
    return score;
  }

  scoreHeight(otherUser) {
    const otherHeight = otherUser.height;
    let score;
    if (!otherHeight) {
      score = 0;
    } else if (!this.heightRange) {
      score = 0;
    } else {
      const min = this.heightRange[0];
      const max = this.heightRange[1];

      const sweetSpot = (min + max) / 2;

      const gap = Math.abs(sweetSpot - otherHeight);
      const range = max - min;

      const gapPercent = gap / range; //min= 50%, max = 100%
      score = Math.floor(10 - 10 * gapPercent);
    }

    console.log(`
    ${this.firstName} score height ${otherUser.firstName} = ${score}
    `);

    return score;
  }

  evaluateReligion(otherUser) {
    const religion = this.religion;
    const otherReligion = otherUser.religion;
    const religiousPreferences = this.religiousPreferences;
    let score;

    if (!religiousPreferences) {
      score = religion === otherReligion ? 10 : -1;
    } else if (religiousPreferences.includes(otherReligion)) {
      score = 10;
    } else {
      score = -1;
    }
    console.log(`
    ${this.firstName} score religion ${otherUser.firstName} = ${score}
    `);
    return score;
  }

  scoreEducationLevel(otherUser) {
    const preferredEducationLevel = this.preferredEducationLevel;
    const otherEducationLevel = otherUser.educationLevel;
    let score;
    if (!preferredEducationLevel || !otherEducationLevel) {
      score = 0;
    } else if (otherEducationLevel >= preferredEducationLevel) {
      score = 10;
    } else {
      score = -1;
    }

    console.log(`
    ${this.firstName} score educationlevel ${otherUser.firstName} = ${score}
    `);
    return score;
  }

  scoreHobbies(otherUser) {
    const myHobbies = this.hobbies;
    const otherHobbies = otherUser.hobbies;
    let score;
    if (!myHobbies || !otherHobbies) {
      score = 0;
    } else {
      let sharedHobbiesCount = 0;
      for (const myHobby of myHobbies) {
        if (otherHobbies.includes(myHobby)) sharedHobbiesCount++;
      }
      score = (10 * sharedHobbiesCount) / myHobbies.length;
    }
    console.log(`
    ${this.firstName} score hobbies ${otherUser.firstName} = ${score}
    `);
    return score;
  }

  getDistance(otherUser) {
    const myLat = this.latitude;
    const myLong = this.longitude;

    const otherLat = otherUser.latitude;
    const otherLong = otherUser.longitude;

    let kmDistance;
    if (!myLat || !myLong || !otherLat || !otherLong) {
      kmDistance = null;
    } else {
      const meterDistance = getDistance(
        {
          latitude: myLat,
          longitude: myLong,
        },
        {
          latitude: otherLat,
          longitude: otherLong,
        }
      );
      kmDistance = Math.round(meterDistance / 1000);
    }

    console.log(`
    ${this.firstName} calculate distance ${otherUser.firstName} = ${kmDistance}
    `);

    return kmDistance;
  }

  scoreLocation(otherUser) {
    const kmDistance = this.getDistance(otherUser);
    const kmRadius = this.kmRadius;
    let score;
    if (kmDistance !== null && kmRadius && kmDistance <= kmRadius) {
      score = 10;
    } else {
      score = 0;
    }

    console.log(`
    ${this.firstName} score location ${otherUser.firstName} = ${score}
    kmDistance was ${kmDistance}
    kmRadius was ${kmRadius}
    kmDistance < kmRadius = ${kmDistance < kmRadius}
    `);
    return score;
  }

  score(otherUser) {
    const scores = [
      this.scoreAge(otherUser),
      this.scoreHeight(otherUser),
      this.evaluateReligion(otherUser),
      this.scoreEducationLevel(otherUser),
      this.scoreHobbies(otherUser),
      this.scoreLocation(otherUser),
    ];

    console.log(`scores are ${scores}`);
    //if any -1, return -1
    for (const score of scores) {
      if (score < 0) {
        console.log(`
        ${this.firstName} score ${otherUser.firstName} is -1.
        look at ${scores}
        `);
      }
    }

    const summer = (cumulativeScore, score) => cumulativeScore + score;

    const score = scores.reduce(summer, 0);
    console.log(`
        ${this.firstName} score ${otherUser.firstName} is ${score}
        `);
    return score;
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

function perfectMatchTest() {
  const boy = {
    _id: "63f46af3a801243bfd93b4c9",
    email: "man1@gmail.com",
    password: "man",
    firstName: "Man",
    lastName: "Man",
    sex: "male",
    religion: "catholic",
    birthday: "2000-01-01",
    bio: "The fault in our dreams",
    photoUrl: "/profile-pictures/f0fd6534-3485-4f77-9078-52d95cc102b5.jpeg",
    religiousPreferences: [
      "catholic",
      "judaism",
      "musliim",
      "orthodox",
      "protestant",
      "other",
    ],
    height: 150,
    minHeight: 100,
    maxHeight: 200,
    minAge: 20,
    maxAge: 26,
    hobbies: ["movies", "picnic-at-mars", "the-office"],
    educationLevel: 30,
    preferredEducationLevel: 30,
    shouldSaveLocation: null,
    latitude: 868.2354337683338,
    longitude: 639.8107214424722,
    kmRadius: 100000000000000000.0,
    __v: 0,
  };
  const girl = {
    _id: "63f46af3a801243bfd93b4c9",
    email: "woman1@gmail.com",
    password: "Woman",
    firstName: "Woman",
    lastName: "Woman",
    sex: "female",
    religion: "catholic",
    birthday: "2000-01-01",
    bio: "The fault in our dreams",
    photoUrl: "/profile-pictures/f0fd6534-3485-4f77-9078-52d95cc102b5.jpeg",
    religiousPreferences: [
      "catholic",
      "judaism",
      "musliim",
      "orthodox",
      "protestant",
      "other",
    ],
    height: 150,
    minHeight: 100,
    maxHeight: 200,
    minAge: 20,
    maxAge: 26,
    hobbies: ["movies", "picnic-at-mars", "the-office"],
    educationLevel: 30,
    preferredEducationLevel: 30,
    shouldSaveLocation: null,
    latitude: 868.2354337683338,
    longitude: 639.8107214424722,
    kmRadius: 100000000000000000.0,
    __v: 0,
  };

  const boyUser = new User(boy);
  const girlUser = new User(girl);

  //boyUser.scoreAge(girlUser);
  //boyUser.scoreHeight(girlUser);
  //boyUser.evaluateReligion(girlUser);
  //boyUser.scoreEducationLevel(girlUser);
  // boyUser.scoreEducationLevel(girlUser);
  //boyUser.scoreHobbies(girlUser);
  // boyUser.scoreLocation(girlUser);
  boyUser.score(girlUser);
}

//perfectMatchTest();

function miminalistMatchesTest1() {
  const boy = {
    _id: "63f46af3a801243bfd93b4c9",
    email: "man1@gmail.com",
    password: "man",
    firstName: "Man",
    lastName: "Man",
    sex: "male",
    religion: "catholic",
    birthday: "2000-01-01",
    bio: "The fault in our dreams",
    photoUrl: "/profile-pictures/f0fd6534-3485-4f77-9078-52d95cc102b5.jpeg",
    religiousPreferences: [],
    hobbies: [],
    __v: 0,
  };
  const girl = {
    _id: "63f46af3a801243bfd93b4c9",
    email: "woman1@gmail.com",
    password: "Woman",
    firstName: "Woman",
    lastName: "Woman",
    sex: "female",
    religion: "catholic",
    birthday: "2000-01-01",
    bio: "The fault in our dreams",
    photoUrl: "/profile-pictures/f0fd6534-3485-4f77-9078-52d95cc102b5.jpeg",
    religiousPreferences: [],
    hobbies: [],
    __v: 0,
  };

  const boyUser = new User(boy);
  const girlUser = new User(girl);

  boyUser.scoreAge(girlUser);
  boyUser.scoreHeight(girlUser);
  boyUser.evaluateReligion(girlUser);
  boyUser.scoreEducationLevel(girlUser);
  boyUser.scoreHobbies(girlUser);
  boyUser.scoreLocation(girlUser);
  boyUser.score(girlUser);
}

// miminalistMatchesTest();

function minimalWithMaximalTest() {
  const boy = {
    _id: "63f46af3a801243bfd93b4c9",
    email: "man1@gmail.com",
    password: "man",
    firstName: "Man",
    lastName: "Man",
    sex: "male",
    religion: "catholic",
    birthday: "2000-01-01",
    bio: "The fault in our dreams",
    photoUrl: "/profile-pictures/f0fd6534-3485-4f77-9078-52d95cc102b5.jpeg",
    religiousPreferences: [],
    hobbies: [],
    __v: 0,
  };
  const girl = {
    _id: "63f46af3a801243bfd93b4c9",
    email: "woman1@gmail.com",
    password: "Woman",
    firstName: "Woman",
    lastName: "Woman",
    sex: "female",
    religion: "catholic",
    birthday: "2000-01-01",
    bio: "The fault in our dreams",
    photoUrl: "/profile-pictures/f0fd6534-3485-4f77-9078-52d95cc102b5.jpeg",
    religiousPreferences: [
      "catholic",
      "judaism",
      "musliim",
      "orthodox",
      "protestant",
      "other",
    ],
    height: 150,
    minHeight: 100,
    maxHeight: 200,
    minAge: 20,
    maxAge: 26,
    hobbies: ["movies", "picnic-at-mars", "the-office"],
    educationLevel: 30,
    preferredEducationLevel: 30,
    shouldSaveLocation: null,
    latitude: 868.2354337683338,
    longitude: 639.8107214424722,
    kmRadius: 100000000000000000.0,
    __v: 0,
  };

  const boyUser = new User(boy);
  const girlUser = new User(girl);

  // boyUser.scoreAge(girlUser);
  // boyUser.scoreHeight(girlUser);
  // boyUser.evaluateReligion(girlUser);
  // boyUser.scoreEducationLevel(girlUser);
  // boyUser.scoreHobbies(girlUser);
  // boyUser.scoreLocation(girlUser);
  boyUser.score(girlUser);

  girlUser.score(boyUser);
}

// minimalWithMaximalTest();
