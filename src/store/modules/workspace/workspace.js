import firebase from 'firebase/compat/app';
import { cardInstance, columnInstance, workspaceInstance } from '@/store/modules/workspace/config';
import { convertDatabaseListToClientFormat, convertListToDatabaseFormat } from '@/_utils/database';
import { cloneDeep, defaultsDeep } from 'lodash';

export default {
  namespaced: true,

  state: {
    workspace: {
      current: null,
      list: [],
    },
  },

  mutations: {
    // region workspaces
    setCurrentWorkspace: (state, { uid }) => {
      if (!uid) {
        state.workspace.current = null;
        return;
      }

      const currentWorkspace = state.workspace.list.find((workspace) => workspace.uid === uid) || {};
      defaultsDeep(currentWorkspace.data, workspaceInstance());

      const compareFn = (a, b) => (a.data.properties?.order || 0) - (b.data.properties?.order || 0);
      currentWorkspace.data.columns.sort(compareFn);
      currentWorkspace.data.columns.forEach((column) => { column.data.cards.sort(compareFn); });

      state.workspace.current = currentWorkspace;
    },
    updateWorkspaceList: (state, list) => {
      state.workspace.list = list;
    },
    changeWorkspace: (state, properties) => {
      state.workspace.current.data.properties = properties;
    },
    removeWorkspace: (state, workspaceIndex) => {
      state.workspace.list.splice(workspaceIndex, 1);
    },
    // endregion workspaces

    // region columns
    addColumn: (state, column) => {
      state.workspace.current.data.columns.push(column);
    },
    changeColumn: (state, { columnUid, properties }) => {
      const column = state.workspace.current.data.columns.find((_column) => _column.uid === columnUid);
      column.data.properties = properties;
    },
    removeColumn: (state, columnUid) => {
      const index = state.workspace.current.data.columns.findIndex((column) => column.uid === columnUid);
      state.workspace.current.data.columns.splice(index, 1);
    },
    updateColumns: (state, columns) => {
      state.workspace.current.data.columns = columns;
    },
    // endregion columns

    // region cards
    addCard: (state, { columnUid, card }) => {
      state.workspace.current.data.columns
        .find((column) => column.uid === columnUid)
        .data
        .cards
        .push(card);
    },
    changeCard: (state, { columnUid, cardUid, properties }) => {
      const column = state.workspace.current.data.columns.find((_column) => _column.uid === columnUid);
      const card = column.data.cards.find((_card) => _card.uid === cardUid);
      card.data.properties = properties;
    },
    updateCards: (state, { columnUid, cards }) => {
      const column = state.workspace.current.data.columns.find((_column) => _column.uid === columnUid);
      column.data.cards = cards;
    },
    removeCard: (state, { columnUid, cardUid }) => {
      const column = state.workspace.current.data.columns.find((_column) => _column.uid === columnUid);
      const cardIndex = column.data.cards.findIndex((card) => card.uid === cardUid);
      column.data.cards.splice(cardIndex, 1);
    },
    // endregion cards
  },

  actions: {
    // region workspaces
    changeWorkspace: async ({ dispatch, commit, state }, properties) => {
      const uid = await dispatch('user/getUid', {}, { root: true });
      const oldProperties = cloneDeep(properties);

      commit('changeWorkspace', properties);
      return firebase
        .database()
        .ref(`/users/${uid}/workspaces/${state.workspace.current.uid}/properties`)
        .update(properties)
        .catch(() => { commit('changeWorkspace', oldProperties); });
    },
    getCurrentWorkspace: async ({ dispatch, commit, state }) => {
      const uid = await dispatch('user/getUid', {}, { root: true });
      return firebase.database().ref(`/users/${uid}/currentWorkspace`).once('value')
        .then((r) => {
          const workspaceUid = r.val();
          const workspace = workspaceUid ? state.workspace.list.find((_workspace) => _workspace.uid === workspaceUid) : null;

          if (workspace) {
            commit('setCurrentWorkspace', workspace);
          }
        });
    },
    setCurrentWorkspace: async ({ dispatch, commit }, workspace) => {
      const uid = await dispatch('user/getUid', {}, { root: true });
      return firebase.database().ref(`/users/${uid}/currentWorkspace`)
        .set(workspace.uid)
        .then(() => {
          commit('setCurrentWorkspace', { data: workspace.data, uid: workspace.uid });
        });
    },
    fetchWorkspaceList: async ({ dispatch, commit }) => {
      const uid = await dispatch('user/getUid', {}, { root: true });
      return firebase.database().ref(`/users/${uid}/workspaces`).once('value')
        .then((r) => {
          // TODO Сделать рекурсией
          const workspaceList = convertDatabaseListToClientFormat(r.val(), ['columns', 'cards']);
          commit('updateWorkspaceList', workspaceList);
        });
    },
    createWorkspace: async ({ dispatch }, workspaceName) => {
      const uid = await dispatch('user/getUid', {}, { root: true });
      const workspace = workspaceInstance(workspaceName);
      return firebase
        .database()
        .ref(`/users/${uid}/workspaces`)
        .push(workspace)
        .then((r) => {
          dispatch('fetchWorkspaceList')
            .then(() => {
              dispatch('setCurrentWorkspace', {
                uid: r.key,
                data: workspace,
              });
            });
        });
    },
    removeCurrentWorkspace: async ({ dispatch, commit, state }) => {
      const uid = await dispatch('user/getUid', {}, { root: true });
      const currentWorkspace = cloneDeep(state.workspace.current);
      const currentWorkspaceIndex = state.workspace.list.findIndex((workspace) => workspace.uid === state.workspace.current.uid);
      const nextWorkspace = state.workspace.list[currentWorkspaceIndex + 1] || state.workspace.list[currentWorkspaceIndex - 1];

      dispatch('setCurrentWorkspace', { uid: nextWorkspace?.uid, data: nextWorkspace?.data });
      commit('removeWorkspace', currentWorkspaceIndex);
      return firebase
        .database()
        .ref(`/users/${uid}/workspaces/${currentWorkspace.uid}`)
        .remove()
        .catch(() => { commit('setCurrentWorkspace', { uid: currentWorkspace.uid, data: currentWorkspace.data }); });
    },
    // endregion workspaces

    // region columns
    createColumn: async ({ dispatch, commit, state }, { order }) => {
      const uid = await dispatch('user/getUid', {}, { root: true });
      const column = columnInstance(order);
      return firebase
        .database()
        .ref(`/users/${uid}/workspaces/${state.workspace.current.uid}/columns`)
        .push(column)
        .then((r) => {
          commit('addColumn', {
            uid: r.key,
            data: column,
          });
        });
    },
    removeColumn: async ({ dispatch, commit, state }, columnUid) => {
      const uid = await dispatch('user/getUid', {}, { root: true });
      return firebase
        .database()
        .ref(`/users/${uid}/workspaces/${state.workspace.current.uid}/columns/${columnUid}`)
        .remove()
        .then(() => {
          commit('removeColumn', columnUid);
        });
    },
    changeColumn: async ({ dispatch, commit, state }, { columnUid, properties }) => {
      const uid = await dispatch('user/getUid', {}, { root: true });

      return firebase
        .database()
        .ref(`/users/${uid}/workspaces/${state.workspace.current.uid}/columns/${columnUid}/properties`)
        .update(properties)
        .then(() => {
          commit('changeColumn', { columnUid, properties });
        });
    },
    updateColumns: async ({ dispatch, commit, state }, newColumns) => {
      const uid = await dispatch('user/getUid', {}, { root: true });
      const oldColumns = cloneDeep(state.workspace.current.data.columns);

      commit('updateColumns', newColumns);
      return firebase
        .database()
        .ref(`/users/${uid}/workspaces/${state.workspace.current.uid}/columns`)
        .set(convertListToDatabaseFormat(newColumns, ['cards']))
        .catch(() => { commit('updateColumns', oldColumns); });
    },
    // endregion columns

    // region cards
    createCard: async ({ dispatch, commit, state }, { columnUid, order }) => {
      const uid = await dispatch('user/getUid', {}, { root: true });
      const card = cardInstance(order);
      return firebase
        .database()
        .ref(`/users/${uid}/workspaces/${state.workspace.current.uid}/columns/${columnUid}/cards`)
        .push(card)
        .then((r) => {
          commit('addCard', {
            columnUid,
            card: {
              uid: r.key,
              data: card,
            },
          });
        });
    },
    changeCard: async ({ dispatch, commit, state }, { columnUid, cardUid, properties }) => {
      const uid = await dispatch('user/getUid', {}, { root: true });

      return firebase
        .database()
        .ref(`/users/${uid}/workspaces/${state.workspace.current.uid}/columns/${columnUid}/cards/${cardUid}/properties`)
        .update(properties)
        .then(() => {
          commit('changeCard', { columnUid, cardUid, properties });
        });
    },
    updateCards: async ({ dispatch, commit, state }, { columnUid, cards }) => {
      const uid = await dispatch('user/getUid', {}, { root: true });
      const oldColumn = cloneDeep(state.workspace.current.data.columns.find((_column) => _column.uid === columnUid));

      commit('updateCards', { columnUid, cards });
      return firebase
        .database()
        .ref(`/users/${uid}/workspaces/${state.workspace.current.uid}/columns/${columnUid}/cards`)
        .set(convertListToDatabaseFormat(cards))
        .catch(() => { commit('updateCards', { columnUid, cards: oldColumn.cards }); });
    },
    removeCard: async ({ dispatch, commit, state }, { columnUid, cardUid }) => {
      const uid = await dispatch('user/getUid', {}, { root: true });
      return firebase
        .database()
        .ref(`/users/${uid}/workspaces/${state.workspace.current.uid}/columns/${columnUid}/cards/${cardUid}`)
        .remove()
        .then(() => {
          commit('removeCard', { columnUid, cardUid });
        });
    },
    // endregion cards
  },
  getters: {
    currentWorkspace: (s) => s.workspace.current,
    currentWorkspaceProperties: (s) => s.workspace.current?.data.properties || {},
    currentWorkspaceHasImage: (s) => !!s.workspace.current?.data.properties?.backgroundImage?.name,
  },
};
