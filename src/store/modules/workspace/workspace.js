import firebase from 'firebase/compat/app';
import { cardInstance, columnInstance, workspaceInstance } from '@/store/modules/workspace/config';
import { convertDatabaseListToClientFormat, convertListToDatabaseFormat } from '@/_utils/database';
import { cloneDeep, defaultsDeep } from 'lodash';
import { generateColor } from '@/_utils/color';
import router from '@/router';

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
    setCurrentWorkspace: (state, { workspace, userUid, workspaceUid }) => {
      if (!workspaceUid) {
        state.workspace.current = null;
        if (userUid) {
          router.replace({ name: 'Dashboard' });
        }
        return;
      }

      const currentWorkspace = workspace || state.workspace.list.find((_workspace) => _workspace.uid === workspaceUid) || {};
      defaultsDeep(currentWorkspace.data, workspaceInstance({}));

      const compareFn = (a, b) => (a.data.properties?.order || 0) - (b.data.properties?.order || 0);
      currentWorkspace.data.columns.sort(compareFn);
      currentWorkspace.data.columns.forEach((column) => { column.data.cards.sort(compareFn); });

      state.workspace.current = currentWorkspace;

      if (router.currentRoute.params.userUid !== userUid || router.currentRoute.params.workspaceUid !== workspaceUid) {
        router.push({ name: 'Workspace', params: { userUid, workspaceUid } });
      }
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
    getExternalWorkspace: ({ commit }, { userUid, workspaceUid }) => firebase.database().ref(`/users/${userUid}/workspaces/${workspaceUid}`).once('value')
      .then((r) => {
        const externalWorkspace = r.val();
        if (externalWorkspace.columns) {
          externalWorkspace.columns = convertDatabaseListToClientFormat(externalWorkspace.columns, ['cards']);
        }
        return commit('setCurrentWorkspace', { workspace: { data: externalWorkspace, uid: workspaceUid }, workspaceUid, userUid });
      }),
    getCurrentWorkspace: async ({ dispatch, commit, state }) => {
      const uid = await dispatch('user/getUid', {}, { root: true });

      return firebase.database().ref(`/users/${uid}/currentWorkspace`).once('value')
        .then((r) => {
          const workspaceUid = r.val();
          const workspace = workspaceUid ? state.workspace.list.find((_workspace) => _workspace.uid === workspaceUid) : null;

          if (workspace) {
            commit('setCurrentWorkspace', { workspaceUid: workspace.uid, userUid: uid });
          }
          return workspace;
        });
    },
    setCurrentWorkspace: async ({ dispatch, commit }, workspace) => {
      const uid = await dispatch('user/getUid', {}, { root: true });
      const methodName = workspace ? 'set' : 'remove';

      if (workspace) {
        return firebase.database().ref(`/users/${uid}/currentWorkspace`)[methodName](workspace.uid)
          .then(() => {
            commit('setCurrentWorkspace', workspace ? { workspaceUid: workspace.uid, userUid: uid } : null);
          });
      }
      return firebase.database().ref(`/users/${uid}/currentWorkspace`)
        .remove()
        .then(() => {
          commit('setCurrentWorkspace', {});
        });
    },
    fetchWorkspaceList: async ({ dispatch, commit }) => {
      const uid = await dispatch('user/getUid', {}, { root: true });
      return firebase.database().ref(`/users/${uid}/workspaces`).once('value')
        .then((r) => {
          // TODO Сделать рекурсией
          const workspaceList = convertDatabaseListToClientFormat(r.val(), ['columns', 'cards']);
          commit('updateWorkspaceList', workspaceList);
          return r.val();
        });
    },
    createWorkspace: async ({ dispatch }, workspaceName) => {
      const uid = await dispatch('user/getUid', {}, { root: true });
      const workspace = workspaceInstance({ workspaceName, backgroundColor: generateColor() });
      return firebase
        .database()
        .ref(`/users/${uid}/workspaces`)
        .push(workspace)
        .then((r) => dispatch('fetchWorkspaceList')
          .then(() => dispatch('setCurrentWorkspace', {
            uid: r.key,
            data: workspace,
          })));
    },
    removeCurrentWorkspace: async ({ dispatch, commit, state }) => {
      const uid = await dispatch('user/getUid', {}, { root: true });
      const currentWorkspace = cloneDeep(state.workspace.current);
      const currentWorkspaceIndex = state.workspace.list.findIndex((workspace) => workspace.uid === state.workspace.current.uid);
      const nextWorkspace = state.workspace.list[currentWorkspaceIndex + 1] || state.workspace.list[currentWorkspaceIndex - 1];

      dispatch('setCurrentWorkspace', nextWorkspace ? { workspaceUid: nextWorkspace.uid, userUid: uid } : null);

      commit('removeWorkspace', currentWorkspaceIndex);
      return firebase
        .database()
        .ref(`/users/${uid}/workspaces/${currentWorkspace.uid}`)
        .remove()
        .catch(() => { commit('setCurrentWorkspace', { workspaceUid: currentWorkspace.uid, userUid: uid }); });
    },
    // endregion workspaces

    // region columns
    createColumn: ({ commit, state }, { order }) => {
      const uid = router.currentRoute.params.userUid;
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
    removeColumn: ({ commit, state }, columnUid) => {
      const uid = router.currentRoute.params.userUid;
      return firebase
        .database()
        .ref(`/users/${uid}/workspaces/${state.workspace.current.uid}/columns/${columnUid}`)
        .remove()
        .then(() => {
          commit('removeColumn', columnUid);
        });
    },
    changeColumn: ({ commit, state }, { columnUid, properties }) => {
      const uid = router.currentRoute.params.userUid;

      return firebase
        .database()
        .ref(`/users/${uid}/workspaces/${state.workspace.current.uid}/columns/${columnUid}/properties`)
        .update(properties)
        .then(() => {
          commit('changeColumn', { columnUid, properties });
        });
    },
    updateColumns: ({ commit, state }, newColumns) => {
      const uid = router.currentRoute.params.userUid;
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
    createCard: ({ commit, state }, { columnUid, order }) => {
      const uid = router.currentRoute.params.userUid;
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
    changeCard: ({ commit, state }, { columnUid, cardUid, properties }) => {
      const uid = router.currentRoute.params.userUid;

      return firebase
        .database()
        .ref(`/users/${uid}/workspaces/${state.workspace.current.uid}/columns/${columnUid}/cards/${cardUid}/properties`)
        .update(properties)
        .then(() => {
          commit('changeCard', { columnUid, cardUid, properties });
        });
    },
    updateCards: ({ commit, state }, { columnUid, cards }) => {
      const uid = router.currentRoute.params.userUid;
      const oldColumn = cloneDeep(state.workspace.current.data.columns.find((_column) => _column.uid === columnUid));

      commit('updateCards', { columnUid, cards });
      return firebase
        .database()
        .ref(`/users/${uid}/workspaces/${state.workspace.current.uid}/columns/${columnUid}/cards`)
        .set(convertListToDatabaseFormat(cards))
        .catch(() => { commit('updateCards', { columnUid, cards: oldColumn.cards }); });
    },
    removeCard: ({ commit, state }, { columnUid, cardUid }) => {
      const uid = router.currentRoute.params.userUid;
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
