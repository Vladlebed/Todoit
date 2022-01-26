<template>
  <v-layout fill-height class="primary d-flex justify-center align-center overflow-hidden">
    <v-card class="pa-4" width="400">
      <div class="text-center">
        <span class="text-h1">{{$t('logo')}}</span>
      </div>

      <v-form class="text-center mb-4" @submit.prevent="onAuthWithEmailForm">
        <v-text-field v-model="email" label="Email"/>
        <v-text-field v-model="password" :label="$t('password.placeholder')" type="password"/>
        <v-btn color="primary" type="submit" :disabled="!email || !password">{{$t('submit')}}</v-btn>
      </v-form>
      <div ref="firebaseAuth" class="firebase-auth"></div>
    </v-card>
  </v-layout>
</template>

<script>
import firebase from 'firebase/compat/app';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { mapActions } from 'vuex';

export default {
  name: 'Auth',

  data() {
    return {
      firebaseUiInstance: null,

      email: '',
      password: '',
    };
  },

  i18n: {
    messages: {
      ru: {
        logo: 'TODO',
        password: {
          placeholder: 'Пароль',
        },
        submit: 'Войти',
      },
      en: {
        logo: 'TODO',
        password: {
          placeholder: 'Password',
        },
        submit: 'Sign in',
      },
    },
  },

  mounted() {
    this.initFirebaseUI();
  },

  methods: {
    ...mapActions('user', ['loginWithEmailAndPassword']),
    onAuthWithEmailForm() {
      if (!this.email || !this.password) return;

      this.loginWithEmailAndPassword({
        email: this.email,
        password: this.password,
      });
    },
    initFirebaseUI() {
      const uiConfig = {
        signInSuccessUrl: '/',
        signInOptions: [
          {
            provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
            defaultCountry: 'RU',
          },
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        ],
      };

      this.firebaseUiInstance = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());

      this.firebaseUiInstance.start(this.$refs.firebaseAuth, uiConfig);
    },
  },
};
</script>

<style lang="scss">
.v-application ul {
  padding-left: 0;
}
</style>
