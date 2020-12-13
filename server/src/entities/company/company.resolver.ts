import {
  Field,
  InputType,
  Resolver,
  ObjectType,
  Mutation,
  Arg,
  Ctx,
} from 'type-graphql';

import { MyContext } from '../../types';
import { getSessionUser } from '../../utils/sessionError';
import { FieldError } from '../../utils/fieldError';
import { Company } from './company.schema';
import { generateUri } from '../../utils/generateUri';
import { Link } from '../link/link.schema';
import { In } from 'typeorm';

@InputType()
class CompanyInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  uri?: string;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType()
class CompanyResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Company, { nullable: true })
  company?: Company;
}

@Resolver()
export class CompanyResolver {
  @Mutation(() => CompanyResponse)
  async companyCreate(
    @Arg('options', () => CompanyInput) options: CompanyInput,
    @Ctx() { req }: MyContext
  ): Promise<CompanyResponse> {
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
      const company = await Company.create({
        ...options,
        uri: options.uri ? options.uri : await generateUri(),
        user,
      }).save();
      return { company };
    } catch (e) {
      if (e.code === '23505') {
        return {
          errors: [
            {
              field: 'uri',
              message: 'url редиректа занят',
            },
          ],
        };
      }
    }
    return {
      errors: [
        {
          field: 'unknown',
          message: 'unknown',
        },
      ],
    };
  }

  @Mutation(() => Boolean)
  async companyChangeLinks(
    @Arg('id', () => Number) id: number,
    @Arg('linksIds', () => [Number]) linksIds: Array<number>,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const user = await getSessionUser(req);
    if (!user) {
      return false;
    }
    const company = await Company.findOne({ id });
    if (!company) {
      return false;
    }

    const links = await Link.find({ where: { id: In(linksIds) } });
    console.log(links);

    company.links = links;
    company.save();

    return true;
  }
}
