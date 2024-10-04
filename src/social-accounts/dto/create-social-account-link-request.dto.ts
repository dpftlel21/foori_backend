import { IsEnum, IsNumber, IsString } from 'class-validator';
import { SocialProvider } from '../enum/social-provider';

export class CreateSocialAccountLinkRequestDto {
  @IsNumber()
  userId: number;

  @IsEnum(SocialProvider)
  provider: SocialProvider;

  @IsString()
  socialId: string;
}
