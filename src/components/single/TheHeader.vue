<template>
  <v-app-bar>
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
  </v-app-bar>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'TheHeader',

  data() {
    return {
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

  methods: {
    ...mapActions('user', ['logOut']),
    onMenuItemClick(item) {
      if (item.action) item.action();
    },
  },
};
</script>

<style scoped>

</style>
