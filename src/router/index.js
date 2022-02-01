import Vue from 'vue';
import VueRouter from 'vue-router';
import firebase from 'firebase/compat/app';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import(/* webpackChunkName: "PageDashboard" */ '@/views/Dashboard'),
    children: [
      {
        path: 'u/:userUid/workspace/:workspaceUid',
        name: 'Workspace',
        component: () => import(/* webpackChunkName: "Workspace" */ '@/components/single/TheWorkspace/TheWorkspace'),
      },
    ],
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import(/* webpackChunkName: "PageAuth" */ '@/views/Auth'),
    meta: { noAuth: true },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  const { currentUser } = firebase.auth();
  const requireAuth = to.matched.some((record) => !record.meta.noAuth);

  if (requireAuth && !currentUser) next({ name: 'Auth' });
  else next();
});

export default router;
