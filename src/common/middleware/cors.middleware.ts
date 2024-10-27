import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    res.header('Access-Control-Allow-Origin', [
      'https://foori.co.kr',
      'https://www.foori.co.kr',
      'https://localhost:5361',
      'https://52.79.150.195:3001',
    ]);
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    );
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  }
}
