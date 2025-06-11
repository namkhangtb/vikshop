import { Injectable } from '@nestjs/common';
import { File as MulterFile } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { ProductService } from '../product/product.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class UploadService {
  constructor(private productService: ProductService) {}
  async handleUploadedFile(file: MulterFile) {
    const uploadsDir = './uploads';

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    if (!file) {
      return { uploaded: null, message: 'Không có file để upload' };
    }

    return {
      uploaded: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path || `uploads/${file.filename}`,
    };
  }

  async deleteFile(filename: string) {
    const uploadsDir = './uploads';
    if (!fs.existsSync(uploadsDir)) {
      return { deleted: [], message: 'Thư mục uploads không tồn tại' };
    }

    const filePath = path.join('./uploads', filename);
    try {
      await fs.unlinkSync(filePath);
      return { deleted: [filename] };
    } catch (error) {
      if (error.code === 'ENOENT') {
        return { deleted: [], message: 'Không tìm thấy file' };
      }
      return { deleted: [], message: error.message };
    }
  }

  @Cron('0 0 * * *')
  async handleImageCleanup() {
    try {
      const usedImages = new Set<string>();
      let page = 1;
      const limit = 10000;
      let totalPages = 1;

      do {
        const productsRes = await this.productService.findMany({ limit, page });
        if (!productsRes?.data) break;
        const productArray = Array.isArray(productsRes.data)
          ? productsRes.data
          : [productsRes.data];
        productArray.forEach((product: { images?: string[] }) => {
          product.images?.forEach((img) => usedImages.add(img));
        });
        totalPages = productsRes.meta?.pagination?.totalPages || totalPages;
        page++;
      } while (page <= totalPages);

      const uploadsDir = './uploads';
      if (!fs.existsSync(uploadsDir)) {
        console.log('Thư mục uploads không tồn tại.');
        return;
      }
      const trashFiles = fs
        .readdirSync(uploadsDir)
        .filter((file) => !usedImages.has(file));
      if (!trashFiles.length) {
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
