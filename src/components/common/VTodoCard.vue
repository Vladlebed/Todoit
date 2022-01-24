<template>
  <v-card class="mt-4 pl-4 pr-4 pt-2 pb-2" elevation="2">
    <div class="flex">
      <v-text-field v-model="snapshotProperties.name" :label="$t('name')" />
    </div>
    <v-textarea v-if="snapshotProperties.descriptionShow" v-model="snapshotProperties.description" :label="$t('text')" dense />
    <v-checkbox v-model="snapshotProperties.isCompleted" :label="$t('isCompleted')" />
    <v-btn color="error" x-small @click="onCardRemove">{{ $t('removeCard') }}</v-btn>
    <v-expansion-panels flat>
      <v-expansion-panel>
        <v-expansion-panel-header>
          {{ $t('settings') }}
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-checkbox v-model="snapshotProperties.descriptionShow" :label="$t('textShow')" />
          <v-color-picker dot-size="13" mode="hexa" swatches-max-height="178" class="mt-4" />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
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

  i18n: {
    messages: {
      ru: {
        name: 'Название карточки',
        text: 'Текст карточки',
        removeCard: 'Удалить карточку',
        isCompleted: 'Завершено',
        textShow: 'Показать текст',
        settings: 'Настройки',
        styles: 'Стилизация',
      },
      en: {
        name: 'Title',
        text: 'Text',
        removeCard: 'Remove card',
        isCompleted: 'Completed',
        textShow: 'Show text',
        settings: 'Settings',
        styles: 'Styles',
      },
    },
  },

  data() {
    return {
      snapshotProperties: {},
    };
  },

  created() {
    this.snapshotProperties = cloneDeep(this.cardData.data.properties);
    this.$watch('snapshotProperties', debounce((ev) => {
      this.changeCard({ columnUid: this.column.uid, cardUid: this.cardData.uid, properties: ev });
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
    // debouncedSaveproperties: debounce(function (ev) {
    //   this.changeCard({ columnUid: this.column.uid, cardUid: this.cardData.uid, properties: ev });
    // }, 300),
  },
};
</script>

<style scoped>

</style>
