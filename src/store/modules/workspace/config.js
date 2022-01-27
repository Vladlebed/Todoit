import { defaultsDeep } from 'lodash';

const defaultProperties = (properties = {}) => defaultsDeep(properties, {
  name: '',
  description: '',
  backgroundColor: false,
  backgroundImage: {
    name: '',
    file: null,
  },
});

export const workspaceInstance = (workspaceName = '') => ({
  properties: defaultProperties({
    name: workspaceName,
    workspaceDisabled: false,
    allowCreateNewColumn: true,
    allowCreateNewCard: true,
    allowColumnMove: true,
    allowCardMove: true,
    allowColumnRemove: true,
    allowCardRemove: true,
    allowChangeColumnStyle: true,
    allowChangeCardStyle: true,
    allowChangeCardStatus: true,
    backgroundColor: '#1976D2',
  }),
  columns: [],
});

export const columnInstance = (order) => ({
  properties: defaultProperties({
    order,
  }),
  cards: [],
});

export const cardInstance = (order = 0) => ({
  properties: defaultProperties({
    isCompleted: '',
    descriptionShow: false,
    order,
  }),
});
