const path = require("path");
const uuid4 = require("uuid4");
const multer = require("multer");

const diskStorageInstructions = multer.diskStorage({
  filename: (req, file, next) => {
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const randomString = uuid4();
    const newName = randomString + extension;
    next(null, newName);
  },

  destination: (req, file, next) => {
    console.log(__dirname);
    const destinationPath = path.join(
      __dirname,
      "../",
      "../",
      "front-end",
      "public",
      "profile-pictures"
    );
    next(null, destinationPath);
  },
});

const multerMiddlewareGiver = multer({
  storage: diskStorageInstructions,
});

const profilePictureMulter = multerMiddlewareGiver.single("profilePicture");

module.exports = { profilePictureMulter };
