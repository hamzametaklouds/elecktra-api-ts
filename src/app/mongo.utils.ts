import { toValidDatatype } from 'src/app/values-typecasting.function';

export const isValidObjectId = (id: string) => id.match(/^[0-9a-fA-F]{24}$/);

/**
 * The purpose of this method is to return mongo query object with correct data types as it is required for aggregate filteration
 * like id=ObjectId("abcd1234abcd1234") instead of id="abcd1234abcd1234"
 * @param $filter receives filter query object as an argument that might contain $rpp, page number, order etc
 * @returns the paginated crop-calendars of a single crop
 */
export const matchFilters = $filter => {
  let filterArray = Array.isArray($filter) ? $filter : [$filter];
  filterArray = filterArray.map(filter => {
    // if filterArray is a value[], perform operation on value
    if (typeof filter !== 'object') {
      if (typeof filter !== 'string') return;
      return toValidDatatype(filter);
    }

    // else if filterArray is an object[], then iterate over fields and perform operations on values
    Object.keys(filter).forEach(field => {
      if (typeof filter[field] !== 'object') {
        if (typeof filter[field] !== 'string') return;
        filter[field] = toValidDatatype(filter[field]);
      } else {
        filter[field] = matchFilters(filter[field]);
      }
    });
    return filter;
  });
  return Array.isArray($filter) ? filterArray : filterArray[0];
};
