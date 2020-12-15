import { Request } from 'express';

import { getSessionUser } from './sessionError';

type GetByIdType = {
  id: number;
  req: Request;
  model: any;
  modelName: string;
  relations: Array<string>;
};

type DeleteType = {
  id: number;
  req: Request;
  model: any;
};

type UpdateType = {
  id: number;
  req: Request;
  options: any;
  model: any;
  modelName: string;
  relations: Array<string>;
  uniqueFields: Array<string>;
};

type GetListType = {
  model: any;
  modelName: string;
  req: Request;
  query: any;
};

export const getByIdGenericResolver = async ({
  id,
  req,
  model,
  modelName,
  relations,
}: GetByIdType) => {
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

export const deleteGenericResolver = async ({ id, req, model }: DeleteType) => {
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
}: UpdateType) => {
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

export const getListGenericResolver = async ({
  req,
  model,
  modelName,
  query,
}: GetListType) => {
  const user = await getSessionUser(req);
  if (!user) {
    return {
      [modelName]: [],
      hasMore: false,
    };
  }

  const items = await model.find(query);

  console.log(items);

  return {
    [modelName]: items,
    hasMore: items.length === query.take,
  };
};
