import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream, existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use local storage by default
const provider = 'local';

/**
 * Ensure a directory exists, create it if it doesn't
 */
function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/**
 * Save a file stream to storage
 */
export async function saveStream({ stream, key, contentType }) {
  try {
    const baseDir = path.resolve(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');
    ensureDir(baseDir);
    
    const filePath = path.join(baseDir, key);
    const dirPath = path.dirname(filePath);
    ensureDir(dirPath);
    
    // Create a write stream
    const writeStream = (await import('fs')).createWriteStream(filePath);
    
    // Pipe the stream to the file
    await new Promise((resolve, reject) => {
      stream.pipe(writeStream)
        .on('finish', resolve)
        .on('error', (error) => {
          writeStream.destroy();
          reject(error);
        });
    });
    
    // Return the relative path for storage in the database
    return { location: key };
    
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error(`Failed to save file: ${error.message}`);
  }
}

/**
 * Get a readable stream for a file
 */
export async function getStream(key) {
  try {
    const filePath = path.resolve(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads', key);
    
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${key}`);
    }
    
    return createReadStream(filePath);
    
  } catch (error) {
    console.error('Error getting file stream:', error);
    throw new Error(`Failed to get file: ${error.message}`);
  }
}

/**
 * Remove a file from storage
 */
export async function removeObject(key) {
  try {
    const filePath = path.resolve(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads', key);
    
    if (existsSync(filePath)) {
      await fs.unlink(filePath);
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.error('Error removing file:', error);
    throw new Error(`Failed to remove file: ${error.message}`);
  }
}
