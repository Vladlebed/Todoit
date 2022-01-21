<template>
  <div class="primary">
    <the-header />
    <v-container fluid>
      <v-layout v-if="currentWorkspace" column fill-height>
        <v-row>
          <v-col>
            <v-flex>
              <v-btn class="white--text green" @click="createColumn">{{$t('createColumn')}}</v-btn>
            </v-flex>
          </v-col>
        </v-row>
        <v-row>
          <v-todo-column v-for="(column) in columns"
                         :key="column.uid"
                         :column="column"
          />
        </v-row>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import TheHeader from '@/components/single/TheHeader';
import VTodoColumn from '@/components/common/VTodoColumn';
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'Dashboard',

  components: { TheHeader, VTodoColumn },

  i18n: {
    messages: {
      ru: {
        createColumn: 'Создать колонку',
      },
      en: {
        createColumn: 'create column',
      },
    },
  },

  computed: {
    ...mapGetters('workspace', ['currentWorkspace']),
    columns() {
      return this.currentWorkspace.data.columns;
    },
  },

  created() {
    this.fetchWorkspaceList()
      .then(() => {
        this.getCurrentWorkspace();
      });
  },

  methods: {
    ...mapActions('workspace', [
      'fetchWorkspaceList',
      'getCurrentWorkspace',
      'createColumn',
      'createCard',
    ]),
  },
};
</script>
