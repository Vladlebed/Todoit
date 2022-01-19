<template>
  <v-col cols="3">
    <div class="grey lighten-4 pa-4 rounded">
      <v-text-field v-model="column.name" label="Название колонки"></v-text-field>
      <div>
        <v-btn x-small class="secondary" @click="addCard">Добавить карточку</v-btn>
        <v-btn x-small color="warning" class="ml-4" @click="onColumnRemove">Удалить колонку</v-btn>
      </div>

      <v-todo-card v-for="(card, i) in column.cards"
                   :key="i"
                   :card-data="card"
                   :index="i"
                   @change-card="changeCard"
                   @remove-card="removeCard"
      />

      <div v-if="!column.cards.length" class="mt-4">
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
            <v-btn color="error" text @click="removeColumn">
              Удалить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-col>
</template>

<script>
import VTodoCard from '@/components/common/VTodoCard';

export default {
  name: 'VTodoColumn',

  components: { VTodoCard },

  props: {
    column: {
      type: Object,
      default: () => [],
    },
    index: {
      type: Number,
    },
  },

  data() {
    return {
      deletionConfirmation: false,
    };
  },

  methods: {
    // Column
    onColumnRemove() {
      if (this.column.cards.length) {
        this.deletionConfirmation = true;
      } else {
        this.removeColumn();
      }
    },
    removeColumn() {
      this.deletionConfirmation = false;
      this.$emit('remove-column', {
        columnIndex: this.index,
        column: this.column,
      });
    },

    // Cards
    addCard() {
      this.$emit('add-card', {
        columnIndex: this.index,
        column: this.column,
      });
    },
    removeCard({ cardIndex, card }) {
      this.$emit('remove-card', {
        cardIndex,
        card,
        columnIndex: this.index,
        column: this.column,
      });
    },
    changeCard(ev) {
      this.$emit('change-card', {
        column: this.column,
        columnIndex: this.index,
        ...ev,
      });
    },
  },
};
</script>

<style scoped>

</style>
