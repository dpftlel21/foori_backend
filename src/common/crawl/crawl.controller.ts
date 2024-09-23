import { Controller, Post } from '@nestjs/common';
import { CrawlService } from './crawl.service';

@Controller('crawl')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @Post()
  async crawlWebsite() {
    return this.crawlService.crawlKaKaoMap();
  }
}
