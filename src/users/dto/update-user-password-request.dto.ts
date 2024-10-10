import { IsString, Length } from 'class-validator';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { lengthValidationMessage } from '../../common/validation-message/length-validation.message';
import { Password } from '../../common/validator/password-validator';

export class UpdateUserPasswordRequestDto {
  @IsString({ message: stringValidationMessage })
  @Length(8, 25, {
    message: lengthValidationMessage,
  })
  @Password()
  currentPassword: string;

  @IsString({ message: stringValidationMessage })
  @Length(8, 25, {
    message: lengthValidationMessage,
  })
  @Password()
  newPassword: string;
}
