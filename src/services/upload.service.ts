// 📁 backend/src/services/upload.service.ts
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// 💡 Configures Cloudinary using a single system connection string environment variable
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL || 'cloudinary://YOUR_FREE_API_KEY_HERE'
});

// Configure Multer to temporarily store the incoming phone upload in temporary server memory
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({ storage });

export class UploadService {
  /**
   * Receives a raw file buffer from the owner's phone/PC, streams it safely to Cloudinary,
   * and returns a secure, auto-optimized CDN web link URL string.
   */
  static async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'olive_coast_menu',
          transformation: [{ width: 600, height: 400, crop: 'fill', quality: 'auto' }] // ⚡ Auto-optimization!
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result?.secure_url || '');
        }
      );

      // Write the binary file buffer directly into the cloud streaming connection
      uploadStream.end(file.buffer);
    });
  }
}