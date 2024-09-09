import { ValidationArguments } from 'class-validator';

export const lengthValidationMessage = (args: ValidationArguments) => {
  if (args.constraints.length === 2) {
    return `${args.property}은 ${args.constraints[0]}글자 이상 ${args.constraints[1]}글자 이하여야 합니다.`;
  } else {
    return `${args.property}은 최소 ${args.constraints[0]}글자 이상이어야 합니다.`;
  }
};
