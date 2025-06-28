const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_APIKEY,
  api_secret: process.env.CLOUD_APISECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'safeWalkUserprofile',
    allowedFormats: ['jpg', 'png'], 
     transformation: [
    { gravity: "face" , zoom : 1.9}
  ],
    public_id: (req, file) => {
      const baseName = file.originalname.split('.')[0].replace(/\s+/g, '_');
      return `${baseName}_${Date.now()}`;
    },
  },
});

module.exports = { cloudinary, storage };
