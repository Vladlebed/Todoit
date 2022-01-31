<template>
  <v-dialog v-model="show" width="500">
    <v-card>
      <v-card-title>
        {{$t('title')}}
      </v-card-title>

      <div class="pa-4">
        <v-checkbox v-model="computedFilters.onlyCompleted" label="Показать завершённые" />
        <v-checkbox v-model="computedFilters.hasName" label="Имеющие название" />
        <v-checkbox v-model="computedFilters.hasDescription" label="Имеющие описание" />
      </div>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="gray" text @click="hideDialog">
          {{ $t('closeBtn') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'TheHeaderDialogWorkspaceFilters',

  props: {
    filters: {
      type: Object,
      default: () => ({}),
    },
  },

  i18n: {
    messages: {
      ru: {
        title: 'Фильтры',
        closeBtn: 'Закрыть',
      },
      en: {
        title: 'Filters',
        closeBtn: 'Close',
      },
    },
  },

  data() {
    return {
      show: false,
    };
  },

  computed: {
    computedFilters: {
      get() {
        return this.filters;
      },
      set(v) {
        this.$emit('update:filters', v);
      },
    },
  },

  methods: {
    ...mapActions('workspace', ['createWorkspace']),

    // region dialog
    showDialog() {
      this.show = true;
    },
    hideDialog() {
      this.show = false;
    },
    // endregion dialog
  },
};
</script>

<style scoped>

</style>
