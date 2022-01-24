<template>
  <div class="fill-height primary d-flex flex-column">
    <the-header class="flex-grow-0" />
    <v-container class="flex-grow-1 workspace-container" :style="computedWorkspaceStyle" fluid>
      <v-layout v-if="currentWorkspace" class="d-block" column fill-height>
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
import TheHeader from '@/components/single/TheHeader/TheHeader';
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
    computedWorkspaceStyle() {
      return this.currentWorkspace ? {
        backgroundImage: this.currentWorkspace.data.properties.backgroundImage.file ? `url(${this.currentWorkspace.data.properties.backgroundImage.file})` : null,
        backgroundColor: this.currentWorkspace.data.properties.backgroundColor,
      } : {};
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

<style lang="scss">
  .workspace-container {
    background-size: cover;
  }
</style>
