import argon2 from 'argon2-browser';

import { SALT } from '../constants';

export const generateUri = async (
  length: number = 6,
  fromString: string = ''
): Promise<string> => {
  const code = await argon2.hash({
    pass: fromString || Date.now().toString(),
    salt: SALT,
    hashLen: length || 6,
  });

  return code.hashHex;
};
