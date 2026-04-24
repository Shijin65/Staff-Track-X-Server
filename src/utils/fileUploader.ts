import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import mime from "mime-types";

export interface FileObject {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

export interface UploadedFile {
  fileId: string;
  originalFileName: string;
  fileName: string;
  filePath: string;
  contentType: string;
  fileExtension: string;
}

/**
 * FileUploader class for handling file uploads.
 * Allows creating multiple instances with different upload directories.
 */
class FileUploader {
  public uploadDir: string;

  /**
   * Constructor to initialize the upload directory.
   * @param uploadDir - The directory where files will be stored.
   */
  constructor(uploadDir: string) {
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
   * @param files - A file object or an array of file objects containing originalname, buffer, and mimetype.
   * @returns Array of file metadata including fileId, fileName, filePath, contentType, and fileExtension.
   */
  async uploadFiles(files: FileObject | FileObject[]): Promise<UploadedFile | UploadedFile[]> {
    try {
      if (!files) {
        throw new Error("No files provided.");
      }

      const isArray = Array.isArray(files);
      const fileArray = isArray ? files : [files];

      const uploadedFiles = fileArray.map((file) => {
        const { originalname, buffer, mimetype } = file;
        const fileExtension = mime.extension(mimetype) || path.extname(originalname);
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
          fileExtension: typeof fileExtension === "string" ? fileExtension : "",
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
   * @param fileName - The name of the file to fetch.
   * @returns The file path string.
   */
  async fetchFile(fileName: string): Promise<string> {
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
   * @param fileName - The name of the file to remove.
   * @returns Returns true if the file was deleted successfully.
   */
  async removeFile(fileName: string): Promise<boolean> {
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

export default FileUploader;
