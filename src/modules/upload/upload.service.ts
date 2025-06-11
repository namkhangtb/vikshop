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
      const usedImages = new Set<string>();
      let page = 1;
      const limit = 10000;
      let totalPages = 1;
      do {
        const productsRes = await this.productService.findMany({
          limit,
          page,
        });

        if (!productsRes || !productsRes.data) {
          break;
        }

        const productArray = Array.isArray(productsRes.data)
          ? productsRes.data
          : [productsRes.data];

        for (const product of productArray) {
          const typedProduct = product as { images?: string[] };
          if (Array.isArray(typedProduct.images)) {
            typedProduct.images.forEach((img) => usedImages.add(img));
          }
        }

        if (productsRes.meta && productsRes.meta.pagination.totalPages) {
          totalPages = productsRes.meta.pagination.totalPages;
        }

        page++;
      } while (page <= totalPages);

      const uploadsDir = './uploads';
      if (!fs.existsSync(uploadsDir)) {
        console.log('Thư mục uploads không tồn tại.');
        return;
      }

      const allFiles = fs.readdirSync(uploadsDir);
      const trashFiles = allFiles.filter((file) => !usedImages.has(file));
      if (trashFiles.length === 0) {
        console.log('Không có ảnh rác để dọn dẹp.');
        return;
      }

      trashFiles.forEach((file) => {
        const filePath = path.join(uploadsDir, file);
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
