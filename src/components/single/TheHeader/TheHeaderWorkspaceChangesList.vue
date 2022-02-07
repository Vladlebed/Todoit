<template>
  <v-menu offset-y max-width="500" min-width="300">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="primary" class="mr-4" v-on="on" v-bind="attrs" text small>
        <v-icon>mdi-file-sign</v-icon>
      </v-btn>
    </template>
    <v-simple-table v-if="changes.length" fixed-header height="500">
      <template v-slot:default>
        <thead>
        <tr>
          <th class="text-left" :style="{ width: '150px' }">
            {{$t('ui.date')}}
          </th>
          <th class="text-left">
            {{$t('ui.event')}}
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="change in changes" :key="change.uid">
          <td>{{change.data.date}}</td>
          <td v-html="getChangeDescription(change.data)"></td>
        </tr>
        </tbody>
      </template>
    </v-simple-table>
    <v-list v-else>
      <v-list-item>
        <v-list-item-title>
          <span>{{$t('ui.empty')}}</span>
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { urlFactory } from '@/store/modules/workspace/config';
import { convertDatabaseListToClientFormat } from '@/_utils/database';
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'TheHeaderWorkspaceChangesList',

  i18n: {
    messages: {
      ru: {
        ui: {
          date: 'Дата',
          event: 'Событие',
          empty: 'Пусто',
        },
        events: {
          COLUMN_CREATE: 'создал(а) колонку "<b>{columnName}</b>"',
          COLUMN_REMOVE: 'удалил(а) колонку "<b>{columnName}</b>"',
          COLUMN_RENAME: 'переименовал(а) колонку "<b>{oldName}</b>" в "<b>{newName}</b>"',
          CARD_CHANGE_DESCRIPTION: 'изменил(а) описание карточки "<b>{cardName}</b>" на "<b>{description}</b>"',
          CARD_REMOVE_DESCRIPTION: 'удалил(а) описание карточки "<b>{cardName}</b>"',
          CARD_RENAME: 'переименовал(а) карточку "<b>{oldCardName}</b>" в "<b>{newCardName}</b>"',
          CARD_CREATE: 'создал(а) карточку "<b>{cardName}</b>" в колонке "<b>{columnName}</b>"',
          CARD_REMOVE: 'удалил(а) карточку "<b>{cardName}</b>" в колонке "<b>{columnName}</b>"',
          CARD_INNER_MOVE: 'перенес(ла) карточку "<b>{cardName}</b>" в колонке "<b>{columnName}</b>" на позицию {position}',
          CARD_OUTER_MOVE: 'перенес(ла) карточку "<b>{cardName}</b>" из колонки "<b>{from}</b>" в колонку "<b>{to}</b>"',
        },
      },
      en: {
        ui: {
          date: 'Date',
          event: 'Event',
          empty: 'Empty',
        },
        events: {
          COLUMN_CREATE: 'created the "<b>{columnName}</b>" column',
          COLUMN_REMOVE: 'deleted the "<b>{columnName}</b>" column',
          COLUMN_RENAME: 'renamed the "<b>{oldName}</b>" в "<b>{newName}</b>" column',
          CARD_CHANGE_DESCRIPTION: 'changed the description of the card "<b>{cardName}</b>" to "<b>{description}</b>"',
          CARD_REMOVE_DESCRIPTION: 'removed the description of the "<b>{cardName}</b>"',
          CARD_RENAME: 'renamed the card "<b>{oldCardName}</b>" to "<b>{newCardName}</b>"',
          CARD_CREATE: 'created a card "<b>{cardName}</b>" in the column "<b>{columnName}</b>"',
          CARD_REMOVE: 'deleted the card "<b>{cardName}</b>" in the column "<b>{columnName}</b>"',
          CARD_INNER_MOVE: 'moved card "<b>{cardName}</b>" in column "<b>{columnName}</b>" to position {position}',
          CARD_OUTER_MOVE: 'moved card "<b>{cardName}</b>" from column "<b>{from}</b>" to column "<b>{to}</b>"',
        },
      },
    },
  },

  data() {
    return {
      changesInterceptorRef: null,
      changes: [],
    };
  },

  computed: {
    ...mapGetters('workspace', ['currentWorkspace']),
  },

  methods: {
    ...mapActions('user', ['getUid']),

    async createChangesInterceptor() {
      const uid = await this.getUid();
      const db = getDatabase();

      if (this.changesInterceptorRef) {
        off(this.changesInterceptorRef, 'value');
      }

      this.changesInterceptorRef = ref(db, urlFactory.WORKSPACE_CHANGES(uid, this.currentWorkspace.uid));

      onValue(this.changesInterceptorRef, async (snapshot) => {
        const data = await snapshot.val();
        this.changes = convertDatabaseListToClientFormat(data).reverse();
      });
    },

    getChangeDescription(changeData) {
      const changesDescriptionFactory = {
        COLUMN_CREATE: () => ({ columnName: changeData.value }),
        COLUMN_REMOVE: () => ({ columnName: changeData.value.name }),
        COLUMN_RENAME: () => ({ oldName: changeData.value.oldName, newName: changeData.value.newName }),
        CARD_CHANGE_DESCRIPTION: () => ({ cardName: changeData.value.cardName, description: changeData.value.description }),
        CARD_REMOVE_DESCRIPTION: () => ({ cardName: changeData.value.cardName }),
        CARD_RENAME: () => ({ oldCardName: changeData.value.oldCardName, newCardName: changeData.value.newCardName }),
        CARD_CREATE: () => ({ cardName: changeData.value.name, columnName: changeData.value.columnName }),
        CARD_REMOVE: () => ({ cardName: changeData.value.cardName, columnName: changeData.value.columnName }),
        CARD_INNER_MOVE: () => ({ cardName: changeData.value.card.name, columnName: changeData.value.to.name, position: changeData.value.card.newIndex + 1 }),
        CARD_OUTER_MOVE: () => ({ cardName: changeData.value.card.name, from: changeData.value.from.name, to: changeData.value.to.name }),
      };

      const actionNamePath = `events.${changeData.action}`;
      return `<b>${changeData.userName}</b> ${this.$t(actionNamePath, changesDescriptionFactory[changeData.action]())}`;
    },
  },

  created() {
    this.createChangesInterceptor();
  },

  beforeDestroy() {
    off(this.changesInterceptorRef, 'value');
  },
};
</script>

<style scoped>

</style>
