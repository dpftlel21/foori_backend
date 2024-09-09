import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'password', async: false })
export class PasswordValidator implements ValidatorConstraintInterface {
  private message: string;

  validate(password: string, args: ValidationArguments) {
    // 길이 검사: 8자에서 25자 사이
    if (password.length < 8 || password.length > 25) {
      this.message = '비밀번호는 8자에서 25자 사이여야 합니다.';
      return false;
    }

    // 소문자 검사
    if (!/[a-z]/.test(password)) {
      this.message =
        '비밀번호에는 최소 하나의 영문 소문자가 포함되어야 합니다.';
      return false;
    }

    // 숫자 검사
    if (!/\d/.test(password)) {
      this.message = '비밀번호에는 최소 하나의 숫자가 포함되어야 합니다.';
      return false;
    }

    // 특수문자 검사
    if (!/[!@#$%^&*()_+=\-{}[\]:;"'<>?/.]/.test(password)) {
      this.message =
        '비밀번호에는 최소 하나의 특수문자(!@#$%^&*()_+=-{}[]:;"\'<>?/.)가 포함되어야 합니다.';
      return false;
    }

    // 모든 조건이 통과하면 true 반환
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    // validate에서 설정한 message를 반환
    return this.message || '비밀번호가 유효하지 않습니다.';
  }
}

// 데코레이터 함수 정의
export function Password(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: PasswordValidator,
    });
  };
}
