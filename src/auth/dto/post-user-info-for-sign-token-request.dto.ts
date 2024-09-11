import { IsEmail, IsNumber, IsString } from 'class-validator';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { emailValidationMessage } from '../../common/validation-message/email-validation.message';

export class PostUserInfoForSignTokenRequestDto {
  @IsNumber()
  id: number;

  @IsString({ message: stringValidationMessage })
  @IsEmail({}, { message: emailValidationMessage })
  email: string;
}
