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
import argon2 from 'argon2';

import { User } from './user.schema';
import { FieldError } from '../../utils/fieldError';
import { MyContext } from '../../types';
import { COOKIE_NAME } from '../../constants';

@InputType()
class UsernamePasswordInput {
  @Field()
  login: string;

  @Field()
  password: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput
  ): Promise<UserResponse> {
    if (options.login.length < 3) {
      return {
        errors: [
          {
            field: 'login',
            message: 'Длинна логина не может быть меньше трех символов',
          },
        ],
      };
    }
    if (options.password.length < 3) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Длинна пароля не может быть меньше трех символов',
          },
        ],
      };
    }
    const hashedPassword = await argon2.hash(options.password);
    try {
      return {
        user: await User.create({
          login: options.login,
          password: hashedPassword,
        }).save(),
      };
    } catch (e) {
      if (e.code === '23505') {
        return {
          errors: [
            {
              field: 'username',
              message: 'Пользователь с таким логином уже существует',
            },
          ],
        };
      }
    }
    return {
      errors: [
        {
          field: 'unknown',
          message: 'Неизвестная  ошибка',
        },
      ],
    };
  }

  @Query(() => [User])
  async users(): Promise<User[]> {
    return await User.find({});
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({ where: { login: options.login } });
    if (!user) {
      return {
        errors: [
          {
            field: 'login',
            message: 'Пользователя с таким логином не существует',
          },
        ],
      };
    }
    const isPasswordValid = await argon2.verify(
      user.password,
      options.password
    );
    if (!isPasswordValid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Пароль не верный',
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { res, req }: MyContext): Promise<Boolean> {
    return new Promise((resolve) => {
      req.session.destroy((e) => {
        res.clearCookie(COOKIE_NAME);
        if (e) {
          console.log(e);
          resolve(false);
          return;
        }
        resolve(true);
      });
    });
  }
}
