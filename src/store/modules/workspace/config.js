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
    allowColumnMove: true,
    allowCardMove: true,
    allowChangeColumnStyle: true,
    allowChangeCardStyle: true,
    allowChangeCardStatus: true,
    backgroundColor: '#1976D2',
  }),
  columns: [],
});

export const columnInstance = () => ({
  properties: defaultProperties(),
  cards: [],
});

export const cardInstance = () => ({
  properties: defaultProperties({
    isCompleted: '',
    descriptionShow: false,
  }),
});
