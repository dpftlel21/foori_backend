import { PickType } from '@nestjs/mapped-types';
import { RegisterUserRequestDto } from '../../users/dto/register-user-request.dto';
import { IsEmail, IsString, Length } from 'class-validator';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { emailValidationMessage } from '../../common/validation-message/email-validation.message';
import { lengthValidationMessage } from '../../common/validation-message/length-validation.message';
import { Password } from '../../common/validator/password-validator';

export class LoginUserRequestDto extends PickType(RegisterUserRequestDto, [
  'email',
  'password',
] as const) {
  @IsString({ message: stringValidationMessage })
  @IsEmail({}, { message: emailValidationMessage })
  email: string;

  @IsString({ message: stringValidationMessage })
  @Length(8, 25, {
    message: lengthValidationMessage,
  })
  @Password()
  password: string;
}
