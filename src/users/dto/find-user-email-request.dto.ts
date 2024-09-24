import { RegisterUserRequestDto } from './register-user-request.dto';
import { PickType } from '@nestjs/mapped-types';
import { IsString, Length } from 'class-validator';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { lengthValidationMessage } from '../../common/validation-message/length-validation.message';
import { PhoneNumber } from '../../common/validator/phone-number-validator';

export class FindUserEmailRequestDto extends PickType(RegisterUserRequestDto, [
  'name',
  'phoneNumber',
] as const) {
  @IsString({ message: stringValidationMessage })
  @Length(2, 20, {
    message: lengthValidationMessage,
  })
  name: string;

  @IsString({ message: stringValidationMessage })
  @Length(12, 15, {
    message: lengthValidationMessage,
  })
  @PhoneNumber()
  phoneNumber: string;
}
