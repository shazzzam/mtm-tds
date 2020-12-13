import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Link } from '../link/link.schema';
import { User } from '../user/user.schema';

@ObjectType()
@Entity()
export class Company extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.companies)
  user: User;

  @Field(() => [Link])
  @ManyToMany(() => Link, (link) => link.companies)
  @JoinTable()
  links: Link[];

  @Field()
  @Column({ default: 'новая компания' })
  name: string;

  @Field()
  @Column({ unique: true })
  uri: string;

  @Field()
  @Column({ nullable: true, default: '' })
  description: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
