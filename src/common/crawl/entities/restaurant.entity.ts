import { BaseModel } from '../../entities/base-model';
import { Column, Entity, OneToMany } from 'typeorm';
import { MenuEntity } from './menu.entity';

@Entity('restaurants', { schema: 'foori' })
export class RestaurantEntity extends BaseModel {
  @Column()
  name: string;

  @Column()
  category: string;

  @Column()
  address: string;

  @Column()
  locationNum: string;

  @Column()
  postalCode: string;

  @Column()
  openDays: string;

  @Column()
  openTime: string;

  @Column()
  closeTime: string;

  @Column()
  telNum: string;

  @OneToMany(() => MenuEntity, (menu) => menu.restaurant, { cascade: true })
  menus: MenuEntity[];
}
