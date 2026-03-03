const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Support multiple upload destinations based on fieldname
const cnicDir = path.resolve(__dirname, '..', '..', 'uploads', 'cnic');
const licenseDir = path.resolve(__dirname, '..', '..', 'uploads', 'license');
const avatarsDir = path.resolve(__dirname, '..', '..', 'uploads', 'avatars');
const propertiesDir = path.resolve(__dirname, '..', '..', 'uploads', 'properties');
const verificationDir = path.resolve(__dirname, '..', '..', 'uploads', 'verification');

[cnicDir, licenseDir, avatarsDir, propertiesDir, verificationDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fieldname = (file.fieldname || '').toLowerCase();
    if (fieldname.includes('license')) {
      cb(null, licenseDir);
    } else if (fieldname.includes('avatar')) {
      cb(null, avatarsDir);
    } else if (fieldname.includes('verification')) {
      cb(null, verificationDir);
    } else if (fieldname.includes('property') || fieldname.includes('image')) {
      cb(null, propertiesDir);
    } else {
      cb(null, cnicDir);
    }
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${timestamp}_${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const mimetype = file.mimetype || '';
  if (file.fieldname && file.fieldname.toLowerCase().includes('license')) {
    // allow images and PDFs for license documents
    if (mimetype.startsWith('image/') || mimetype === 'application/pdf') return cb(null, true);
    return cb(new Error('Only image or PDF files are allowed for license uploads'), false);
  }
  // CNIC images only
  if (mimetype.startsWith('image/')) return cb(null, true);
  return cb(new Error('Only image files are allowed for CNIC uploads'), false);
};

const limits = {
  fileSize: 10 * 1024 * 1024 // 10 MB for broader support
};

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
