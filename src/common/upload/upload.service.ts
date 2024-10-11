import { BadRequestException, Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import { ImageFolderEnum } from '../images/dto/image-folder.enum';

@Injectable()
export class UploadService {
  private readonly allowedMimeTypes: string[];

  constructor(
    private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/heif',
      'image/heic',
      'image/webp',
    ];
  }

  /**
   * S3에 이미지 파일 업로드
   * @param file
   * @param folderType
   */
  async uploadToS3(
    file: Express.Multer.File,
    folderType: ImageFolderEnum,
  ): Promise<{ fileUrl: string; key: string }> {
    await this.verifyMimeType(file);

    let fileBuffer: Buffer;
    let fileName: string;

    console.log(`file.mimetype: ${file.mimetype}`);
    if (file.mimetype !== 'image/webp') {
      fileBuffer = await this.convertImageToWebp(file);
      fileName = this.setFileName(file);
    } else {
      fileBuffer = file.buffer;
      fileName = this.setFileName(file);
    }

    const bucketName = this.configService.get<string>('AWS_BUCKET_NAME');

    const params = this.generateS3Params(
      bucketName,
      fileName,
      file,
      fileBuffer,
      folderType,
    );

    // S3에 파일 업로드
    await this.s3Client.send(params);

    const bucketRegion = this.configService.get<string>('AWS_REGION');
    const fileUrl = this.generateS3Uri(
      bucketName,
      bucketRegion,
      `${folderType}/${fileName}`,
    );

    return { key: `${folderType}/${fileName}`, fileUrl };
  }

  /**
   * S3에 이미지 파일 업로드를 위한 파라미터 생성
   * @param bucketName
   * @param key
   * @param file
   * @param fileBuffer
   * @param folderType
   * @private
   */
  private generateS3Params(
    bucketName: string,
    key: string,
    file: Express.Multer.File,
    fileBuffer: Buffer,
    folderType: ImageFolderEnum,
  ) {
    return new PutObjectCommand({
      Bucket: bucketName,
      Key: `${folderType}/${key}`,
      Body: fileBuffer,
      ContentType: file.mimetype,
      CacheControl: 'max-age=2592000', // 한 달(30일)로 설정
    });
  }

  /**
   * 파일명 생성
   * @param file
   * @private
   */
  private setFileName(file: Express.Multer.File): string {
    const originalName = file.originalname;
    const baseName = originalName.replace(/\.[^/.]+$/, ''); // 기존 파일명에서 확장자 제거
    return `${uuidv4()}-${baseName}.webp`;
  }

  /**
   * 이미지 파일을 webp 형식으로 변환
   * @param file
   * @private
   */
  private async convertImageToWebp(file: Express.Multer.File) {
    return sharp(file.buffer).webp().toBuffer();
  }

  /**
   * 파일의 MIME 타입 검증
   * @param file
   * @private
   */
  private async verifyMimeType(file: Express.Multer.File) {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        '지원하지 않는 파일 형식입니다. 이미지 파일만 업로드할 수 있습니다.',
      );
    }
  }

  /**
   * S3 URI 생성
   * @param bucketName
   * @param bucketRegion
   * @param key
   * @private
   */
  private generateS3Uri(
    bucketName: string,
    bucketRegion: string,
    key: string,
  ): string {
    return `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${encodeURIComponent(
      key,
    )}`;
  }
}
