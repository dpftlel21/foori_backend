import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// 유효성 검사 로직 정의
@ValidatorConstraint({ name: 'IsAfterDate', async: false })
export class DateAfterConstraint implements ValidatorConstraintInterface {
  validate(date: Date, args: ValidationArguments) {
    const cutoffDate = new Date('1900-01-01'); // 기준 날짜
    return date >= cutoffDate; // 입력된 날짜가 기준 날짜 이후여야 함
  }

  defaultMessage(args: ValidationArguments) {
    return '출생일은 1900-01-01 이후여야 합니다.';
  }
}

// 데코레이터 함수 정의
export function DateAfter(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: DateAfterConstraint,
    });
  };
}
