<template>
  <div class="pa-2">
    <div class="workspace-column">
      <div class="d-flex flex-column workspace-column__inner">
        <div class="grey d-flex flex-column pa-2 rounded lighten-4 overflow-hidden workspace-column">
          <div class="d-flex">
            <v-textarea ref="columnName"
                        v-model.trim="snapshotProperties.name"
                        hide-details
                        rows="1"
                        auto-grow
                        solo
                        dense
                        flat
                        :outlined="columnNameIsFocus"
                        :background-color="columnNameIsFocus ? '' : 'transparent'"
                        :placeholder="$t('columnName')"
                        @focus="columnNameIsFocus = true"
                        @blur="saveNewColumnName"
                        @keydown.enter="onSaveNewColumnName"
            />
            <v-menu left offset-y :close-on-content-click="false" origin="center center" transition="scale-transition">
              <template v-slot:activator="{ on, attrs }">
                <v-btn text v-bind="attrs" small class="mt-1" v-on="on">
                  <v-icon>mdi-dots-horizontal</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item :disabled="!currentWorkspaceProperties.allowColumnRemove" @click="onColumnRemove">
                  {{ $t('removeColumn') }}
                </v-list-item>
              </v-list>
            </v-menu>
          </div>

          <draggable v-model="computedCards"
                     ref="columnScrollContainer"
                     v-bind="dragOptions"
                     :disabled="!currentWorkspaceProperties.allowCardMove || isFiltered"
                     class="mt-4 pr-1 overflow-auto"
                     @end="onEnd"
          >
            <transition-group tag="div" name="list-complete" :data-uid="column.uid">
              <v-todo-card v-for="(card, i) in computedCards"
                           :key="card.uid"
                           :card-data="card"
                           :column="column"
                           class="list-complete-item"
                           :class="{'mt-4': i > 0}"
                           :data-uid="card.uid"
              />
            </transition-group>
          </draggable>

<!--          <v-divider class="mt-2" />-->
          <v-text-field v-if="currentWorkspaceProperties.allowCreateNewCard && !isFiltered"
                        v-model.trim="newCardName"
                        placeholder="Название карточки"
                        background-color="transparent"
                        :disabled="pending"
                        flat
                        solo
                        hide-details
                        @keydown.enter="onCreateCard(column.uid)"
          >
            <template #append>
              <v-btn color="primary"
                     text
                     small
                     :disabled="!newCardName"
                     :loading="pending"
                     @click="onCreateCard(column.uid)"
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </div>

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
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import VTodoCard from '@/components/common/VTodoCard';
import { cloneDeep } from 'lodash';
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
    filters: {
      type: Object,
      default: () => ({}),
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
      newCardName: '',
      pending: false,
      columnNameIsFocus: false,
    };
  },

  computed: {
    ...mapGetters('workspace', ['currentWorkspaceProperties', 'currentWorkspace']),

    computedCards: {
      get() {
        return this.filterByFilterName(this.column.data.cards);
      },
      set(cards) {
        this.$emit('update-cards', { columnUid: this.column.uid, cards: setItemOrder(cards) });
      },
    },
    isFiltered() {
      return this.computedCards.length !== this.column.data.cards.length;
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
    this.createPropertiesSnapshot();
  },

  methods: {
    ...mapActions('workspace', ['createCard', 'removeColumn', 'renameColumn', 'updateCards', 'addChangeToChangesList']),
    // Column
    onColumnRemove() {
      if (this.column.data.cards.length) {
        this.deletionConfirmation = true;
      } else {
        this.removeColumn(this.column.uid);
      }
    },
    onSaveNewColumnName(ev) {
      if (ev?.shiftKey === true) return;
      if (ev) ev.preventDefault();
      this.$refs.columnName.blur();
    },
    saveNewColumnName() {
      if (this.snapshotProperties.name) {
        this.renameColumn({
          columnUid: this.column.uid,
          properties: { name: this.snapshotProperties.name },
          newName: this.snapshotProperties.name,
          oldName: this.column.data.properties.name,
        });
      } else {
        this.createPropertiesSnapshot();
      }
      this.columnNameIsFocus = false;
    },
    async onCreateCard() {
      if (!this.newCardName) return;

      this.pending = true;
      const columnScrollContainer = this.$refs.columnScrollContainer.$el;
      await this.createCard({
        name: this.newCardName,
        columnUid: this.column.uid,
        order: this.column.data.cards.length,
        columnName: this.column.data.properties.name,
      });
      this.pending = false;
      this.newCardName = '';
      columnScrollContainer.scrollTo({
        top: columnScrollContainer.scrollHeight,
        behavior: 'smooth',
      });
    },
    filterByFilterName(list) {
      let filteredList = list;

      const mapOfFilterFunctions = {
        search: (filterValue, _list) => {
          const regExp = new RegExp(filterValue, 'i');
          return _list.filter((value) => regExp.test(value.data.properties.name) || regExp.test(value.data.properties.description));
        },
        onlyCompleted: (filterValue, _list) => _list.filter((value) => value.data.properties.isCompleted),
        hasName: (filterValue, _list) => _list.filter((value) => value.data.properties.name),
        hasDescription: (filterValue, _list) => _list.filter((value) => value.data.properties.description),
      };

      Object.keys(mapOfFilterFunctions)
        .forEach((key) => {
          if (this.filters[key]) {
            filteredList = mapOfFilterFunctions[key](this.filters[key], filteredList);
          }
        });

      return filteredList;
    },
    createPropertiesSnapshot() {
      this.snapshotProperties = cloneDeep(this.column.data.properties);
    },
    onEnd(ev) {
      const inThisColumn = ev.from.dataset.uid === ev.to.dataset.uid;

      if (inThisColumn && ev.newIndex === ev.oldIndex) return;

      this.addChangeToChangesList({
        action: inThisColumn ? 'CARD_INNER_MOVE' : 'CARD_OUTER_MOVE',
        value: {
          card: {
            uid: ev.item.dataset.uid,
            name: this.currentWorkspace.data.columns
              .find((column) => column.uid === ev.from.dataset.uid).data.cards
              .find((card) => card.uid === ev.item.dataset.uid).data.properties.name,
            newIndex: ev.newIndex,
            oldIndex: ev.oldIndex,
          },
          from: {
            uid: ev.from.dataset.uid,
            name: this.currentWorkspace.data.columns.find((column) => column.uid === ev.from.dataset.uid)?.data.properties.name,
          },
          to: {
            uid: ev.to.dataset.uid,
            name: this.currentWorkspace.data.columns.find((column) => column.uid === ev.to.dataset.uid)?.data.properties.name,
          },
        },
      });
    },
  },

  watch: {
    column() {
      this.createPropertiesSnapshot();
    },
  },
};
</script>

<style lang="scss" scoped>
  .workspace-column {
    width: 300px;
    &__inner {
      position: absolute;
      top: 0;
      bottom: 12px;
    }
  }
</style>
