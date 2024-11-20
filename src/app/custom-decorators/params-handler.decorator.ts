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
import { IPaginationQuery } from 'src/app/interfaces';
import { IForecastQuery } from 'src/app/interfaces';

export const ParamsHandler = createParamDecorator((_data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  let { $rpp, $page, $orderBy, $filter } = request.query;
  $rpp = +$rpp;
  $page = +$page;
  $orderBy = $orderBy ? sortArrayToObject($orderBy) : { created_at: -1 };
  $filter = $filter ? queryArrayToObjects($filter) : { is_deleted: false };
  const pagination: IPaginationQuery = { $rpp, $page, $orderBy, $filter };
  return pagination;
});

export const ParamForecast = createParamDecorator((_data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const { $userId, $timeStamp } = request.query;
  const forecastParameters: IForecastQuery = { $userId, $timeStamp };
  return forecastParameters;
});

// Sorting & Filteration Methods
const sortArrayToObject = ($orderBy: string): Object => {
  const differentSortings: string[] = $orderBy.split(',');
  const result: Object = {};
  differentSortings.forEach(sort => {
    const [field, operator] = sort.split(' ');
    if (operator === 'asc') result[field] = 1;
    if (operator === 'desc') result[field] = -1;
  });
  return result;
};

const queryArrayToObjects = ($filter: string): Object => {
  // Identifying operator: and/or & separating filters into [filters:string] or [filter:string]
  const opr = $filter.includes(' or ') ? ' or ' : $filter.includes(' and ') ? ' and ' : undefined;
  const filters: string[] = opr ? $filter.split(opr) : [$filter];

  // Creating [filters:Object] or [filter:Object]
  const filterObjects: Object[] = filters.map(filter => {
    const [field, operator, ...valueArray] = filter.split(' ');
    let value = valueArray.join(' ').trim();

    // Check if the value is a valid ISO 8601 date (strict check)
    let parsedValue: string | number | Date = value;
    if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}.\d{3}Z)?$/.test(value)) {
      parsedValue = new Date(value); // Parse to Date object
    }

    // Validate the parsed date and retain ISO string only for valid dates
    if (parsedValue instanceof Date && !isNaN(parsedValue.getTime())) {
      parsedValue = parsedValue.toISOString();
    } else if (!isNaN(Number(value))) {
      // If it's not a date, treat as a number (e.g., `rating lt 3`)
      parsedValue = Number(value);
    }

    const obj = {};

    // Add support for operators like `lt`, `gt`, `like`, `in`, etc.
    if (operator.trim() === 'like') {
      obj[field] = {
        $regex: '.*' + parsedValue + '.*',
        $options: 'i',
      };
    } else if (operator.trim() === 'in') {
      obj[field] = { [`$${operator}`]: value.split(',') };
    } else {
      obj[field] = { [`$${operator}`]: parsedValue };
    }
    return obj;
  });

  const result = opr ? { [`$${opr.trim()}`]: filterObjects } : filterObjects[0];

  // Default filter for 'is_deleted' if not already present
  if (!$filter.includes('is_deleted')) {
    result['is_deleted'] = false;
  }

  return result;
};





