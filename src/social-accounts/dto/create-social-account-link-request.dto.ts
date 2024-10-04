import { IsEnum, IsNumber, IsString } from 'class-validator';
import { SocialProvider } from '../enum/social-provider';

export class CreateSocialAccountLinkRequestDto {
  @IsNumber()
  userId: number;

  @IsString()
  socialId: string;

  @IsEnum(SocialProvider)
  provider: SocialProvider;
}
