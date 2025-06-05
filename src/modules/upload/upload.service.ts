import { Injectable } from '@nestjs/common';
import { File as MulterFile } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  handleUploadedFile(file: MulterFile) {
    if (!file) {
      return {};
    }
    return {
      uploaded: `${file.filename}`,
    };
  }

  deleteFile(filename: string) {
    const filePath = path.join('./uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { deleted: [filename] };
    }
    return { deleted: [] };
  }
}
