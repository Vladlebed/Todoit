<template>
  <v-card class="overflow-hidden">
    <the-header />
    <v-container fluid>
      <v-layout column fill-height>
        <v-row>
          <v-col>
            <v-flex>
              <v-btn class="primary" @click="addColumn">Добавить колонку</v-btn>
            </v-flex>
          </v-col>
        </v-row>
        <v-row>
          <v-todo-column v-for="(column, i) in columns"
                         :index="i"
                         :key="i"
                         :column="column"
                         @remove-card="removeCard"
                         @change-card="changeCard"
                         @remove-column="removeColumn"
                         @add-card="addCardToColumn"
          />
        </v-row>
      </v-layout>
    </v-container>
  </v-card>
</template>

<script>
import TheHeader from '@/components/single/TheHeader';
import VTodoColumn from '@/components/common/VTodoColumn';

export default {
  name: 'Dashboard',

  components: { TheHeader, VTodoColumn },

  data() {
    return {
      columns: [
        {
          name: 'Первая колонка',
          cards: [
            {
              title: 'Первая карточка',
              text: 'Текст',
              completed: false,
            },
            {
              title: 'Первая карточка',
              text: 'Текст',
              completed: true,
            },
          ],
        },
        {
          name: 'Вторая колонка',
          cards: [
            {
              title: '2 Первая карточка',
              text: 'Текст',
              completed: false,
            },
            {
              title: '2 Первая карточка',
              text: 'Текст',
              completed: false,
            },
          ],
        },
      ],
    };
  },

  methods: {
    // Instances
    getCardInstance: () => ({
      title: '',
      text: '',
      completed: '',
    }),
    getColumnInstance: () => ({
      name: '',
      cards: [],
    }),

    // Columns
    addColumn() {
      const column = this.getColumnInstance();
      this.columns.push(column);
    },
    addCardToColumn({ column }) {
      const card = this.getCardInstance();
      column.cards.push(card);
    },
    removeColumn({ columnIndex }) {
      this.columns.splice(columnIndex, 1);
    },

    // Cards
    changeCard({ column, cardIndex, columnIndex, newValue }) {
      // eslint-disable-next-line no-param-reassign
      column[columnIndex].cards[cardIndex] = newValue;
    },
    removeCard({ column, cardIndex }) {
      column.cards.splice(cardIndex, 1);
    },
  },
};
</script>
