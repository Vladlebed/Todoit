<template>
  <v-load-content class="fill-height d-flex flex-column workspace-container" :style="computedWorkspaceStyle" :class="{primary: !computedWorkspaceStyle}" :status="loadingStatus">
    <the-header ref="header" class="flex-grow-0" :filters.sync="filters" />
    <v-container class="flex-grow-1 overflow-x-auto overflow-y-hidden" fluid>
      <v-layout v-if="currentWorkspace" class="d-block" column fill-height>
        <draggable v-model="columns"
                   ref="container"
                   v-bind="dragOptions"
                   draggable=".allow-draggable"
                   :disabled="!currentWorkspaceProperties.allowColumnMove"
                   class="overflow-y-hidden fill-height"
        >
          <transition-group class="d-flex fill-height" style="position: relative" tag="div" name="list-complete">
            <v-todo-column v-for="(column) in columns"
                           :key="column.uid"
                           :column="column"
                           :filters="filters"
                           class="list-complete-item allow-draggable"
            />
            <v-btn v-if="currentWorkspaceProperties.allowCreateNewColumn"
                   color="primary"
                   :loading="pendingOfCreateColumn"
                   class="ml-2 create-column-btn"
                   key="createColumnBtn"
                   @click="onCreateColumn"
            >
              {{$t('createColumn')}}
            </v-btn>
          </transition-group>
        </draggable>
      </v-layout>
      <div v-else class="d-flex align-center justify-center fill-height">
        <v-btn @click="createWorkspace">Создать рабочий стол</v-btn>
      </div>
    </v-container>
  </v-load-content>
</template>

<script>
import TheHeader from '@/components/single/TheHeader/TheHeader';
import VTodoColumn from '@/components/common/VTodoColumn';
import VLoadContent from '@/components/common/VLoadContent';
import { mapGetters, mapActions } from 'vuex';
import draggable from 'vuedraggable';
import '@/assets/draggable.scss';
import '@/assets/transition.scss';
import { setItemOrder } from '@/_utils/workspace';

export default {
  name: 'Dashboard',

  components: { TheHeader, VTodoColumn, VLoadContent, draggable },

  i18n: {
    messages: {
      ru: {
        createColumn: 'Создать колонку',
      },
      en: {
        createColumn: 'create column',
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
      pendingOfCreateColumn: false,
    };
  },

  computed: {
    ...mapGetters('workspace', ['currentWorkspace', 'currentWorkspaceProperties']),
    columns: {
      get() {
        return this.currentWorkspace.data.columns;
      },
      set(columns) {
        this.updateColumns(setItemOrder(columns));
      },
    },
    computedWorkspaceStyle() {
      return this.currentWorkspace ? {
        backgroundImage: this.currentWorkspaceProperties.backgroundImage.file ? `url(${this.currentWorkspaceProperties.backgroundImage.file})` : null,
        backgroundColor: this.currentWorkspaceProperties.backgroundColor,
      } : null;
    },
    dragOptions() {
      return {
        animation: 200,
        ghostClass: 'ghost',
        group: 'columns',
      };
    },
  },

  created() {
    this.fetchWorkspaceList()
      .then((res) => (res ? this.getCurrentWorkspace() : false))
      .then(() => { this.loadingStatus = 'ready'; })
      .catch((err) => {
        console.log('DASHBOARD ERROR', err);
        this.loadingStatus = 'error';
      });
  },

  methods: {
    ...mapActions('workspace', [
      'fetchWorkspaceList',
      'getCurrentWorkspace',
      'createColumn',
      'createCard',
      'updateColumns',
    ]),
    async onCreateColumn() {
      this.pendingOfCreateColumn = true;

      await this.createColumn({ order: this.columns.length });
      this.pendingOfCreateColumn = false;

      const container = this.$refs.container.$el;
      setTimeout(() => {
        container.scrollTo({
          left: container.scrollWidth,
          behavior: 'smooth',
        });
      }, 301); // Скролл после завершения анимации
    },
    createWorkspace() {
      this.$refs.header.showWorkspaceCreateDialog();
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
