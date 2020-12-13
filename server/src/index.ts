import 'reflect-metadata';
import express from 'express';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';

import { MyContext } from './types';
import { PORT, COOKIE_NAME, DB, __prod__, JWT_SECRET_KEY } from './constants';
import { User } from './entities/user/user.schema';
import { UserResolver } from './entities/user/user.resolver';
import { Link } from './entities/link/link.schema';
import { LinkResolver } from './entities/link/link.resolver';
import { Company } from './entities/company/company.schema';
import { CompanyResolver } from './entities/company/company.resolver';

const main = async () => {
  const app = express();
  await createConnection({
    type: 'postgres',
    database: DB.name,
    username: DB.user,
    password: DB.password,
    logging: true,
    synchronize: true,
    entities: [User, Link, Company],
  });

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
        // disableTTL: true,
      }),
      cookie: {
        maxAge: 315360000000,
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__,
      },
      saveUninitialized: false,
      secret: JWT_SECRET_KEY,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, LinkResolver, CompanyResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ req, res }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(PORT, () => {
    console.log(`Server started on localhost:${PORT}`);
  });
};

main().catch((err) => {
  console.log(err);
});
