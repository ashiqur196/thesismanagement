const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// 1. Create upload directories if they don't exist
const initUploadDirs = () => {
  const directories = [
    path.join(__dirname, "./uploads"),
    path.join(__dirname, "./uploads/profiles"),
    path.join(__dirname, "./uploads/documents"),
    path.join(__dirname, "./uploads/gallery"),
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
};
initUploadDirs();

// 2. File Type Whitelists
const FILE_TYPES = {
  IMAGE: ["image/jpeg", "image/png", "image/webp"],
  DOCUMENT: [
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  ],
};

// 3. Custom Error Class (for consistent error formatting)
class UploadError extends Error {
  constructor(message) {
    super(message);
    this.name = "UploadError";
  }
}

// 4. Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, "../uploads");

    if (file.fieldname === "image")
      uploadPath = path.join(uploadPath, "profiles");
    if (file.fieldname === "document")
      uploadPath = path.join(uploadPath, "documents");
    if (file.fieldname === "gallery")
      uploadPath = path.join(uploadPath, "gallery");

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);

    // keep the original filename, but sanitize only dangerous characters for FS
    const safeName = baseName.replace(/[/\\?%*:|"<>]/g, "_");

    cb(null, `${safeName}-${uuidv4()}${ext}`);
  },
});

// 5. File Validation Middleware
const validateFile = (file, allowedTypes) => {
  if (!allowedTypes.includes(file.mimetype)) {
    throw new UploadError(
      `Invalid file type. Allowed: ${allowedTypes
        .map((t) => t.split("/")[1])
        .join(", ")}`
    );
  }
};

// 6. Configure Multer Instances
const createUploader = (options) => {
  return multer({
    storage,
    fileFilter: (req, file, cb) => {
      try {
        validateFile(file, options.allowedTypes);
        cb(null, true);
      } catch (err) {
        cb(err);
      }
    },
    limits: options.limits,
  })[options.method](options.fieldName);
};

// 7. Pre-configured Uploaders
const uploaders = {
  profileImage: createUploader({
    method: "single",
    fieldName: "image",
    allowedTypes: FILE_TYPES.IMAGE,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  }),

  document: createUploader({
    method: "single",
    fieldName: "document",
    allowedTypes: FILE_TYPES.DOCUMENT,
    limits: { fileSize: 10 * 1024 * 1024 }, // 5MB
  }),

  gallery: createUploader({
    method: "array",
    fieldName: "gallery",
    allowedTypes: FILE_TYPES.IMAGE,
    limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5MB/file, max 10
  }),
};

// 8. Error Handling Wrapper (Matches your {success, message} format)
const handleUpload = (uploader) => (req, res, next) => {
  uploader(req, res, (err) => {
    console.log(err);
    if (err) {
      return res.status(400).json({
        success: false,
        message:
          err instanceof UploadError
            ? err.message
            : err.code === "LIMIT_FILE_SIZE"
            ? "File size exceeds limit"
            : "File upload failed",
      });
    }
    next();
  });
};

// 9. Export Ready-to-Use Middlewares
module.exports = {
  uploadProfileImage: handleUpload(uploaders.profileImage),
  uploadDocument: handleUpload(uploaders.document),
  uploadGallery: handleUpload(uploaders.gallery),
  FILE_TYPES, // Optional: Export for reference
};
