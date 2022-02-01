<template>
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
</template>

<script>
import VTodoColumn from '@/components/common/VTodoColumn';
import draggable from 'vuedraggable';
import { setItemOrder } from '@/_utils/workspace';
import { mapActions, mapGetters } from 'vuex';
import '@/assets/draggable.scss';
import '@/assets/transition.scss';

export default {
  name: 'TheWorkspace',

  components: { VTodoColumn, draggable },

  props: {
    filters: {
      type: Object,
      default: () => ({}),
    },
  },

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
    dragOptions() {
      return {
        animation: 200,
        ghostClass: 'ghost',
        group: 'columns',
      };
    },
  },

  methods: {
    ...mapActions('workspace', [
      'fetchWorkspaceList',
      'createColumn',
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
  },
};
</script>

<style scoped>

</style>