import { Controller, Get } from '@nestjs/common';
import { CrawlService } from './crawl.service';

@Controller('crawl')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @Get()
  async crawlWebsite() {
    return this.crawlService.crawlKaKaoMap();
  }
}
