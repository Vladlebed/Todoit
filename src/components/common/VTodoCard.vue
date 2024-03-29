<template>
  <v-card class="pa-2" elevation="2">
    <div class="d-flex">
      <v-textarea v-model="snapshotProperties.name"
                  ref="cardName"
                  hide-details
                  rows="1"
                  auto-grow
                  solo
                  dense
                  flat
                  :placeholder="$t('name')"
                  @blur="saveCardProperties"
                  @keydown.enter="onSaveCardProperty($event, 'cardName')"
      />
      <v-menu left offset-y origin="center center" :close-on-content-click="false" transition="scale-transition">
        <template v-slot:activator="{ on, attrs }">
          <v-btn class="mt-1" text v-bind="attrs" small v-on="on">
            <v-icon>mdi-dots-horizontal</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-checkbox v-model="snapshotProperties.isCompleted" :label="$t('isCompleted')" @change="saveCardProperties"/>
          </v-list-item>
          <v-list-item>
            <v-checkbox v-model="snapshotProperties.descriptionShow" :label="$t('descriptionShow')" @change="saveCardProperties"/>
          </v-list-item>
          <v-list-item :disabled="!currentWorkspaceProperties.allowCardRemove" @click="onCardRemove">
            {{ $t('removeCard') }}
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <v-textarea v-if="snapshotProperties.descriptionShow"
                v-model="snapshotProperties.description"
                ref="cardDescription"
                class="mt-2 card-description"
                :label="$t('description')"
                hide-details
                rows="1"
                auto-grow
                solo
                dense
                flat
                @blur="saveCardProperties"
                @keydown.enter="onSaveCardProperty($event, 'cardDescription')"
    />
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { cloneDeep } from 'lodash';

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
      cardNameIsFocus: false,
      cardDescriptionIsFocus: false,
    };
  },

  computed: {
    ...mapGetters('workspace', ['currentWorkspaceProperties']),
  },

  created() {
    this.createPropertiesSnapshot();
  },

  methods: {
    ...mapActions('workspace', ['removeCard', 'changeCard']),

    onCardRemove() {
      this.removeCard({
        columnUid: this.column.uid,
        cardUid: this.cardData.uid,
        cardName: this.cardData.data.properties.name,
        columnName: this.column.data.properties.name,
      });
    },
    createPropertiesSnapshot() {
      this.snapshotProperties = cloneDeep(this.cardData.data.properties);
    },
    onSaveCardProperty(ev, propertyName) {
      if (ev?.shiftKey === true) return;
      if (ev) ev.preventDefault();
      this.$refs[propertyName].blur();
    },
    saveCardProperties() {
      if (!this.snapshotProperties.name) {
        this.createPropertiesSnapshot();
        return;
      }
      this.changeCard({
        columnUid: this.column.uid,
        cardUid: this.cardData.uid,
        newProperties: this.snapshotProperties,
        oldProperties: this.cardData.data.properties,
        columnName: this.column.data.properties.name,
      });
    },
  },

  watch: {
    cardData() {
      this.createPropertiesSnapshot();
    },
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
