const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * Process and resize image to 3:2 aspect ratio
 * Creates optimized versions for web display
 * 
 * @param {string} inputPath - Path to the uploaded image
 * @param {string} outputFilename - Desired output filename (without extension)
 * @returns {Promise<string>} - Path to the processed image
 */
async function processImage(inputPath, outputFilename) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`Processing image: ${inputPath}`);
    console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);
    
    // Target dimensions for 3:2 ratio
    // Optimize for web display - max 750px width for balanced screen fit
    let targetWidth = 750;
    let targetHeight = 500; // 750 * 2/3 = 500 (3:2 ratio)
    
    // If original is smaller, use original width but maintain 3:2 ratio
    if (metadata.width < targetWidth) {
      targetWidth = metadata.width;
      targetHeight = Math.round(targetWidth * 2 / 3);
    }
    
    // Calculate how to fit the image into 3:2 ratio
    // Use 'cover' to ensure exact 3:2 ratio by cropping if needed
    const resizeOptions = {
      width: targetWidth,
      height: targetHeight,
      fit: 'cover', // Crop to exact ratio if needed
      position: 'center' // Center the crop
    };
    
    // Generate output path
    const outputPath = path.join(path.dirname(inputPath), `processed-${outputFilename}.jpg`);
    
    // Process and optimize the image
    await image
      .resize(resizeOptions)
      .jpeg({
        quality: 85, // Good quality with reasonable file size
        progressive: true, // Progressive loading
        mozjpeg: true // Use mozjpeg for better compression
      })
      .toFile(outputPath);
    
    // Get processed image info
    const processedInfo = await sharp(outputPath).metadata();
    console.log(`Processed dimensions: ${processedInfo.width}x${processedInfo.height}`);
    console.log(`Output: ${outputPath}`);
    
    // Delete original file to save space
    try {
      await fs.unlink(inputPath);
      console.log(`Deleted original file: ${inputPath}`);
    } catch (err) {
      console.warn(`Could not delete original file: ${err.message}`);
    }
    
    return outputPath;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

/**
 * Process multiple images
 * 
 * @param {Array} files - Array of uploaded files from multer
 * @returns {Promise<Array>} - Array of processed file paths
 */
async function processMultipleImages(files) {
  const processedFiles = [];
  
  for (const file of files) {
    try {
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.originalname.replace(/\.[^/.]+$/, '')}`;
      const processedPath = await processImage(file.path, filename);
      
      processedFiles.push({
        originalPath: file.path,
        processedPath: processedPath,
        filename: path.basename(processedPath)
      });
    } catch (error) {
      console.error(`Failed to process ${file.originalname}:`, error);
      // Keep original file if processing fails
      processedFiles.push({
        originalPath: file.path,
        processedPath: file.path,
        filename: file.filename
      });
    }
  }
  
  return processedFiles;
}

module.exports = {
  processImage,
  processMultipleImages
};

