
const express = require('express');
const router = express.Router();
const multer = require('multer');
const qrCodeController = require('../controllers/qrCodeController');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('csvFile'), qrCodeController.uploadCsv);
router.get('/qrcodes', qrCodeController.getQrCodes);

module.exports = router;
