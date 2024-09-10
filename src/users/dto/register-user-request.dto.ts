import { IsDate, IsEmail, IsString, Length } from 'class-validator';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { lengthValidationMessage } from '../../common/validation-message/length-validation.message';
import { emailValidationMessage } from '../../common/validation-message/email-validation.message';
import { Password } from '../../common/validator/password-validator';
import { PhoneNumber } from '../../common/validator/phone-number-validator';
import { DateAfter } from '../../common/validator/date-after-validator';
import { Type } from 'class-transformer';

export class CreateUserRequestDto {
  @IsString({ message: stringValidationMessage })
  @Length(2, 20, {
    message: lengthValidationMessage,
  })
  name: string;

  @IsString({ message: stringValidationMessage })
  @Length(8, 25, {
    message: lengthValidationMessage,
  })
  @Password()
  password: string;

  @Type(() => Date)
  @IsDate()
  @DateAfter()
  birth: Date;

  @IsString({ message: stringValidationMessage })
  @IsEmail({}, { message: emailValidationMessage })
  email: string;

  @IsString({ message: stringValidationMessage })
  @Length(13, 16, {
    message: lengthValidationMessage,
  })
  @PhoneNumber()
  phoneNumber: string;
}
