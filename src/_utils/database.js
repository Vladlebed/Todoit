export const convertDatabaseListToClientFormat = (obj) => Object.keys(obj || {})
  .map((key) => ({
    uid: key,
    data: obj[key],
  }));
