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
