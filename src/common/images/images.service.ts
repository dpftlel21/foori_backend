import { Injectable } from '@nestjs/common';
import { UploadService } from '../upload/upload.service';
import { ImageFolderEnum } from './dto/image-folder.enum';

@Injectable()
export class ImagesService {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * 프로필 이미지 업로드 함수
   * @param file
   */
  async uploadUserProfileImage(file: Express.Multer.File) {
    const { key, fileUrl } = await this.uploadService.uploadToS3(
      file,
      ImageFolderEnum.PROFILE,
    );

    return { key, fileUrl };
  }
}
