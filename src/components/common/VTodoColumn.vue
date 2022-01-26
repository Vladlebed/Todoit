<template>
  <div class="pa-2">
    <div class="grey lighten-4 pa-2 rounded workspace-column">
      <div class="d-flex">
        <v-textarea :value="snapshotProperties.name"
                    hide-details
                    rows="1"
                    auto-grow
                    solo
                    dense
                    flat
                    :placeholder="$t('columnName')"
                    @input="onChangeColumn"
        />
        <v-menu left offset-y :close-on-content-click="false" origin="center center" transition="scale-transition">
          <template v-slot:activator="{ on, attrs }">
            <v-btn text v-bind="attrs" small class="mt-1" v-on="on">
              <v-icon>mdi-dots-horizontal</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item :disabled="!currentWorkspaceProperties.allowCreateNewCard" @click="createCard(column.uid)">
              {{ $t('createCard') }}
            </v-list-item>
            <v-list-item>
              <v-checkbox :disabled="!currentWorkspaceProperties.allowColumnMove" label="Разрешить перемещение" />
            </v-list-item>
            <v-list-item :disabled="!currentWorkspaceProperties.allowColumnRemove" @click="onColumnRemove">
              {{ $t('removeColumn') }}
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <draggable v-model="computedCards" v-bind="dragOptions" :disabled="!currentWorkspaceProperties.allowCardMove">
        <transition-group tag="div" name="list-complete">
          <v-todo-card v-for="(card) in computedCards"
                       :key="card.uid"
                       :card-data="card"
                       :column="column"
                       class="list-complete-item"
          />
        </transition-group>
      </draggable>

      <v-btn v-if="currentWorkspaceProperties.allowCreateNewCard"
             color="primary"
             text
             width="100%"
             small
             class="mt-2"
             @click="createCard(column.uid)"
      >
        {{ $t('createCard') }}
      </v-btn>

      <v-dialog v-model="deletionConfirmation" width="500">
        <v-card>
          <v-card-title class="text-h5 grey lighten-2">
            {{ $t('dialog.title') }}
          </v-card-title>

          <v-card-text class="pa-4">
            {{ $t('dialog.text') }}
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="deletionConfirmation = false">
              {{ $t('dialog.cancel') }}
            </v-btn>
            <v-btn color="error" text @click="removeColumn(column.uid)">
              {{ $t('dialog.submit') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import VTodoCard from '@/components/common/VTodoCard';
import { debounce, cloneDeep } from 'lodash';
import draggable from 'vuedraggable';
import { setItemOrder } from '@/_utils/workspace';
import '@/assets/draggable.scss';

export default {
  name: 'VTodoColumn',

  components: { VTodoCard, draggable },

  props: {
    column: {
      type: Object,
      default: () => [],
    },
  },

  i18n: {
    messages: {
      ru: {
        columnName: 'Название колонки',
        createCard: 'Добавить карточку',
        removeColumn: 'Удалить колонку',
        emptyColumn: 'Пустая колонка',
        dialog: {
          title: 'Удалить данный столбец?',
          text: 'В столбце содержатся данные, которые можно потерять при удалении',
          submit: 'Удалить',
          cancel: 'Отменить',
        },
      },
      en: {
        columnName: 'Column name',
        createCard: 'Add card',
        removeColumn: 'Remove column',
        emptyColumn: 'Empty column',
        dialog: {
          title: 'Delete this column?',
          text: 'The column contains data that can be lost when deleted',
          submit: 'Remove',
          cancel: 'Cancel',
        },
      },
    },
  },

  data() {
    return {
      deletionConfirmation: false,
      snapshotProperties: {},
    };
  },

  computed: {
    ...mapGetters('workspace', ['currentWorkspaceProperties']),

    computedCards: {
      get() {
        return this.column.data.cards;
      },
      set(cards) {
        this.updateCards({ columnUid: this.column.uid, cards: setItemOrder(cards) });
      },
    },
    dragOptions() {
      return {
        animation: 200,
        ghostClass: 'ghost',
        disabled: false,
        group: 'cards',
      };
    },
  },

  created() {
    this.snapshotProperties = cloneDeep(this.column.data.properties);
  },

  methods: {
    ...mapActions('workspace', ['createCard', 'removeColumn', 'changeColumn', 'updateCards']),
    // Column
    onColumnRemove() {
      if (this.column.data.cards.length) {
        this.deletionConfirmation = true;
      } else {
        this.removeColumn(this.column.uid);
      }
    },
    // eslint-disable-next-line func-names
    onChangeColumn: debounce(function (ev) {
      this.changeColumn({ columnUid: this.column.uid, properties: { name: ev } });
    }, 300),
  },
};
</script>

<style lang="scss" scoped>
  .workspace-column {
    width: 300px;
  }
</style>
