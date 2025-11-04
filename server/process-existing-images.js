const { pool } = require('./database/config');
const { processImage } = require('./utils/imageProcessor');
const path = require('path');
const fs = require('fs').promises;

async function processExistingImages() {
  try {
    console.log('🔄 Starting to process existing images...');
    
    // Get all images from database
    const [images] = await pool.execute('SELECT id, article_id, url FROM article_images ORDER BY id');
    
    console.log(`Found ${images.length} images to process`);
    
    let processedCount = 0;
    let errorCount = 0;
    
    for (const image of images) {
      try {
        const imagePath = path.join(__dirname, image.url.replace(/^\//, ''));
        
        // Check if file exists
        try {
          await fs.access(imagePath);
        } catch (err) {
          console.log(`⚠️  File not found: ${imagePath}`);
          continue;
        }
        
        // Skip if already processed
        if (image.url.includes('processed-')) {
          console.log(`✓ Already processed: ${image.url}`);
          continue;
        }
        
        console.log(`\n📸 Processing image ${processedCount + 1}/${images.length}:`);
        console.log(`   Original: ${image.url}`);
        
        // Generate new filename
        const timestamp = Date.now();
        const originalName = path.basename(image.url, path.extname(image.url));
        const filename = `${timestamp}-${originalName}`;
        
        // Process the image
        const processedPath = await processImage(imagePath, filename);
        const newUrl = `/uploads/${path.basename(processedPath)}`;
        
        console.log(`   Processed: ${newUrl}`);
        
        // Update database
        await pool.execute(
          'UPDATE article_images SET url = ? WHERE id = ?',
          [newUrl, image.id]
        );
        
        processedCount++;
        console.log(`✅ Updated in database`);
        
      } catch (error) {
        console.error(`❌ Error processing image ${image.id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Processing complete!');
    console.log(`✅ Processed: ${processedCount} images`);
    console.log(`❌ Errors: ${errorCount} images`);
    console.log(`⏭️  Skipped: ${images.length - processedCount - errorCount} images`);
    console.log('='.repeat(50));
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  processExistingImages();
}

module.exports = processExistingImages;

