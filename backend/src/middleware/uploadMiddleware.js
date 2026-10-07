const multer = require('multer');
const path = require('path');

// Store files in memory buffer so raw bytes can be hashed without disk persistence
const storage = multer.memoryStorage();

// Allowed file extensions
const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.xls', '.xlsx', '.txt'
];

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/octet-stream' // sometimes sent by generic clients for binary files
];

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const isValidExt = ALLOWED_EXTENSIONS.includes(ext);
  const isValidMime = ALLOWED_MIME_TYPES.includes(file.mimetype);

  if (isValidExt || isValidMime) {
    return cb(null, true);
  }

  const error = new Error(`Unsupported file type. Supported types: PDF, DOC, DOCX, JPG, JPEG, PNG, XLS, XLSX, TXT.`);
  error.statusCode = 400;
  return cb(error, false);
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25 MB max limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
