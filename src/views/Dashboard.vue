<template>
  <div class="fill-height d-flex flex-column workspace-container" :style="computedWorkspaceStyle">
    <the-header class="flex-grow-0" />
    <v-container ref="container" class="flex-grow-1 overflow-x-auto overflow-y-hidden" fluid>
      <v-layout v-if="currentWorkspace" class="d-block" column fill-height>
        <draggable v-model="columns"
                   v-bind="dragOptions"
                   draggable=".allow-draggable"
                   :disabled="!currentWorkspaceProperties.allowColumnMove"
        >
          <transition-group class="d-flex fill-height" tag="div" name="list-complete">
            <v-todo-column v-for="(column) in columns"
                           :key="column.uid"
                           :column="column"
                           class="list-complete-item allow-draggable"
            />
            <v-btn v-if="currentWorkspaceProperties.allowCreateNewColumn"
                   color="primary"
                   class="mt-2 ml-2 create-column-btn"
                   key="createColumnBtn"
                   @click="onCreateColumn"
            >
              {{$t('createColumn')}}
            </v-btn>
          </transition-group>
        </draggable>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import TheHeader from '@/components/single/TheHeader/TheHeader';
import VTodoColumn from '@/components/common/VTodoColumn';
import { mapGetters, mapActions } from 'vuex';
import draggable from 'vuedraggable';
import '@/assets/draggable.scss';
import '@/assets/transition.scss';
import { setItemOrder } from '@/_utils/workspace';

export default {
  name: 'Dashboard',

  components: { TheHeader, VTodoColumn, draggable },

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
      } : {};
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
      .then(() => {
        this.getCurrentWorkspace();
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
      await this.createColumn();
      setTimeout(() => {
        const { container } = this.$refs;
        container.scrollTo({
          left: container.scrollWidth,
          behavior: 'smooth',
        });
      }, 301); // Скролл после завершения анимации
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
