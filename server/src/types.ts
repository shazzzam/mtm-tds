import { Request, Response } from 'express';
import { Field, InputType } from 'type-graphql';

export type MyRequest = Request & { session: Express.Session };

export type MyContext = {
  req: MyRequest;
  res: Response;
};

@InputType()
export class PaginatorInput {
  @Field({ nullable: true })
  take?: number;

  @Field({ nullable: true })
  skip?: number;
}
