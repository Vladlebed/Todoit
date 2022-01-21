<template>
  <v-card class="mt-4 pa-4" elevation="2">
    <v-text-field v-model="cardPropertiesSnapshot.name" label="Название карточки" />
    <v-textarea v-model="cardPropertiesSnapshot.text" label="Текст карточки" />
    <v-card-actions>
      <v-btn x-small @click="onCardRemove">Удалить карточку</v-btn>
      <v-checkbox v-model="cardPropertiesSnapshot.isCompleted" label="Завершено" class="ml-4" />
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapActions } from 'vuex';
import { debounce, cloneDeep } from 'lodash';

export default {
  name: 'VTodoCard',

  props: {
    column: {
      type: Object,
      default: () => ({}),
    },
    cardData: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      cardPropertiesSnapshot: {},
    };
  },

  created() {
    this.cardPropertiesSnapshot = cloneDeep(this.cardData.data.cardProperties);
    this.$watch('cardPropertiesSnapshot', debounce((ev) => {
      this.changeCard({ columnUid: this.column.uid, cardUid: this.cardData.uid, cardProperties: ev });
    }, 300), { deep: true });
  },

  methods: {
    ...mapActions('workspace', ['removeCard', 'changeCard']),

    onCardRemove() {
      this.removeCard({
        columnUid: this.column.uid,
        cardUid: this.cardData.uid,
      });
    },
    // debouncedSaveCardProperties: debounce(function (ev) {
    //   this.changeCard({ columnUid: this.column.uid, cardUid: this.cardData.uid, cardProperties: ev });
    // }, 300),
  },
};
</script>

<style scoped>

</style>
