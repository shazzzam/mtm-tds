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

import { FieldError } from '../../utils/fieldError';
import { MyContext } from '../../types';
import { generateUri } from '../../utils/generateUri';
import { Mail } from './mail.schema';
import { getSessionUser } from '../../utils/sessionError';
import {
  deleteGenericResolver,
  getByIdGenericResolver,
  updateGenericResolver,
} from '../../utils/genericResolvers';

@InputType()
class MailInput {
  @Field()
  mail: string;

  @Field({ nullable: true })
  code?: string;

  @Field({ nullable: true })
  source?: string;

  @Field({ nullable: true })
  geo?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  sex?: string;

  @Field({ nullable: true })
  age?: number;

  @Field({ nullable: true })
  status: boolean;
}

@ObjectType()
class MailResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Mail, { nullable: true })
  mail?: Mail;
}

@Resolver()
export class MailResolver {
  @Mutation(() => MailResponse)
  async mailCreate(
    @Arg('options', () => MailInput) options: MailInput,
    @Ctx() { req }: MyContext
  ): Promise<MailResponse> {
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
      const mail = await Mail.create({
        ...options,
        code: options.code || (await generateUri(10, options.mail)),
        user,
      }).save();
      return { mail };
    } catch (e) {
      if (e.code === '23505') {
        const field = e.detail.includes('(mail)') ? 'mail' : 'code';
        return {
          errors: [
            {
              field,
              message: `${field} уже существует`,
            },
          ],
        };
      }
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

  @Query(() => MailResponse)
  async mail(
    @Arg('id', () => Number) id: number,
    @Ctx() { req }: MyContext
  ): Promise<MailResponse> {
    return getByIdGenericResolver({
      id,
      req,
      model: Mail,
      modelName: 'почты',
      relations: ['user'],
    });
  }

  @Mutation(() => Boolean)
  async mailDelete(
    @Arg('id', () => Number) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    return deleteGenericResolver({ id, req, model: Mail });
  }

  @Mutation(() => MailResponse)
  async mailUpdate(
    @Arg('id', () => Number) id: number,
    @Arg('options', () => MailInput) options: MailInput,
    @Ctx() { req }: MyContext
  ): Promise<MailResponse> {
    return await updateGenericResolver({
      id,
      options,
      req,
      model: Mail,
      modelName: 'mail',
      uniqueFields: ['mail', 'code'],
      relations: ['user'],
    });
  }

  @Query(() => [Mail])
  async mails(@Ctx() { req }: MyContext): Promise<Mail[]> {
    const user = await getSessionUser(req);
    if (!user) {
      return [];
    }

    const mails = await Mail.find({ relations: ['user'] });
    return mails;
  }
}
