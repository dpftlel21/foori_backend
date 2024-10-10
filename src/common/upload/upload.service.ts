import { BadRequestException, Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';

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

  async uploadToS3(file: Express.Multer.File): Promise<string> {
    await this.verifyMimeType(file);

    let fileBuffer: Buffer;
    let fileName: string;

    if (file.mimetype !== 'image/webp') {
      fileBuffer = await this.convertImageToWebp(file);
      fileName = this.setFileName(file);
    } else {
      fileBuffer = file.buffer;
      fileName = this.setFileName(file);
    }

    const params = await this.generateS3Params(fileName, file, fileBuffer);

    await this.s3Client.send(params);

    return fileName;
  }

  private generateS3Params(
    key: string,
    file: Express.Multer.File,
    fileBuffer: Buffer,
  ) {
    const bucketName = this.configService.get<string>('AWS_BUCKET_NAME');
    return new PutObjectCommand({
      Bucket: bucketName,
      Key: `profileImg/${key}`,
      Body: fileBuffer,
      ContentType: file.mimetype,
      CacheControl: 'max-age=2592000', // 한 달(30일)로 설정
    });
  }

  private setFileName(file: Express.Multer.File): string {
    const originalName = file.originalname;
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    return `${uuidv4()}-${baseName}.webp`;
  }

  private async convertImageToWebp(file: Express.Multer.File) {
    return sharp(file.buffer).webp().toBuffer();
  }

  private async verifyMimeType(file: Express.Multer.File) {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        '지원하지 않는 파일 형식입니다. 이미지 파일만 업로드할 수 있습니다.',
      );
    }
  }
}
