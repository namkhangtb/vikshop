import { Injectable } from '@nestjs/common';
import { File as MulterFile } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { ProductService } from '../product/product.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class UploadService {
  constructor(private productService: ProductService) {}
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

  @Cron('0 0 * * *')
  async handleImageCleanup() {
    try {
      const products = await this.productService.findAll({
        limit: -1,
      });
      const usedImages = new Set(
        products.data.flatMap((product) => product.images || []),
      );

      const allFiles = fs.readdirSync('./uploads');
      const trashFiles = allFiles.filter((file) => !usedImages.has(file));
      trashFiles.forEach((file) => {
        const filePath = path.join('./uploads', file);
        try {
          fs.unlinkSync(filePath);
          console.log(`Đã xoá ảnh rác: ${file}`);
        } catch (err) {
          console.error(`Không thể xoá file: ${file}`, err.message);
        }
      });
      console.log('Dọn dẹp ảnh rác hoàn tất.');
    } catch (error) {
      console.error('Có lỗi khi đang dọn ảnh rác:', error.message);
    }
  }
}
