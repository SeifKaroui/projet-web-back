import { join } from 'path';
import { UPLOADS_PATH } from '../uploads.constant';

export class UploadsUtils {
  public static generateFilename(originalname: string) {
    return `${Date.now()}-${originalname}`;
  }
  public static getFullFilepath(filename: string) {
    return join(process.cwd(), UPLOADS_PATH, filename); // Path to the file
  }
}
