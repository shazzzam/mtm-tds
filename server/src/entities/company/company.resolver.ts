import {
  Field,
  InputType,
  Resolver,
  ObjectType,
  Mutation,
  Arg,
  Ctx,
  Query,
} from 'type-graphql';
import { In, Like } from 'typeorm';

import { MyContext } from '../../types';
import { getSessionUser } from '../../utils/sessionError';
import { FieldError } from '../../utils/fieldError';
import { Company } from './company.schema';
import { generateUri } from '../../utils/generateUri';
import { Link } from '../link/link.schema';
import { PaginatorInput } from '../../types';

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

@ObjectType()
class PaginatedCompanies {
  @Field(() => [Company])
  companies: Company[];

  @Field()
  hasMore: boolean;
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

    company.links = links;
    company.save();

    return true;
  }

  @Mutation(() => CompanyResponse)
  async companyUpdate(
    @Arg('id', () => Number) id: number,
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
      await Company.update({ id }, { ...options });
      const company = await Company.findOne(id, {
        relations: ['user', 'links'],
      });
      if (!company) {
        return {
          errors: [
            {
              field: 'id',
              message: 'Такой компании не существует',
            },
          ],
        };
      }
      return { company };
    } catch (e) {
      if (e.code === '23505') {
        return {
          errors: [
            {
              field: 'uri',
              message: 'URI уже занят',
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

  @Mutation(() => Boolean)
  async companyDelete(
    @Arg('id', () => Number) id: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const user = await getSessionUser(req);
    if (!user) {
      return false;
    }

    const res = await Company.delete({ id });
    return !!res.affected;
  }

  @Query(() => PaginatedCompanies)
  async companies(
    @Arg('options', () => CompanyInput, { nullable: true })
    options: CompanyInput = {},

    @Arg('paginator', () => PaginatorInput, { nullable: true })
    paginator: PaginatorInput = { take: 10, skip: 0 },

    @Ctx() { req }: MyContext
  ): Promise<PaginatedCompanies> {
    const user = await getSessionUser(req);
    if (!user) {
      return {
        hasMore: false,
        companies: [],
      };
    }

    const companies = await Company.find({
      where: {
        name: Like(`%${options.name || ''}%`),
        description: Like(`%${options.description || ''}%`),
        uri: Like(`%${options.uri || ''}%`),
      },
      ...paginator,
      relations: ['user', 'links'],
    });

    return {
      hasMore: companies.length === paginator.take,
      companies,
    };
  }

  @Query(() => CompanyResponse)
  async company(
    @Arg('id', () => Number) id: number,
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

    const company = await Company.findOne(
      { id },
      { relations: ['user', 'links'] }
    );
    if (company) {
      return { company };
    }
    return {
      errors: [
        {
          field: 'id',
          message: 'Нет компании с таким id',
        },
      ],
    };
  }
}
