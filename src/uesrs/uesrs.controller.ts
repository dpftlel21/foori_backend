import { Controller } from '@nestjs/common';
import { UesrsService } from './uesrs.service';

@Controller('uesrs')
export class UesrsController {
  constructor(private readonly uesrsService: UesrsService) {}
}
