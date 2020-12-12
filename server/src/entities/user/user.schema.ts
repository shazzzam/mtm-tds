import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Link } from '../link/link.schema';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany(() => Link, (link) => link.user)
  links: Link[];

  @Field()
  @Column({ unique: true })
  login!: string;

  @Column()
  password!: string;
}
