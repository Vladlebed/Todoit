<template>
  <v-col cols="3">
    <div class="grey lighten-4 pa-4 rounded">
      <v-text-field :value="computedColumn.columnProperties.name" label="Название колонки" @input="onChangeColumn" />

      <div>
        <v-btn x-small class="secondary" @click="createCard(column.uid)">Добавить карточку</v-btn>
        <v-btn x-small color="warning" class="ml-4" @click="onColumnRemove">Удалить колонку</v-btn>
      </div>

      <v-todo-card v-for="(card) in computedColumn.cards"
                   :key="card.uid"
                   :card-data="card"
                   :column="column"
      />

      <div v-if="!computedColumn.cards.length" class="mt-4">
        <span>Пустая колонка</span>
      </div>

      <v-dialog v-model="deletionConfirmation" width="500">
        <v-card>
          <v-card-title class="text-h5 grey lighten-2">
            Удалить данный столбец?
          </v-card-title>

          <v-card-text>
            В столбце содержатся данные, которые можно потерять при удалении
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="deletionConfirmation = false">
              Отменить
            </v-btn>
            <v-btn color="error" text @click="removeColumn(column.uid)">
              Удалить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-col>
</template>

<script>
import { mapActions } from 'vuex';
import VTodoCard from '@/components/common/VTodoCard';
import { debounce } from 'lodash';

export default {
  name: 'VTodoColumn',

  components: { VTodoCard },

  props: {
    column: {
      type: Object,
      default: () => [],
    },
  },

  data() {
    return {
      deletionConfirmation: false,
    };
  },

  computed: {
    computedColumn() {
      return this.column.data;
    },
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
    onChangeColumn: debounce(function (ev) {
      this.changeColumn({ columnUid: this.column.uid, columnProperties: { name: ev } });
    }, 300),
  },
};
</script>

<style scoped>

</style>
