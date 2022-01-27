<template>
  <div class="v-load-content ">
    <slot v-if="status === 'error'" name="error">
      <p>При загрузке данных произошла ошибка</p>
    </slot>
    <slot v-else-if="status === 'empty'" name="empty">
      <div class="fill-height d-flex align-center justify-center">
        <v-card>
          <v-card-title>
            Нет данных для отображения
          </v-card-title>
        </v-card>
      </div>
    </slot>
    <slot v-else-if="status === 'loading'" name="loading">
      <v-preloader />
    </slot>
    <slot v-else />
  </div>
</template>

<script>
import VPreloader from '@/components/common/VPreloader';

const loadingStatusList = ['loading', 'ready', 'empty', 'error'];

export default {
  name: 'VLoadContent',

  components: { VPreloader },

  props: {
    status: {
      type: String,
      required: true,
      validator: (status) => loadingStatusList.includes(status),
    },
  },
};
</script>

<style scoped>

</style>
