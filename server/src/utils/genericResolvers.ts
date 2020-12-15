import { Request } from 'express';
import { getSessionUser } from './sessionError';

type getByIdType = {
  id: number;
  req: Request;
  model: any;
  modelName: string;
  relations: Array<string>;
};

type deleteType = {
  id: number;
  req: Request;
  model: any;
};

export const getByIdGenericResolver = async ({
  id,
  req,
  model,
  modelName,
  relations,
}: getByIdType) => {
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
  const mail = await model.findOne({ id }, { relations });
  if (mail) {
    return { mail };
  }
  return {
    errors: [
      {
        field: 'id',
        message: `Нет такого(ой) ${modelName}`,
      },
    ],
  };
};

export const deleteGenericResolver = async ({ id, req, model }: deleteType) => {
  console.log(typeof model);
  const user = await getSessionUser(req);
  if (!user) {
    return false;
  }

  const res = await model.delete({ id });
  return !!res.affected;
};

export const updateGenericResolver = async () => {};
