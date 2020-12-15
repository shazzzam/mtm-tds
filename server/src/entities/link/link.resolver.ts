import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { Like } from 'typeorm';

import { FieldError } from '../../utils/fieldError';
import { MyContext } from '../../types';
import { Link } from './link.schema';
import { getSessionUser } from '../../utils/sessionError';
import { PaginatorInput } from '../../types';
import { getListGenericResolver } from '../../utils/genericResolvers';

@InputType()
class LinkInput {
  @Field()
  link: string;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType()
class LinkResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Link, { nullable: true })
  link?: Link;
}

@ObjectType()
class PaginatedLinks {
  @Field(() => [Link])
  links: Link[];

  @Field()
  hasMore: boolean;
}

@Resolver()
export class LinkResolver {
  @Mutation(() => LinkResponse)
  async linkCreate(
    @Arg('options', () => LinkInput) options: LinkInput,
    @Ctx() { req }: MyContext
  ): Promise<LinkResponse> {
    const user = await getSessionUser(req);
    if (!user) {
      return {
        errors: [
          {
            field: 'session',
            message: 'Вы не авторизованы',
          },
        ],
      };
    }

    const link = await Link.create({ ...options, user }).save();

    return { link };
  }

  @Mutation(() => LinkResponse)
  async linkUpdate(
    @Arg('options', () => LinkInput) options: LinkInput,
    @Arg('id', () => Number) id: number,
    @Ctx() { req }: MyContext
  ): Promise<LinkResponse> {
    const user = await getSessionUser(req);
    if (!user) {
      return {
        errors: [
          {
            field: 'session',
            message: 'Вы не авторизованы',
          },
        ],
      };
    }

    try {
      await Link.update({ id }, { ...options, user });
      const link = await Link.findOne(id, { relations: ['user'] });

      return { link: link };
    } catch (e) {
      return {
        errors: [
          {
            field: 'unknown',
            message: e.message,
          },
        ],
      };
    }
  }

  @Mutation(() => Boolean)
  async linkDelete(
    @Arg('id', () => Number) id: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const user = await getSessionUser(req);
    if (!user) {
      return false;
    }

    const res = await Link.delete({ id });
    return !!res.affected;
  }

  @Query(() => LinkResponse)
  async link(
    @Arg('id', () => Number) id: number,
    @Ctx() { req }: MyContext
  ): Promise<LinkResponse> {
    const user = await getSessionUser(req);
    if (!user) {
      return {
        errors: [
          {
            field: 'session',
            message: 'Вы не авторизованы',
          },
        ],
      };
    }

    const link = await Link.findOne({ where: { id }, relations: ['user'] });
    if (link) {
      return {
        link: link,
      };
    }

    return {
      errors: [
        {
          field: 'id',
          message: 'нет такой ссылки',
        },
      ],
    };
  }

  @Query(() => PaginatedLinks)
  async links(
    @Arg('options', () => LinkInput, { nullable: true })
    options: LinkInput = { link: '' },

    @Arg('paginator', () => PaginatorInput, { nullable: true })
    paginator: PaginatorInput = { take: 10, skip: 0 },

    @Ctx() { req }: MyContext
  ): Promise<any> {
    return await getListGenericResolver({
      req,
      model: Link,
      modelName: 'links',
      query: {
        where: {
          link: Like(`%${options.link || ''}%`),
          description: Like(`%${options.description || ''}%`),
        },
        ...paginator,
        relations: ['user', 'companies'],
      },
    });
  }
}
