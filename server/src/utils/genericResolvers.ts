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

type updateType = {
  id: number;
  req: Request;
  options: any;
  model: any;
  modelName: string;
  relations: Array<string>;
  uniqueFields: Array<string>;
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
  const item = await model.findOne({ id }, { relations });
  if (item) {
    return { [modelName]: item };
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

export const updateGenericResolver = async ({
  id,
  options,
  req,
  model,
  modelName,
  uniqueFields,
  relations,
}: updateType) => {
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
    await model.update({ id }, { ...options });
    const item = await model.findOne(id, {
      relations: relations,
    });
    if (!item) {
      return {
        errors: [
          {
            field: 'id',
            message: `Такого(ой) ${modelName} не существует`,
          },
        ],
      };
    }
    return { [modelName]: item };
  } catch (e) {
    if (e.code === '23505') {
      let field = null;
      for (let i = 0; i < uniqueFields.length; i++) {
        if (e.detail.includes(`(${uniqueFields[i]})`)) {
          field = uniqueFields[i];
        }
      }
      if (field) {
        return {
          errors: [
            {
              field,
              message: `${field} уже существует`,
            },
          ],
        };
      }
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
};
