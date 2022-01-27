<template>
  <v-dialog v-model="show" :persistent="pending" width="500">
    <v-card v-if="!pending">
      <v-card-title>
        {{$t('title')}}
      </v-card-title>

      <v-form class="pa-4" @submit.prevent="onCreateWorkspace">
        <v-text-field v-model="workspaceName"
                      :label="$t('workspaceCreateInput')"
        />
      </v-form>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" type="submit" :disabled="!workspaceName" @click="onCreateWorkspace">
          {{ $t('createBtn') }}
        </v-btn>
        <v-btn color="gray" text @click="hideDialog">
          {{ $t('closeBtn') }}
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-card v-else height="300">
      <v-preloader bg-class="white" loader-class="primary" />
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex';
import VPreloader from '@/components/common/VPreloader';

export default {
  name: 'TheHeaderDialogWorkspaceCreate',

  components: { VPreloader },

  i18n: {
    messages: {
      ru: {
        workspaceCreateInput: 'Название нового рабочего стола',
        title: 'Создание рабочего стола',
        createBtn: 'Создать',
        closeBtn: 'Закрыть',
      },
      en: {
        workspaceCreateInput: 'Name of the new desktop',
        title: 'Create workspace',
        createBtn: 'Create',
        closeBtn: 'Close',
      },
    },
  },

  data() {
    return {
      show: false,
      workspaceName: '',
      pending: false,
    };
  },

  methods: {
    ...mapActions('workspace', ['createWorkspace']),

    // region dialog
    showDialog() {
      this.show = true;
    },
    hideDialog() {
      this.show = false;
      this.workspaceName = '';
    },
    // endregion dialog

    onCreateWorkspace() {
      this.pending = true;
      this.createWorkspace(this.workspaceName)
        .then(() => {
          this.hideDialog();
        })
        .finally(() => { this.pending = false; });
    },
  },
};
</script>

<style scoped>

</style>
