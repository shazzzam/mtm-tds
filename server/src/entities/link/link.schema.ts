import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';

import { Company } from '../company/company.schema';
import { User } from '../user/user.schema';

@ObjectType()
@Entity()
export class Link extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.links)
  user: User;

  @Field(() => [Company])
  @ManyToMany(() => Company, (company) => company.links)
  companies: Company[];

  @Field()
  @Column()
  link: string;

  @Field()
  @Column({ type: 'text', default: '' })
  description: string;

  @Field()
  @Column({ default: 0 })
  transition: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
