import { Injectable } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class UploadService {
  private readonly MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/heif',
    'image/heic',
    'image/webp',
  ];

  private s3: S3Client;
}
