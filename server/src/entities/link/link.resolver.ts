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
import { User } from '../user/user.schema';

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
    const user = req.session.userId
      ? await User.findOne({ id: req.session.userId })
      : null;
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
}
