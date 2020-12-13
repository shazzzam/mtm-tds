import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
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

  @Field()
  @Column({ default: '' })
  name: string;

  @Field()
  @Column({ default: 'admin' })
  role: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
