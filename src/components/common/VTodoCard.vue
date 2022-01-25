<template>
  <v-card class="mt-4 pa-2" elevation="2">
    <div class="d-flex">
      <v-textarea v-model="snapshotProperties.name"
                  hide-details
                  rows="1"
                  auto-grow
                  solo
                  dense
                  flat
                  :placeholder="$t('name')"
      />
      <v-menu left offset-y origin="center center" :close-on-content-click="false" transition="scale-transition">
        <template v-slot:activator="{ on, attrs }">
          <v-btn class="mt-1" text v-bind="attrs" small v-on="on">
            <v-icon>mdi-dots-horizontal</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-checkbox v-model="snapshotProperties.isCompleted" :label="$t('isCompleted')" />
          </v-list-item>
          <v-list-item>
            <v-checkbox v-model="snapshotProperties.descriptionShow" :label="$t('descriptionShow')" />
          </v-list-item>
          <v-list-item @click="onCardRemove">
            {{ $t('removeCard') }}
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <v-textarea v-if="snapshotProperties.descriptionShow"
                v-model="snapshotProperties.description"
                class="mt-2 card-description"
                :label="$t('description')"
                hide-details
                rows="1"
                auto-grow
                solo
                dense
                flat
    />
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
        description: 'Описание карточки',
        removeCard: 'Удалить карточку',
        isCompleted: 'Завершено',
        descriptionShow: 'Показать описание',
        settings: 'Настройки',
        styles: 'Стилизация',
      },
      en: {
        name: 'Title',
        description: 'Description',
        removeCard: 'Remove card',
        isCompleted: 'Completed',
        descriptionShow: 'Show description',
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

<style lang="scss">
  .card-description {
    textarea {
      font-size: 14px;
    }
  }
</style>
