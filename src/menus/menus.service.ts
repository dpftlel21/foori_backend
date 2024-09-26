import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuEntity } from '../place/entities/menu.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(MenuEntity)
    private readonly menuRepository: Repository<MenuEntity>,
  ) {}

  async findMenuById(menuId: number) {
    try {
      const findMenu = await this.menuRepository.findOneOrFail({
        where: { id: menuId },
      });

      return findMenu;
    } catch (error) {
      throw new NotFoundException('일치하는 메뉴 정보가 없습니다.');
    }
  }
}
