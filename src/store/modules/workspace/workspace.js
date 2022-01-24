import firebase from 'firebase/compat/app';
import { cardInstance, columnInstance, workspaceInstance } from '@/store/modules/workspace/config';
import { convertDatabaseListToClientFormat } from '@/_utils/database';

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
      state.workspace.current = state.workspace.list.find((workspace) => workspace.uid === uid);
    },
    updateWorkspaceList: (state, list) => {
      state.workspace.list = list;
    },
    changeWorkspace: (state, properties) => {
      state.workspace.current.data.properties = properties;
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

      return firebase
        .database()
        .ref(`/users/${uid}/workspaces/${state.workspace.current.uid}/properties`)
        .update(properties)
        .then(() => {
          commit('changeWorkspace', properties);
        });
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
        .then(() => { commit('setCurrentWorkspace', { data: workspace.data, uid: workspace.uid }); });
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
    // endregion workspaces

    // region columns
    createColumn: async ({ dispatch, commit, state }) => {
      const uid = await dispatch('user/getUid', {}, { root: true });
      const column = columnInstance();
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
    // endregion columns

    // region cards
    createCard: async ({ dispatch, commit, state }, columnUid) => {
      const uid = await dispatch('user/getUid', {}, { root: true });
      const card = cardInstance();
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
  },
};
