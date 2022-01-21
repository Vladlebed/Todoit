<template>
  <v-app-bar>
    <v-btn color="primary" @click="showDialog">
      {{currentWorkspace && currentWorkspace.data.workspaceProperties.name || 'Рабочий стол'}}
    </v-btn>

    <v-spacer />

    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary"
               v-bind="attrs"
               v-on="on"
        >
          Аккаунт
        </v-btn>
      </template>
      <v-list>
        <v-list-item v-for="(item, index) in menu"
                     :key="index"
                     link
        >
          <v-list-item-title @click="onMenuItemClick(item)">{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-dialog v-model="dialog.show" width="500">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Создание/выбор рабочего стола
        </v-card-title>

        <div class="pa-4 pb-0">
          <v-select v-model="currentWorkspace"
                    :items="this.workspace.list"
                    :item-text="(v) => v.data.workspaceProperties.name"
                    label="Рабочий стол"
                    no-data-text="Нет рабочих столов"
                    outlined
                    return-object
                    dense
          />
        </div>

        <v-form class="pa-4" @submit.prevent="onCreateWorkspace">
          <v-text-field v-model="dialog.workspaceName" label="Название нового рабочего стола" outlined dense />
        </v-form>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" :disabled="!dialog.workspaceName" text @click="onCreateWorkspace">
            Создать
          </v-btn>
          <v-btn color="gray" text @click="hideDialog">
            закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app-bar>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'TheHeader',

  data() {
    return {
      dialog: {
        show: false,
        workspaceName: '',
      },
      menu: [
        {
          title: 'Настройки',
        },
        {
          title: 'Выход',
          action: () => {
            this.logOut();
          },
        },
      ],
    };
  },

  computed: {
    ...mapState('workspace', ['workspace']),
    currentWorkspace: {
      get() {
        return this.workspace.list.find((workspace) => workspace.uid === this.workspace.current?.uid);
      },
      set(v) {
        this.setCurrentWorkspace(v);
      },
    },
  },

  methods: {
    ...mapActions('user', ['logOut']),
    ...mapActions('workspace', ['createWorkspace', 'setCurrentWorkspace']),

    // dialog
    showDialog() {
      this.dialog.show = true;
    },
    hideDialog() {
      this.dialog.show = false;
      this.dialog.workspaceName = '';
    },
    onCreateWorkspace() {
      this.createWorkspace(this.dialog.workspaceName)
        .then(() => { this.hideDialog(); });
    },

    onMenuItemClick(item) {
      if (item.action) item.action();
    },
  },
};
</script>

<style scoped>

</style>
