<template>
  <v-app-bar>
    <v-btn color="primary" @click="showDialog">
      {{currentWorkspace && currentWorkspace.data.properties.name || $t('workspaceAction')}}
    </v-btn>

    <v-spacer />

    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary" v-bind="attrs" v-on="on">
          {{ $t('menuName') }}
        </v-btn>
      </template>
      <v-list>
        <v-list-item v-for="(item, index) in menu" :key="index" link>
          <v-list-item-title @click="onMenuItemClick(item)">{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <the-header-dialog ref="dialog" />
  </v-app-bar>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import TheHeaderDialog from '@/components/single/TheHeader/TheHeaderDialog';

export default {
  name: 'TheHeader',

  components: { TheHeaderDialog },

  data() {
    return {
      menu: [
        {
          title: this.$t('menu.settings'),
        },
        {
          title: this.$t('menu.logout'),
          action: () => {
            this.logOut();
          },
        },
      ],
    };
  },

  i18n: {
    messages: {
      ru: {
        menuName: 'Меню',
        menu: {
          settings: 'Настройки',
          logout: 'Выход',
        },
        workspaceAction: 'Рабочий стол',
      },
      en: {
        menuName: 'Account',
        menu: {
          settings: 'Settings',
          logout: 'Log out',
        },
        workspaceAction: 'workspace',
      },
    },
  },

  computed: {
    ...mapState('workspace', ['workspace']),
    currentWorkspace() {
      return this.workspace.list.find((workspace) => workspace.uid === this.workspace.current?.uid);
    },
  },

  methods: {
    ...mapActions('user', ['logOut']),
    ...mapActions('workspace', ['createWorkspace', 'setCurrentWorkspace']),

    onMenuItemClick(item) {
      if (item.action) item.action();
    },

    showDialog() {
      this.$refs.dialog.showDialog();
    },
  },
};
</script>

<style scoped>

</style>
