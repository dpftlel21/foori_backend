import { PickType } from '@nestjs/mapped-types';
import { CreateUserRequestDto } from './create-user-request.dto';
import { IsEmail, IsString, Length } from 'class-validator';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { emailValidationMessage } from '../../common/validation-message/email-validation.message';
import { lengthValidationMessage } from '../../common/validation-message/length-validation.message';
import { PhoneNumber } from '../../common/validator/phone-number-validator';

export class FindUserPasswordRequestDto extends PickType(CreateUserRequestDto, [
  'email',
  'name',
  'phoneNumber',
] as const) {
  @IsString({ message: stringValidationMessage })
  @IsEmail({}, { message: emailValidationMessage })
  email: string;

  @IsString({ message: stringValidationMessage })
  @Length(2, 20, {
    message: lengthValidationMessage,
  })
  name: string;

  @IsString({ message: stringValidationMessage })
  @Length(13, 16, {
    message: lengthValidationMessage,
  })
  @PhoneNumber()
  phoneNumber: string;
}
