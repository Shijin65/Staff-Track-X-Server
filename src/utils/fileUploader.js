const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const mime = require("mime-types");

/**
 * FileUploader class for handling file uploads.
 * Allows creating multiple instances with different upload directories.
 */
class FileUploader {
  /**
   * Constructor to initialize the upload directory.
   * @param {string} uploadDir - The directory where files will be stored.
   */
  constructor(uploadDir) {
    if (!uploadDir) {
      throw new Error("Upload directory is required.");
    }
    this.uploadDir = uploadDir;

    // Ensure the directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Upload profile pictures (single or multiple).
   * @param {Object|Array<Object>} files - A file object or an array of file objects containing originalname, buffer, and mimetype.
   * @returns {Promise<Array<Object>>} - Array of file metadata including fileId, fileName, filePath, contentType, and fileExtension.
   */
  async uploadFiles(files) {
    try {
      if (!files) {
        throw new Error("No files provided.");
      }

      const isArray = Array.isArray(files);
      const fileArray = isArray ? files : [files];

      const uploadedFiles = fileArray.map((file) => {
        const { originalname, buffer, mimetype } = file;
        const fileExtension =
          mime.extension(mimetype) || path.extname(originalname);
        const fileId = uuidv4();
        const fileName = `${fileId}.${fileExtension}`;
        const filePath = path.join(this.uploadDir, fileName);

        fs.writeFileSync(filePath, buffer);
        return {
          fileId,
          originalFileName: originalname,
          fileName,
          filePath,
          contentType: mimetype,
          fileExtension,
        };
      });

      return isArray ? uploadedFiles : uploadedFiles[0];
    } catch (error) {
      console.error("File upload error:", error);
      throw new Error("Failed to upload files.");
    }
  }

  /**
   * Fetch a file by its file name.
   * @param {string} fileName - The name of the file to fetch.
   * @returns {Promise<Buffer>} - The file data.
   */
  async fetchFile(fileName) {
    try {
      const filePath = path.resolve(this.uploadDir, fileName);
      if (!fs.existsSync(filePath)) {
        throw new Error("File not found.");
      }
      return filePath;
    } catch (error) {
      console.error("File fetch error:", error);
      throw new Error("Failed to fetch file.");
    }
  }

  /**
   * Remove a file by its file name.
   * @param {string} fileName - The name of the file to remove.
   * @returns {Promise<boolean>} - Returns true if the file was deleted successfully.
   */
  async removeFile(fileName) {
    try {
      const filePath = path.join(this.uploadDir, fileName);
      if (!fs.existsSync(filePath)) {
        throw new Error("File not found.");
      }
      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      console.error("File removal error:", error);
      throw new Error("Failed to remove file.");
    }
  }
}

module.exports = FileUploader;
