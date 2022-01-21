import Vue from 'vue';
import Vuex from 'vuex';
import user from '@/store/modules/user/user';
import workspace from '@/store/modules/workspace/workspace';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    user,
    workspace,
  },
});
