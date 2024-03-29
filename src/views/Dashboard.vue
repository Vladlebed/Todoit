<template>
  <v-load-content class="fill-height d-flex flex-column workspace-container" :style="computedWorkspaceStyle" :class="{primary: !computedWorkspaceStyle}" :status="loadingStatus">
    <the-header ref="header" class="flex-grow-0" :filters.sync="filters" />
    <v-container class="flex-grow-1 overflow-x-auto overflow-y-hidden" fluid>
      <router-view :filters="filters" />
      <div v-if="!currentWorkspace" class="d-flex align-center justify-center fill-height">
        <v-btn @click="createWorkspace">{{ $t('createWorkspace') }}</v-btn>
      </div>
    </v-container>
  </v-load-content>
</template>

<script>
import TheHeader from '@/components/single/TheHeader/TheHeader';
import VLoadContent from '@/components/common/VLoadContent';
import { mapGetters, mapActions, mapMutations, mapState } from 'vuex';

export default {
  name: 'Dashboard',

  components: { TheHeader, VLoadContent },

  i18n: {
    messages: {
      ru: {
        createWorkspace: 'Создать рабочий стол',
      },
      en: {
        createWorkspace: 'Create workspace',
      },
    },
  },

  data() {
    return {
      filters: {
        search: '',
        onlyCompleted: false,
        hasName: false,
        hasDescription: false,
      },
      loadingStatus: 'loading',
    };
  },

  computed: {
    ...mapState('workspace', ['workspace']),
    ...mapGetters('workspace', ['currentWorkspace', 'currentWorkspaceProperties']),
    computedWorkspaceStyle() {
      return this.currentWorkspace ? {
        backgroundImage: this.currentWorkspaceProperties.backgroundImage.file ? `url(${this.currentWorkspaceProperties.backgroundImage.file})` : null,
        backgroundPosition: this.currentWorkspaceProperties.backgroundImage.position,
        backgroundSize: this.currentWorkspaceProperties.backgroundImage.size,
        backgroundColor: this.currentWorkspaceProperties.backgroundColor,
      } : null;
    },
  },

  created() {
    this.setUser();
    this.fetchWorkspaceList()
      .then((res) => (res ? this.definitionWorkspace() : false))
      .then(() => { this.loadingStatus = 'ready'; })
      .catch((err) => {
        console.log('DASHBOARD ERROR', err);
        this.loadingStatus = 'error';
      });
  },

  methods: {
    ...mapMutations('user', ['setUser']),
    ...mapActions('user', ['getUid']),
    ...mapActions('workspace', [
      'fetchWorkspaceList',
      'getCurrentWorkspace',
      'getExternalWorkspace',
      'setCurrentWorkspace',
    ]),
    createWorkspace() {
      this.$refs.header.showWorkspaceCreateDialog();
    },
    async definitionWorkspace() {
      const { workspaceUid } = this.$route.params;
      const { userUid } = this.$route.params;

      if (workspaceUid) {
        const uid = await this.getUid();
        if (userUid !== uid) {
          return this.getExternalWorkspace({ workspaceUid, userUid })
            .catch((err) => {
              if (err.code.toLowerCase() === 'permission_denied') {
                this.$notify({
                  group: 'foo',
                  title: 'У вас нет доступа к этому рабочему столу',
                  type: 'error',
                });
              }
            });
        }

        const workspace = this.workspace.list.find((_workspace) => _workspace.uid === workspaceUid);

        if (workspace) {
          this.setCurrentWorkspace(workspace);
        } else {
          this.$notify({
            group: 'foo',
            title: 'Рабочий стол не найден или был удалён',
            type: 'error',
          });
          this.$router.push({ name: 'Dashboard' });
        }
      }
      return this.getCurrentWorkspace();
    },
  },
};
</script>

<style lang="scss">
  .workspace-container {
    background-size: cover;
    transition: .5s background-color ease;
  }
</style>
