import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const allowedOrigins = [
      'https://foori.co.kr',
      'https://www.foori.co.kr',
      'https://www-foori.co.kr',
      'http://localhost:5174',
      'https://52.79.150.195:3001',
    ];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }

    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    );
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    // OPTIONS 메서드에 대한 프리플라이트 요청 처리
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  }
}
