import { cloneDeep } from 'lodash';

export const convertDatabaseListToClientFormat = (obj, nesting = []) => Object.keys(obj || {})
  .map((key) => {
    const result = {
      uid: key,
      data: obj[key],
    };

    if (nesting.length) {
      result.data[nesting[0]] = convertDatabaseListToClientFormat(result.data[nesting[0]], nesting.filter((el, i) => i !== 0));
    }

    return result;
  });

export const convertListToDatabaseFormat = (array, nesting = []) => {
  const _array = cloneDeep(array);
  const result = {};
  const nextNesting = nesting.filter((el, i) => i !== 0);

  _array.forEach((obj) => {
    result[obj.uid] = obj.data;

    if (nesting.length) {
      result[obj.uid][nesting[0]] = convertListToDatabaseFormat(obj.data[nesting[0]], nextNesting);
    }
  });

  return result;
};
