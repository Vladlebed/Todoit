<template>
  <v-card class="mt-4 pa-4" elevation="2">
    <v-text-field v-model="computedCardData.title" label="Название карточки" />
    <v-textarea v-model="computedCardData.text" label="Текст карточки" />
    <v-card-actions>
      <v-btn x-small @click="removeCard">Удалить карточку</v-btn>
      <v-checkbox v-model="computedCardData.completed" label="Завершено" class="ml-4" />
    </v-card-actions>

  </v-card>
</template>

<script>
export default {
  name: 'VTodoCard',

  props: {
    cardData: {
      type: Object,
      default: () => ({}),
    },
    index: {
      type: Number,
    },
  },

  data() {
    return {

    };
  },

  computed: {
    computedCardData: {
      get() {
        return this.cardData;
      },
      set(v) {
        this.$emit('change-card', {
          cardIndex: this.index,
          oldValue: this.cardData,
          newValue: v,
        });
      },
    },
  },

  methods: {
    removeCard() {
      this.$emit('remove-card', {
        card: this.cardData,
        cardIndex: this.index,
      });
    },
  },
};
</script>

<style scoped>

</style>
