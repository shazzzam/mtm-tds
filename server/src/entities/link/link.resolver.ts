import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from 'type-graphql';

import { FieldError } from '../../utils/fieldError';
import { MyContext } from '../../types';
import { Link } from './link.schema';
import { getSessionUser } from '../../utils/sessionError';

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
}
