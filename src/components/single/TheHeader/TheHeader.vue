<template>
  <v-app-bar :style="computedHeaderStyle">

    <div v-if="workspace.list.length" class="mr-4 ml-1 workspace-select-container">
      <v-select v-model="computedCurrentWorkspace"
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
    <div v-if="computedCurrentWorkspace && computedCurrentWorkspace.uid" class="workspace-select-container">
      <v-text-field v-model.trim="_search"
                    dense
                    hide-details
                    :dark="currentWorkspaceHasImage"
                    full-width
                    placeholder="Поиск"
      />
    </div>

    <v-btn color="primary" v-if="computedCurrentWorkspace && computedCurrentWorkspace.uid" text small @click="showWorkspaceFiltersDialog">
      <v-icon>mdi-filter</v-icon>
    </v-btn>
    <v-btn color="primary" v-if="computedCurrentWorkspace && computedCurrentWorkspace.uid && isOwner" text small @click="showWorkspaceSettingsDialog">
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
                  :style="userImage"
        >
          <span v-if="!userImage" class="white--text text-h6">{{ userName }}</span>
        </v-avatar>
      </template>
      <v-list>
        <v-list-item v-for="(item, index) in menu" :key="index" link>
          <v-list-item-title @click="onMenuItemClick(item)">{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <the-header-dialog-workspace-filters ref="workspaceFilters" :filters.sync="_filters" />
    <the-header-dialog-workspace-settings ref="workspaceSettings" />
    <the-header-dialog-workspace-create  ref="workspaceCreate" />
  </v-app-bar>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import TheHeaderDialogWorkspaceSettings from '@/components/single/TheHeader/TheHeaderDialogWorkspaceSettings';
import TheHeaderDialogWorkspaceCreate from '@/components/single/TheHeader/TheHeaderDialogWorkspaceCreate';
import TheHeaderDialogWorkspaceFilters from '@/components/single/TheHeader/TheHeaderDialogWorkspaceFilters';
import { debounce } from 'lodash';

export default {
  name: 'TheHeader',

  components: { TheHeaderDialogWorkspaceSettings, TheHeaderDialogWorkspaceCreate, TheHeaderDialogWorkspaceFilters },

  props: {
    filters: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      menu: [
        // {
        //   title: this.$t('menu.settings'),
        // },
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
    ...mapState('user', ['user']),
    ...mapGetters('workspace', ['currentWorkspaceHasImage', 'currentWorkspace']),

    userImage() {
      return this.user?.photoURL ? { background: `center / cover no-repeat url(${this.user?.photoURL})` } : null;
    },
    userName() {
      let name = this.user.displayName ? `${this.user.displayName[0] + this.user.displayName[1]}` : null;
      if (!name) {
        name = this.user.email ? `${this.user.email[0] + this.user.email[1]}` : 'U';
      }
      return name;
    },
    isOwner() {
      return this.user.uid === this.$route.params.userUid;
    },

    computedCurrentWorkspace: {
      get() {
        return this.workspace.list.find((workspace) => workspace.uid === this.workspace.current?.uid) || this.currentWorkspace || {};
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
    _search: {
      get() {
        return this.filters.search;
      },
      set: debounce(function (v) {
        this.$emit('update:filters', {
          ...this.filters,
          search: v,
        });
      }, 300),
    },
    _filters: {
      get() {
        return this.filters;
      },
      set(v) {
        this.$emit('update:filters', v);
      },
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
    showWorkspaceFiltersDialog() {
      this.$refs.workspaceFilters.showDialog();
    },
  },
};
</script>

<style lang="scss" scoped>
  .workspace-select-container {
    width: 300px;
  }
</style>
