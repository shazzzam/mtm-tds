import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../user/user.schema';

@ObjectType()
@Entity()
export class Mail extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.links)
  user: User;

  @Field()
  @Column({ unique: true })
  mail: string;

  @Field()
  @Column({ unique: true })
  code: string;

  @Field()
  @Column({ default: 'unknown' })
  source: string;

  @Field()
  @Column({ default: 'unknown' })
  geo: string;

  @Field()
  @Column({ default: 'unknown' })
  name: string;

  @Field()
  @Column({ default: 'unknown' })
  sex: string;

  @Field()
  @Column({ default: 0 })
  age: number;

  @Field()
  @Column({ default: true })
  status: boolean;
}
