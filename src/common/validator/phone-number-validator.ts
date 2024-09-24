import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'phoneNumber', async: false })
export class PhoneNumberValidator implements ValidatorConstraintInterface {
  private message: string;

  validate(phoneNumber: string, args: ValidationArguments) {
    // phoneNumber가 존재하는지 먼저 확인
    if (!phoneNumber) {
      this.message = '휴대폰 번호가 입력되지 않았습니다.';
      return false;
    }

    // 길이 검사: 최소 13자 ~ 최대 16자
    if (phoneNumber.length < 13 || phoneNumber.length > 16) {
      this.message = '휴대폰 번호는 최소 13자에서 최대 16자여야 합니다.';
      return false;
    }

    // 010으로 시작하는지 검사
    if (!phoneNumber.startsWith('010')) {
      this.message = '휴대폰 번호는 010으로 시작해야 합니다.';
      return false;
    }

    // '-'를 포함한 형식 검사 (예: 010-1234-5678)
    if (!/^010-\d{4}-\d{4}$/.test(phoneNumber)) {
      this.message = '휴대폰 번호는 010-XXXX-XXXX 형식이어야 합니다.';
      return false;
    }

    // 모든 조건이 통과하면 true 반환
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    // validate에서 설정한 message를 반환
    return this.message || '휴대폰 번호가 유효하지 않습니다.';
  }
}

// 데코레이터 함수 정의
export function PhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: PhoneNumberValidator,
    });
  };
}
