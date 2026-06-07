"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = exports.uploadMiddleware = void 0;
// 📁 backend/src/services/upload.service.ts
const cloudinary_1 = require("cloudinary");
const multer_1 = __importDefault(require("multer"));
// 💡 Configures Cloudinary using a single system connection string environment variable
cloudinary_1.v2.config({
    cloudinary_url: process.env.CLOUDINARY_URL || 'cloudinary://YOUR_FREE_API_KEY_HERE'
});
// Configure Multer to temporarily store the incoming phone upload in temporary server memory
const storage = multer_1.default.memoryStorage();
exports.uploadMiddleware = (0, multer_1.default)({ storage });
class UploadService {
    /**
     * Receives a raw file buffer from the owner's phone/PC, streams it safely to Cloudinary,
     * and returns a secure, auto-optimized CDN web link URL string.
     */
    static async uploadImage(file) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: 'olive_coast_menu',
                transformation: [{ width: 600, height: 400, crop: 'fill', quality: 'auto' }] // ⚡ Auto-optimization!
            }, (error, result) => {
                if (error)
                    return reject(error);
                resolve(result?.secure_url || '');
            });
            // Write the binary file buffer directly into the cloud streaming connection
            uploadStream.end(file.buffer);
        });
    }
}
exports.UploadService = UploadService;
