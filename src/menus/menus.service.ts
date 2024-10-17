import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuEntity } from './entities/menu.entity';
import { Repository } from 'typeorm';
import { MenusResponseDto } from './dto/menus-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(MenuEntity)
    private readonly menuRepository: Repository<MenuEntity>,
  ) {}

  async findMenuById(
    menuId: number,
    restaurantId: number,
  ): Promise<MenusResponseDto> {
    try {
      const findMenu = await this.menuRepository.findOneOrFail({
        where: { id: menuId, restaurant: { id: restaurantId } },
      });

      return plainToInstance(MenusResponseDto, findMenu);
    } catch (error) {
      throw new NotFoundException('일치하는 메뉴 정보가 없습니다.');
    }
  }
}
