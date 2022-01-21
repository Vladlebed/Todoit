import firebase from 'firebase/compat/app';
import router from '@/router';

export default {
  namespaced: true,

  actions: {
    getUid() {
      const user = firebase.auth().currentUser;
      return user ? user.uid : null;
    },
    loginWithEmailAndPassword: (ctx, { email, password }) => firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => { router.push({ name: 'Dashboard' }); }),
    logOut: () => firebase.auth().signOut()
      .then(() => { router.push({ name: 'Auth' }); }),
  },
};
