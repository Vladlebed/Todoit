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
                       @update-cards="updateCards"
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
import { createColumnInterceptor } from '@/interceptors/workspace';
import { urlFactory } from '@/store/modules/workspace/config';
import { debounce, cloneDeep } from 'lodash';
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

      cardsChanges: [],
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
      'setColumns',
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
    updateCards(cardData) {
      this.cardsChanges.push(cardData);
    },
  },

  watch: {
    'currentWorkspace.uid': {
      immediate: true,
      handler(v) {
        const { userUid } = this.$route.params;
        if (v && userUid) {
          createColumnInterceptor(urlFactory.COLUMN_LIST(userUid, v), (columns) => {
            const compareFn = (a, b) => (a.data.properties?.order || 0) - (b.data.properties?.order || 0);
            columns.sort(compareFn);
            columns.forEach((column) => { column.data.cards.sort(compareFn); });
            console.log('updated columns', columns);
            this.setColumns(columns);
          });
        }
      },
    },
    cardsChanges: debounce(function () {
      if (this.cardsChanges.length) {
        const columns = cloneDeep(this.columns);

        this.cardsChanges.forEach((transferData) => {
          const column = columns.find((_column) => _column.uid === transferData.columnUid);
          column.data.cards = transferData.cards;
        });

        this.columns = columns;
        this.cardsChanges = [];
      }
    }, 0),
  },
};
</script>

<style scoped>

</style>
