import firebase from 'firebase/compat/app';
import router from '@/router';

export default {
  namespaced: true,

  state: {
    user: {},
  },

  mutations: {
    setUser(state, user) {
      if (user) {
        state.user = user;
        return;
      }
      const { email, displayName, phoneNumber, photoURL, uid } = firebase.auth().currentUser;
      state.user = {
        email,
        displayName,
        phoneNumber,
        photoURL,
        uid,
      };
    },
  },

  actions: {
    getUid() {
      const user = firebase.auth().currentUser;
      return user ? user.uid : null;
    },
    loginWithEmailAndPassword: (ctx, { email, password }) => firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        router.push({ name: 'Dashboard' });
      }),
    logOut: ({ commit }) => firebase.auth().signOut()
      .then(() => {
        commit('workspace/setCurrentWorkspace', {}, { root: true });
        commit('workspace/updateWorkspaceList', [], { root: true });
        commit('setUser', {});
        router.push({ name: 'Auth' });
      }),
  },
};
