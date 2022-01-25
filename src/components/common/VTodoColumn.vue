<template>
  <div class="pa-2">
    <div class="grey lighten-4 pa-4 rounded workspace-column">
      <v-text-field :value="snapshotProperties.name" :label="$t('columnName')" @input="onChangeColumn" />

      <div>
        <v-btn x-small class="secondary" @click="createCard(column.uid)">{{ $t('createCard') }}</v-btn>
        <v-btn x-small color="warning" class="ml-4" @click="onColumnRemove">{{ $t('removeColumn') }}</v-btn>
      </div>
      <transition-group tag="div" name="list-complete">
        <v-todo-card v-for="(card) in computedColumn.cards"
                     :key="card.uid"
                     :card-data="card"
                     :column="column"
                     class="list-complete-item"
        />
      </transition-group>

      <div v-if="!computedColumn.cards.length" class="mt-4">
        <span>{{ $t('emptyColumn') }}</span>
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
</template>

<script>
import { mapActions } from 'vuex';
import VTodoCard from '@/components/common/VTodoCard';
import { debounce, cloneDeep } from 'lodash';

export default {
  name: 'VTodoColumn',

  components: { VTodoCard },

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
    computedColumn() {
      return this.column.data;
    },
  },

  created() {
    this.snapshotProperties = cloneDeep(this.column.data.properties);
  },

  methods: {
    ...mapActions('workspace', ['createCard', 'removeColumn', 'changeColumn']),
    // Column
    onColumnRemove() {
      if (this.computedColumn.cards.length) {
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
