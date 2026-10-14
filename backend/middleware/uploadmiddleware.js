const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =========================================================
// UPLOAD DIRECTORY
// =========================================================

const uploadDirectory = path.join(
  __dirname,
  "../uploads"
);

// Create uploads folder automatically
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// =========================================================
// STORAGE
// =========================================================

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },

  filename: function (req, file, cb) {

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },

});

// =========================================================
// FILE FILTER
// =========================================================

const fileFilter = (req, file, cb) => {

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

  if (allowedTypes.includes(file.mimetype)) {

    cb(null, true);

  } else {

    cb(
      new Error(
        "Only PDF, JPG, JPEG and PNG files are allowed"
      ),
      false
    );

  }
};

// =========================================================
// MULTER
// =========================================================

const upload = multer({

  storage: storage,

  fileFilter: fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

});

module.exports = upload;