import { Request, Response } from 'express';

export type MyRequest = Request & { session: Express.Session };

export type MyContext = {
  req: MyRequest;
  res: Response;
};
