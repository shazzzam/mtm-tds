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

    const company = await Company.create({
      ...options,
      uri: options.uri ? options.uri : await generateUri(),
      user,
    }).save();
    return { company };
  }
}
