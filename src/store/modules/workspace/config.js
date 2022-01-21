export const workspaceInstance = (workspaceName = '') => ({
  workspaceProperties: {
    name: workspaceName,
  },
  columns: [],
});

export const columnInstance = () => ({
  columnProperties: {
    name: '',
  },
  cards: [],
});

export const cardInstance = () => ({
  cardProperties: {
    name: '',
    text: '',
    isCompleted: '',
  },
});
