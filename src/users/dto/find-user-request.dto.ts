import { PickType } from '@nestjs/mapped-types';
import { CreateUserRequestDto } from './create-member-request.dto';
import { IsEmail, IsString, Length } from 'class-validator';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { emailValidationMessage } from '../../common/validation-message/email-validation.message';
import { lengthValidationMessage } from '../../common/validation-message/length-validation.message';
import { Password } from '../../common/validator/password-validator';
import { PhoneNumber } from '../../common/validator/phone-number-validator';

export class FindUserRequestDto extends PickType(CreateUserRequestDto, [
  'email',
  'password',
  'phoneNumber',
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

  @IsString({ message: stringValidationMessage })
  @Length(13, 16, {
    message: lengthValidationMessage,
  })
  @PhoneNumber()
  phoneNumber: string;
}
