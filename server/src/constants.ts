import path from 'path';

import dotenv from 'dotenv';

dotenv.config({
  path: path.join(__dirname, '../.env'),
});

export const __prod__: boolean = process.env.NODE_ENV === 'production';
export const COOKIE_NAME = process.env.COOKIE_NAME || 'qid';
export const PORT = process.env.PORT || 4000;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'secret';
export const ORIGIN_URL = process.env.ORIGIN_URL || 'http://localhost:3000';
export const SALT = process.env.SALT || 'in-code-we-trust';
export const KEY_LENGTH = Number(process.env.KEY_LENGTH) || 10;
export const DB = {
  name: process.env.DB_NAME || 'mtm',
  user: process.env.DB_USER || 'mtm',
  password: process.env.DB_PASSWORD || 'mtm',
  type: process.env.DB_TYPE || 'postgres',
};
