/**
 * Nestjs provide us the solutions to create our own custom decorators,here we need to handle
 * parameter or argument data according to our own logic so for this purpose
 * we need to import createParamDecorator so that we can make our own custom decorator
 * here we have created our own param decorator by the name of filter
 * However
 * The utility  ExecutionContext provide information about the current execution context
   which can be used to build generic guards, filters, and interceptors in our case we are making
   our own filter by creating param decorator
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const filter = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  data + 'a';
  const request = ctx.switchToHttp().getRequest();
  const { $filter } = request.query;
  if ($filter) {
    const queryObj = queryArrayToObjects($filter);
    return queryObj;
  }
  return {};
});

const queryArrayToObjects = ($filter: string): Object => {
  // identifying operator: and/or & separating filters into [filters:string] or [filter:string]
  const opr = $filter.includes(' or ') ? ' or ' : $filter.includes(' and ') ? ' and ' : undefined;
  const filters: string[] = opr ? $filter.split(opr) : [$filter];
  // creating [filters:Object] or [filter:Object]
  const filterObjects: Object[] = filters.map(filter => {
    const [field, operator, value] = filter.split(' ');
    const obj = {};
    if (operator.trim() === 'like') {
      obj[field] = {
        $regex: '.' + value.trim() + '.',
        $options: 'i',
      };
    } else if (operator.trim() === 'in') {
      obj[field] = { [`$${operator}`]: value.split(',') };
    } else {
      obj[field] = { [`$${operator}`]: value };
    }
    return obj;
  });
  const result = opr ? { [`$${opr.trim()}`]: filterObjects } : filterObjects[0];
  if (!$filter.includes('is_deleted')) {
    result['is_deleted'] = false;
  }
  return result;
};
