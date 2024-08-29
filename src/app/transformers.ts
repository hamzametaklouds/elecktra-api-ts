export const stringToObjArray = (value): string | string[] => {
  const strObjArr = value.map(value => {
    return { name: value };
  });
  return strObjArr;
};

export const stringToObject = (value: string) => {
  return { name: value };
};
