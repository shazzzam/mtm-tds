import { User } from '../entities/user/user.schema';

import { MyRequest } from '../types';

export const getSessionUser = async (
  req: MyRequest
): Promise<User | undefined> => {
  return req.session.userId
    ? await User.findOne({ id: req.session.userId })
    : undefined;
};
