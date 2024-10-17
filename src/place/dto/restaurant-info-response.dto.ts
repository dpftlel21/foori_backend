import { IsDate, IsNumber, IsString, ValidateNested } from 'class-validator';
import { MenusResponseDto } from '../../menus/dto/menus-response.dto';
import { Expose, Type } from 'class-transformer';

export class RestaurantInfoResponseDto {
  @IsNumber()
  @Expose()
  id: number;

  @IsString()
  @Expose()
  name: string;

  @IsString()
  @Expose()
  category: string;

  @IsString()
  @Expose()
  address: string;

  @IsString()
  @Expose()
  locationNum: string;

  @IsString()
  @Expose()
  postalCode: string;

  @IsString()
  @Expose()
  openDays: string;

  @IsDate()
  @Expose()
  openTime: Date;

  @IsDate()
  @Expose()
  closeTime: Date;

  @IsString()
  @Expose()
  telNum: string;

  @IsDate()
  @Expose()
  createdAt: Date;

  @IsDate()
  @Expose()
  updatedAt: Date;

  @Expose()
  @ValidateNested({ each: true }) // 배열 내부의 각 객체를 검증
  @Type(() => MenusResponseDto) // 배열 요소 타입을 명시
  menus: MenusResponseDto[];
}
