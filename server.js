// NEOFAVICON :: CORE SYSTEM
// Image Conversion Engine v1.0.0
// Copyright 2025 :: All rights reserved

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const chalk = require('chalk'); // For colorful console logs
const unlinkAsync = promisify(fs.unlink);

// ======== SYSTEM INITIALIZATION ========
console.log(chalk.cyan(`
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ███▄▄▓▓▓▒▒░░  NEOFAVICON SYSTEM  ░░▒▒▓▓▓▄▄███ █
█                                                █
█           IMAGE CONVERSION ENGINE              █
█                                                █
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
`));

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// ======== STORAGE CONFIGURATION ========
// Set up multer for file uploads with custom filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `upload-${timestamp}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg)$/i)) {
      return cb(new Error('ERROR: Only image files are allowed.'), false);
    }
    cb(null, true);
  }
});

// ======== MIDDLEWARE ========
app.use(express.static('public'));

// Custom logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(chalk.blue(`[${timestamp}]`) + chalk.green(` ${req.method}`) + ` ${req.url}`);
  next();
});

// ======== ROUTES ========
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle file upload and conversion
app.post('/convert', upload.single('image'), async (req, res) => {
  console.log(chalk.cyan('>> INITIATING CONVERSION PROCESS'));
  
  try {
    if (!req.file) {
      console.log(chalk.red('!! ERROR: No file uploaded'));
      return res.status(400).json({ 
        error: 'No file uploaded',
        status: 'ERROR',
        code: 'E_NO_FILE' 
      });
    }

    // Get uploaded file path
    const filePath = req.file.path;
    const originalFilename = req.file.originalname;
    
    console.log(chalk.yellow(`>> PROCESSING: ${originalFilename}`));
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'public', 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate unique token for this conversion
    const timestamp = Date.now();
    const conversionToken = `${timestamp}-${Math.random().toString(36).substring(2, 10)}`;
    const outputPath = path.join(outputDir, `favicon-${conversionToken}.ico`);
    const publicPath = `/output/favicon-${conversionToken}.ico`;

    console.log(chalk.yellow('>> GENERATING ICO FORMAT'));
    
    // Convert to favicon (multiple sizes for best compatibility)
    await sharp(filePath)
      .resize(16, 16)
      .toFormat('ico')
      .toFile(outputPath);
    
    console.log(chalk.yellow('>> GENERATING ADDITIONAL FORMATS'));
    
    // Create multiple favicon sizes
    const sizes = [32, 48, 64];
    const additionalFiles = [];
    
    for (const size of sizes) {
      const pngPath = path.join(outputDir, `favicon-${size}x${size}-${conversionToken}.png`);
      const publicPngPath = `/output/favicon-${size}x${size}-${conversionToken}.png`;
      
      await sharp(filePath)
        .resize(size, size)
        .toFormat('png')
        .toFile(pngPath);
      
      additionalFiles.push({
        path: publicPngPath,
        size: `${size}x${size}`,
        format: 'PNG'
      });
    }

    // Log file data
    console.log(chalk.yellow('>> ANALYZING IMAGE METADATA'));
    const metadata = await sharp(filePath).metadata();
    
    // Clean up uploaded file
    await unlinkAsync(filePath);
    console.log(chalk.green('>> CONVERSION COMPLETE'));

    // Return success response with link to favicon
    res.json({
      success: true,
      status: 'SUCCESS',
      message: 'Favicon generated successfully',
      conversionId: conversionToken,
      timestamp: new Date().toISOString(),
      originalFile: {
        name: originalFilename,
        type: req.file.mimetype,
        size: req.file.size,
        dimensions: {
          width: metadata.width,
          height: metadata.height,
        }
      },
      output: {
        ico: {
          path: publicPath,
          size: '16x16',
          format: 'ICO'
        },
        additional: additionalFiles
      },
      system: {
        processingTime: Date.now() - timestamp,
        version: '1.0.0'
      }
    });
  } catch (error) {
    console.error(chalk.red('!! ERROR DURING CONVERSION:'), error);
    res.status(500).json({ 
      error: 'Failed to convert image',
      message: error.message,
      status: 'ERROR',
      code: 'E_CONVERSION_FAILED'
    });
  }
});

// ======== SERVER INITIALIZATION ========
app.listen(port, () => {
  console.log(chalk.cyan(`
┌─────────────────────────────────────────────┐
│  NEOFAVICON SYSTEM INITIALIZED              │
│  PORT: ${port}                              │
│  ENV: ${process.env.NODE_ENV || 'development'} │
│  TIME: ${new Date().toISOString()}          │
└─────────────────────────────────────────────┘
`));
  
  console.log(chalk.green('>> SYSTEM ONLINE'));
  console.log(chalk.yellow('>> WAITING FOR INPUT'));
});

// ======== ERROR HANDLING ========
app.use((err, req, res, next) => {
  console.error(chalk.red('!! SYSTEM ERROR:'), err.stack);
  res.status(500).json({
    error: 'Internal server error',
    status: 'ERROR',
    code: 'E_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'Server error occurred' : err.message
  });
});

// Catch-all route for undefined paths
app.use('*', (req, res) => {
  console.log(chalk.yellow(`!! 404 NOT FOUND: ${req.originalUrl}`));
  res.status(404).json({
    error: 'Endpoint not found',
    status: 'ERROR',
    code: 'E_NOT_FOUND'
  });
});

// Graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
  console.log(chalk.yellow('>> SYSTEM SHUTDOWN INITIATED'));
  
  // Clean temporary files
  const uploadDir = path.join(__dirname, 'uploads');
  if (fs.existsSync(uploadDir)) {
    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        console.error(chalk.red('!! ERROR CLEANING UPLOADS:'), err);
      } else {
        files.forEach(file => {
          fs.unlinkSync(path.join(uploadDir, file));
        });
        console.log(chalk.green('>> TEMP FILES CLEANED'));
      }
      
      console.log(chalk.cyan(`
┌─────────────────────────────────────────────┐
│  NEOFAVICON SYSTEM SHUTDOWN COMPLETE        │
│  TIME: ${new Date().toISOString()}          │
└─────────────────────────────────────────────┘
`));
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}