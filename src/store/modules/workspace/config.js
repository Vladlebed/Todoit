import { defaultsDeep } from 'lodash';

export const urlFactory = {
  WORKSPACE: (userUid, workspaceUid) => `/users/${userUid}/workspaces/${workspaceUid}`,
  WORKSPACE_LIST: (userUid) => `/users/${userUid}/workspaces`,
  WORKSPACE_PROPERTIES: (userUid, workspaceUid) => `/users/${userUid}/workspaces/${workspaceUid}/properties`,
  WORKSPACE_CURRENT: (userUid) => `/users/${userUid}/currentWorkspace`,

  COLUMN: (userUid, workspaceUid, columnUid) => `${urlFactory.WORKSPACE(userUid, workspaceUid)}/columns/${columnUid}`,
  COLUMN_LIST: (userUid, workspaceUid) => `${urlFactory.WORKSPACE(userUid, workspaceUid)}/columns`,
  COLUMN_PROPERTIES: (userUid, workspaceUid, columnUid) => `${urlFactory.WORKSPACE(userUid, workspaceUid)}/columns/${columnUid}/properties`,

  CARD: (userUid, workspaceUid, columnUid, cardUid) => `${urlFactory.COLUMN(userUid, workspaceUid, columnUid)}/cards/${cardUid}`,
  CARD_LIST: (userUid, workspaceUid, columnUid) => `${urlFactory.COLUMN(userUid, workspaceUid, columnUid)}/cards`,
  CARD_PROPERTIES: (userUid, workspaceUid, columnUid, cardUid) => `${urlFactory.COLUMN(userUid, workspaceUid, columnUid)}/cards/${cardUid}/properties`,
};

const defaultProperties = (properties = {}) => defaultsDeep(properties, {
  name: '',
  description: '',
  backgroundColor: false,
  backgroundImage: {
    name: '',
    file: null,
  },
});

export const workspaceInstance = ({ workspaceName = '', backgroundColor = '#1976d2' }) => ({
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
    public: false,
    backgroundColor,
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
