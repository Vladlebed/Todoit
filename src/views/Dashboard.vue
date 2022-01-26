<template>
  <div class="fill-height d-flex flex-column workspace-container" :style="computedWorkspaceStyle">
    <the-header class="flex-grow-0" />
    <v-container ref="container" class="flex-grow-1 overflow-x-auto overflow-y-hidden" fluid>
      <v-layout v-if="currentWorkspace" class="d-block" column fill-height>
        <draggable v-model="columns"
                   v-bind="dragOptions"
                   draggable=".list-complete-item"
        >
          <transition-group class="d-flex fill-height" tag="div" name="list-complete">
            <v-todo-column v-for="(column) in columns"
                           :key="column.uid"
                           :column="column"
                           class="list-complete-item"
            />
            <v-btn color="primary"
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
    ...mapGetters('workspace', ['currentWorkspace']),

    columns: {
      get() {
        return this.currentWorkspace.data.columns;
      },
      set(columns) {
        // TODO refactor this
        const _c = columns.map((column, i) => ({
          ...column,
          data: {
            ...column.data,
            properties: {
              ...column.data.properties,
              order: i,
            },
          },
        }));
        this.updateColumns(_c);
      },
    },
    computedWorkspaceStyle() {
      return this.currentWorkspace ? {
        backgroundImage: this.currentWorkspace.data.properties.backgroundImage.file ? `url(${this.currentWorkspace.data.properties.backgroundImage.file})` : null,
        backgroundColor: this.currentWorkspace.data.properties.backgroundColor,
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
