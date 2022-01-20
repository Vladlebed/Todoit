import Vue from 'vue';
import firebase from 'firebase/compat';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';

import vuetify from './plugins/vuetify';
import 'firebase/database';

// Initialize Firebase
firebase.initializeApp({
  apiKey: 'AIzaSyAozgPztJbgvnELKXTQRf5D2ntmtzTIp5w',
  authDomain: 'todo-801f0.firebaseapp.com',
  projectId: 'todo-801f0',
  storageBucket: 'todo-801f0.appspot.com',
  messagingSenderId: '986536909373',
  appId: '1:986536909373:web:589a62c2dd40042b176854',
});

Vue.config.productionTip = false;

let app;

firebase.auth().onAuthStateChanged(() => {
  if (!app) {
    app = new Vue({
      router,
      store,
      vuetify,
      render: (h) => h(App),
    }).$mount('#app');
  }
});
