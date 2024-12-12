import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MAX_FILE_SIZE, UPLOADS_PATH } from 'src/uploads/uploads.constant';
import { UploadsUtils } from 'src/uploads/utils/uploads-utils';

export const CustomFilesInterceptor = FilesInterceptor('files', MAX_FILE_SIZE, {
  storage: diskStorage({
    destination: UPLOADS_PATH,
    filename: (_, file, cb) => {
      cb(null, UploadsUtils.generateFilename(file.originalname));
    },
  }),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});
