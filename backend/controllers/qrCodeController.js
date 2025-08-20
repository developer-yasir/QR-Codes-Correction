const csv = require('csv-parser');
const fs = require('fs');
const plantMapping = require('../config/plantMapping');

let latestQrCodes = []; // In-memory storage for the latest processed QR codes

exports.uploadCsv = (req, res) => {
  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const qrCodes = results.map(row => {
          const qrCode = row['QR Code - Handling Unit'];
          const fourthDigit = String(qrCode.substring(3, 4));
          console.log(`QR Code: ${qrCode}, Fourth Digit: ${fourthDigit}, Mapped Value: ${plantMapping[fourthDigit]}`);
          const acPlant = plantMapping[fourthDigit] || 'Unknown';
          return { qrCode, acPlant };
        });

        latestQrCodes = qrCodes; // Store the latest processed QR codes in memory
        fs.unlinkSync(filePath); // remove the uploaded file after processing
        res.status(201).json({ message: 'CSV data imported successfully' });
      } catch (error) {
        fs.unlinkSync(filePath); // Always remove the uploaded file
        res.status(500).json({ message: 'Error importing CSV data', error });
      }
    });
};

exports.getQrCodes = (req, res) => {
  res.status(200).json(latestQrCodes);
};