const express = require('express');
const multer = require('multer');
const fs = require('fs');
const zlib = require('zlib');
const { simpleParser } = require('mailparser');
const { pool } = require('../database');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/gzip' || file.originalname.endsWith('.gzip')) {
      cb(null, true);
    } else {
      cb(new Error('Only gzip files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper function to calculate readiness score based on HRV value
const calculateReadiness = (hrvValue) => {
  // Simple readiness calculation - you can adjust these thresholds
  if (hrvValue >= 50) return 'green';
  if (hrvValue >= 35) return 'yellow';
  return 'red';
};

// Helper function to parse HRV data from gzipped CSV
const parseHRVData = (filePath) => {
  return new Promise((resolve, reject) => {
    const gunzip = zlib.createGunzip();
    const fileStream = fs.createReadStream(filePath);
    let data = '';

    fileStream.pipe(gunzip)
      .on('data', (chunk) => {
        data += chunk.toString();
      })
      .on('end', () => {
        try {
          const lines = data.trim().split('\n');
          const hrvValues = [];
          
          lines.forEach(line => {
            const parts = line.split(',');
            if (parts.length >= 2) {
              const hrvValue = parseFloat(parts[1]);
              if (!isNaN(hrvValue)) {
                hrvValues.push(hrvValue);
              }
            }
          });

          if (hrvValues.length === 0) {
            reject(new Error('No valid HRV values found in file'));
            return;
          }

          // Calculate average HRV for this session
          const avgHRV = hrvValues.reduce((sum, val) => sum + val, 0) / hrvValues.length;
          const readiness = calculateReadiness(avgHRV);

          resolve({
            hrvValue: Math.round(avgHRV * 100) / 100, // Round to 2 decimal places
            readiness,
            dataPoints: hrvValues.length,
            minHRV: Math.min(...hrvValues),
            maxHRV: Math.max(...hrvValues)
          });
        } catch (error) {
          reject(new Error('Error parsing HRV data: ' + error.message));
        }
      })
      .on('error', (error) => {
        reject(new Error('Error reading gzipped file: ' + error.message));
      });
  });
};

// File upload endpoint
router.post('/upload', upload.single('hrvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get user email from request (you might want to get this from JWT token instead)
    const { userEmail } = req.body;
    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }

    // Find user by email
    const userResult = await pool.query(
      'SELECT id, name FROM users WHERE email = $1 AND user_type = $2',
      [userEmail, 'athlete']
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Athlete not found with this email' });
    }

    const user = userResult.rows[0];

    // Parse HRV data from uploaded file
    const hrvData = await parseHRVData(req.file.path);

    // Store HRV record in database
    const insertResult = await pool.query(
      'INSERT INTO hrv_records (user_id, hrv_value, readiness, recorded_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [user.id, hrvData.hrvValue, hrvData.readiness]
    );

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'HRV data uploaded successfully',
      hrvRecord: {
        id: insertResult.rows[0].id,
        hrvValue: hrvData.hrvValue,
        readiness: hrvData.readiness,
        recordedAt: insertResult.rows[0].recorded_at,
        dataPoints: hrvData.dataPoints,
        minHRV: hrvData.minHRV,
        maxHRV: hrvData.maxHRV
      },
      user: {
        id: user.id,
        name: user.name,
        email: userEmail
      }
    });

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('HRV upload error:', error);
    res.status(500).json({ error: error.message || 'Error processing HRV file' });
  }
});

// Get HRV records for a user
router.get('/records/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 30 } = req.query;

    const result = await pool.query(
      'SELECT * FROM hrv_records WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT $2',
      [userId, limit]
    );

    res.json({
      records: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get HRV records error:', error);
    res.status(500).json({ error: 'Error fetching HRV records' });
  }
});

// Get latest HRV record for a user
router.get('/latest/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      'SELECT * FROM hrv_records WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No HRV records found' });
    }

    res.json({
      record: result.rows[0]
    });
  } catch (error) {
    console.error('Get latest HRV record error:', error);
    res.status(500).json({ error: 'Error fetching latest HRV record' });
  }
});

// Email webhook endpoint for SendGrid Inbound Parse
router.post('/email-webhook', async (req, res) => {
  try {
    console.log('Email webhook received:', req.body);
    
    // SendGrid sends the email data in req.body
    const emailData = req.body;
    
    // Parse the email using mailparser
    const parsed = await simpleParser(emailData);
    
    console.log('Email from:', parsed.from?.text);
    console.log('Email subject:', parsed.subject);
    console.log('Attachments:', parsed.attachments?.length || 0);
    
    // Extract sender email
    const senderEmail = parsed.from?.value?.[0]?.address;
    if (!senderEmail) {
      console.log('No sender email found');
      return res.status(400).json({ error: 'No sender email found' });
    }
    
    // Find user by email
    const userResult = await pool.query(
      'SELECT id, name FROM users WHERE email = $1 AND user_type = $2',
      [senderEmail, 'athlete']
    );
    
    if (userResult.rows.length === 0) {
      console.log('Athlete not found for email:', senderEmail);
      return res.status(404).json({ error: 'Athlete not found with this email' });
    }
    
    const user = userResult.rows[0];
    console.log('Found user:', user.name);
    
    // Process attachments
    if (!parsed.attachments || parsed.attachments.length === 0) {
      console.log('No attachments found');
      return res.status(400).json({ error: 'No attachments found' });
    }
    
    const results = [];
    
    for (const attachment of parsed.attachments) {
      try {
        console.log('Processing attachment:', attachment.filename);
        
        // Check if it's a gzip file
        if (!attachment.filename.endsWith('.gzip') && !attachment.filename.endsWith('.gz')) {
          console.log('Skipping non-gzip file:', attachment.filename);
          continue;
        }
        
        // Save attachment temporarily
        const tempPath = `uploads/email_${Date.now()}_${attachment.filename}`;
        fs.writeFileSync(tempPath, attachment.content);
        
        // Parse HRV data
        const hrvData = await parseHRVData(tempPath);
        
        // Store HRV record in database
        const insertResult = await pool.query(
          'INSERT INTO hrv_records (user_id, hrv_value, readiness, recorded_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
          [user.id, hrvData.hrvValue, hrvData.readiness]
        );
        
        // Clean up temp file
        fs.unlinkSync(tempPath);
        
        results.push({
          filename: attachment.filename,
          hrvRecord: {
            id: insertResult.rows[0].id,
            hrvValue: hrvData.hrvValue,
            readiness: hrvData.readiness,
            recordedAt: insertResult.rows[0].recorded_at,
            dataPoints: hrvData.dataPoints,
            minHRV: hrvData.minHRV,
            maxHRV: hrvData.maxHRV
          }
        });
        
        console.log('Successfully processed:', attachment.filename);
        
      } catch (error) {
        console.error('Error processing attachment:', attachment.filename, error);
        results.push({
          filename: attachment.filename,
          error: error.message
        });
      }
    }
    
    res.json({
      message: 'Email processed successfully',
      user: {
        id: user.id,
        name: user.name,
        email: senderEmail
      },
      results
    });
    
  } catch (error) {
    console.error('Email webhook error:', error);
    res.status(500).json({ error: error.message || 'Error processing email' });
  }
});

module.exports = router; 