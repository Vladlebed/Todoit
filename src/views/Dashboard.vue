<template>
  <div class="fill-height primary d-flex flex-column">
    <the-header class="flex-grow-0" />
    <v-container ref="container" class="flex-grow-1 workspace-container overflow-x-auto overflow-y-hidden" :style="computedWorkspaceStyle" fluid>
      <v-layout v-if="currentWorkspace" class="d-block" column fill-height>
        <transition-group class="d-flex fill-height" tag="div" name="list-complete">
          <v-todo-column v-for="(column) in columns"
                         :key="column.uid"
                         :column="column"
                         class="list-complete-item"
          />
          <v-btn class="white--text green mt-2 ml-2" key="createColumnBtn" @click="onCreateColumn">{{$t('createColumn')}}</v-btn>
        </transition-group>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import TheHeader from '@/components/single/TheHeader/TheHeader';
import VTodoColumn from '@/components/common/VTodoColumn';
import { mapGetters, mapActions } from 'vuex';
import '@/assets/transition.scss';

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
    async onCreateColumn() {
      await this.createColumn();
      setTimeout(() => {
        const { container } = this.$refs;
        container.scrollTo({
          left: container.scrollWidth,
          behavior: 'smooth',
        });
      }, 301); // Скролл после завершения анимации
    },
  },
};
</script>

<style lang="scss">
  .workspace-container {
    background-size: cover;
  }
</style>
