<template>
  <v-layout fill-height class="auth d-flex justify-end align-center overflow-hidden">
    <div class="auth__background-container">
      <div class="planet"></div>
      <div class="ground"></div>
    </div>
    <v-card class="auth__card pa-4 auth__card mr-16" width="400">
      <div class="text-center">
        <span class="text-h1">{{$t('logo')}}</span>
      </div>

      <v-form class="text-center mb-4" @submit.prevent="onAuthWithEmailForm">
        <v-text-field v-model="email" label="Email"/>
        <v-text-field v-model="password" :label="$t('password.placeholder')" type="password"/>
        <v-btn color="primary" type="submit" :loading="pending" :disabled="!email || !password">{{$t('submit')}}</v-btn>
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

      pending: false,
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
        error: {
          wrongPassword: 'Неверная почта или пароль',
        },
      },
      en: {
        logo: 'TODO',
        password: {
          placeholder: 'Password',
        },
        submit: 'Sign in',
        error: {
          wrongPassword: 'Неверная почта или пароль',
        },
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

      this.pending = true;
      this.loginWithEmailAndPassword({
        email: this.email,
        password: this.password,
      })
        .catch(() => {
          this.password = '';
          this.$notify({
            group: 'foo',
            type: 'error',
            title: this.$t('error.wrongPassword'),
          });
        })
        .finally(() => {
          this.pending = false;
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
.auth {
  background: linear-gradient(7deg, rgba(0,91,255,1) 40%, rgba(249,17,85,1) 100%);
  &__background-container {
    position: absolute;
    width: 100%;
    height: 100%;
    .planet {
      height: 100%;
      width: 100%;
      background: url('../assets/planet.png') no-repeat;
      background-position: center 60%;
      position: absolute;
      animation: planet 10s linear infinite;
      background-size: 30%;
    }
    .ground {
      background: url('../assets/ground.png') no-repeat;
      height: 100%;
      width: 100%;
      position: absolute;
      background-position: center bottom;
      background-size: 100%;
      animation: ground 10s linear infinite;
    }
  }
  &__card {
    animation: card 1s ease;
    animation-fill-mode: forwards;
  }
}

@keyframes planet {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(15px);
  }
  75% {
    transform: translateY(20px);
  }
  100% {
    transform: translateY(0px);
  }
}

@keyframes ground {
  0% {
    background-size: 100%;
  }
  50% {
    background-size: 103%;
  }
  75% {
    background-size: 105%;
  }
  100% {
    background-size: 100%;
  }
}

@keyframes card {
  0% {
    transform: translateX(200%);
  }
  100% {
    transform: translateX(0%);
  }
}
</style>
