import { Types } from 'mongoose';
import { isNaN } from 'lodash';
import { isValidObjectId } from 'src/app/mongo.utils';

export const stringToBool = string => {
  if (string.toLowerCase() === 'true') return true;
  else if (string.toLowerCase() === 'false') return false;
  else throw Error('not a boolean string');
};

export const isValidDate = string => {
  const dateRegex = /^\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/;
  const datetimeRegex = /^(\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01]))T([01]?[0-9]|2[0123]):([0-5][0-9]):([0-5][0-9])$/;
  return dateRegex.test(string) || datetimeRegex.test(string);
};

/**
 * The purpose of this method is to convert string to valid datatype
 * like '20' = 20 or 'true' = true
 * @param value receives string value
 * @returns the value in other datatype
 */
export const toValidDatatype = (value: string) => {
  const changedTypeValue = isValidObjectId(value)
    ? new Types.ObjectId(value)
    : !isNaN(+value)
    ? +value
    : isValidDate(value)
    ? new Date(value)
    : ['true', 'false'].includes(value.toLowerCase())
    ? stringToBool(value)
    : value;
  return changedTypeValue;
};
