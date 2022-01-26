export const setItemOrder = (arr = []) => arr.map((item, i) => ({
  ...item,
  data: {
    ...item.data,
    properties: {
      ...item.data.properties,
      order: i,
    },
  },
}));
