<template>
  <div class="pa-2">
    <div class="workspace-column">
      <div class="d-flex flex-column workspace-column__inner">
        <div class="grey d-flex flex-column pa-2 rounded lighten-4 overflow-hidden workspace-column">
          <div class="d-flex">
            <v-textarea :value="snapshotProperties.name"
                        hide-details
                        rows="1"
                        auto-grow
                        solo
                        dense
                        flat
                        background-color="transparent"
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
                <v-list-item :disabled="!currentWorkspaceProperties.allowCreateNewCard || isFiltered" @click="onCreateCard(column.uid)">
                  {{ $t('createCard') }}
                </v-list-item>
<!--                <v-list-item>-->
<!--                  <v-checkbox :disabled="!currentWorkspaceProperties.allowColumnMove" label="Разрешить перемещение" />-->
<!--                </v-list-item>-->
                <v-list-item :disabled="!currentWorkspaceProperties.allowColumnRemove" @click="onColumnRemove">
                  {{ $t('removeColumn') }}
                </v-list-item>
              </v-list>
            </v-menu>
          </div>

          <draggable v-model="computedCards" ref="columnScrollContainer" v-bind="dragOptions" :disabled="!currentWorkspaceProperties.allowCardMove || isFiltered" class="mt-4 pr-1 overflow-auto">
            <transition-group tag="div" name="list-complete" class="">
              <v-todo-card v-for="(card, i) in computedCards"
                           :key="card.uid"
                           :card-data="card"
                           :column="column"
                           class="list-complete-item"
                           :class="{'mt-4': i > 0}"
              />
            </transition-group>
          </draggable>

          <v-btn v-if="currentWorkspaceProperties.allowCreateNewCard && !isFiltered"
                 color="primary"
                 text
                 width="100%"
                 small
                 class="mt-2"
                 @click="onCreateCard(column.uid)"
          >
            {{ $t('createCard') }}
          </v-btn>
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
import { debounce, cloneDeep } from 'lodash';
import draggable from 'vuedraggable';
// eslint-disable-next-line no-unused-vars
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
    };
  },

  computed: {
    ...mapGetters('workspace', ['currentWorkspaceProperties']),

    computedCards: {
      get() {
        return this.filterByFilterName(this.column.data.cards);
      },
      set(cards) {
        this.$emit('update-cards', { columnUid: this.column.uid, cards: setItemOrder(cards) });
        // this.updateCards({ columnUid: this.column.uid, cards: setItemOrder(cards) });
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
    async onCreateCard() {
      const columnScrollContainer = this.$refs.columnScrollContainer.$el;

      await this.createCard({ columnUid: this.column.uid, order: this.column.data.cards.length });
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
