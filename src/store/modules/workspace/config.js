import { defaultsDeep } from 'lodash';
import { convertDateToClientFormat } from '@/_utils/date';

export const urlFactory = {
  WORKSPACE: (userUid, workspaceUid) => `/users/${userUid}/workspaces/${workspaceUid}`,
  WORKSPACE_LIST: (userUid) => `/users/${userUid}/workspaces`,
  WORKSPACE_PROPERTIES: (userUid, workspaceUid) => `/users/${userUid}/workspaces/${workspaceUid}/properties`,
  WORKSPACE_CURRENT: (userUid) => `/users/${userUid}/currentWorkspace`,
  WORKSPACE_CHANGES: (userUid, workspaceUid) => `/users/${userUid}/workspaces/${workspaceUid}/changesList`,

  COLUMN: (userUid, workspaceUid, columnUid) => `${urlFactory.WORKSPACE(userUid, workspaceUid)}/columns/${columnUid}`,
  COLUMN_LIST: (userUid, workspaceUid) => `${urlFactory.WORKSPACE(userUid, workspaceUid)}/columns`,
  COLUMN_PROPERTIES: (userUid, workspaceUid, columnUid) => `${urlFactory.WORKSPACE(userUid, workspaceUid)}/columns/${columnUid}/properties`,

  CARD: (userUid, workspaceUid, columnUid, cardUid) => `${urlFactory.COLUMN(userUid, workspaceUid, columnUid)}/cards/${cardUid}`,
  CARD_LIST: (userUid, workspaceUid, columnUid) => `${urlFactory.COLUMN(userUid, workspaceUid, columnUid)}/cards`,
  CARD_PROPERTIES: (userUid, workspaceUid, columnUid, cardUid) => `${urlFactory.COLUMN(userUid, workspaceUid, columnUid)}/cards/${cardUid}/properties`,
};

export const allowedPositionList = ['center', 'left', 'right', 'top', 'bottom'];
export const allowedSizesList = ['cover', 'contain'];

export const changeInstance = ({ userUid, userName = '', action, value = '' }) => ({
  userUid,
  userName,
  action,
  value,
  date: convertDateToClientFormat(new Date(), true),
});

const defaultProperties = (properties = {}) => defaultsDeep(properties, {
  name: '',
  description: '',
  backgroundColor: false,
  backgroundImage: {
    name: '',
    file: false,
    position: 'center',
    size: 'cover',
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
  changesList: [],
});

export const columnInstance = ({ name, order }) => ({
  properties: defaultProperties({
    name,
    order,
  }),
  cards: [],
  lastChange: false,
});

export const cardInstance = ({ name, order } = 0) => ({
  properties: defaultProperties({
    name,
    isCompleted: '',
    descriptionShow: false,
    order,
  }),
  lastChange: false,
});
