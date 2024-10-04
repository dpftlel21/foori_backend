import { Controller } from '@nestjs/common';
import { SocialAccountsService } from './social-accounts.service';

@Controller('social-accounts')
export class SocialAccountsController {
  constructor(private readonly socialAccountsService: SocialAccountsService) {}
}
