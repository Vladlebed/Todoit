<template>
  <v-app-bar :style="computedHeaderStyle">

    <div v-if="workspace.list.length" class="mr-4 ml-1 workspace-select-container">
      <v-select v-model="currentWorkspace"
                :items="workspace.list"
                :item-text="(v) => v.data.properties.name"
                :placeholder="$t('workspaceSelect')"
                :no-data-text="$t('noData')"
                :dark="currentWorkspaceHasImage"
                dense
                hide-details
                return-object
                full-width
      />
    </div>

    <v-btn color="primary" v-if="currentWorkspace && currentWorkspace.uid" text small @click="showWorkspaceSettingsDialog">
      <v-icon>mdi-cog</v-icon>
    </v-btn>
    <v-btn color="primary" text small @click="showWorkspaceCreateDialog">
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <v-spacer />

    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-avatar v-bind="attrs"
                  v-on="on"
                  color="primary"
                  size="40"
        ><span class="white--text text-h6">T</span></v-avatar>
      </template>
      <v-list>
        <v-list-item v-for="(item, index) in menu" :key="index" link>
          <v-list-item-title @click="onMenuItemClick(item)">{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <the-header-dialog-workspace-settings ref="workspaceSettings" />
    <the-header-dialog-workspace-create  ref="workspaceCreate" />
  </v-app-bar>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import TheHeaderDialogWorkspaceSettings from '@/components/single/TheHeader/TheHeaderDialogWorkspaceSettings';
import TheHeaderDialogWorkspaceCreate from '@/components/single/TheHeader/TheHeaderDialogWorkspaceCreate';

export default {
  name: 'TheHeader',

  components: { TheHeaderDialogWorkspaceSettings, TheHeaderDialogWorkspaceCreate },

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
        menu: {
          settings: 'Настройки',
          logout: 'Выход',
        },
        noData: 'Нет рабочих столов',
        workspaceSelect: 'Текущий рабочий стол',
        workspaceAction: 'Рабочий стол',
      },
      en: {
        menu: {
          settings: 'Settings',
          logout: 'Log out',
        },
        noData: 'No workspaces',
        workspaceSelect: 'Current workspace',
        workspaceAction: 'workspace',
      },
    },
  },

  computed: {
    ...mapState('workspace', ['workspace']),
    ...mapGetters('workspace', ['currentWorkspaceHasImage']),

    currentWorkspace: {
      get() {
        return this.workspace.list.find((workspace) => workspace.uid === this.workspace.current?.uid);
      },
      set(v) {
        this.setCurrentWorkspace(v);
      },
    },
    computedHeaderStyle() {
      return this.currentWorkspaceHasImage ? {
        backgroundColor: 'rgba(0,0,0,0.65)',
      } : {
        backgroundColor: 'white',
      };
    },
  },

  methods: {
    ...mapActions('user', ['logOut']),
    ...mapActions('workspace', ['createWorkspace', 'setCurrentWorkspace']),

    onMenuItemClick(item) {
      if (item.action) item.action();
    },

    showWorkspaceSettingsDialog() {
      this.$refs.workspaceSettings.showDialog();
    },
    showWorkspaceCreateDialog() {
      this.$refs.workspaceCreate.showDialog();
    },
  },
};
</script>

<style lang="scss" scoped>
  .workspace-select-container {
    width: 300px;
  }
</style>
