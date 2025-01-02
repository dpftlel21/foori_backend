import { IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class MenusResponseDto {
  @IsNumber()
  @Expose()
  id: number;

  @IsString()
  @Expose()
  name: string;

  @IsNumber()
  @Expose()
  price: number;
}
