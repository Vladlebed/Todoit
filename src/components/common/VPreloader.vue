<template>
  <div class="v-preloader d-flex align-center justify-center fill-height" :class="bgClass">
    <v-progress-circular :size="50" :color="loaderClass" indeterminate />
  </div>
</template>

<script>
export default {
  name: 'VPreloader',

  props: {
    bgClass: {
      type: String,
      default: 'primary',
    },
    loaderClass: {
      type: String,
      default: 'white',
    },
  },
};
</script>

<!--<style lang="scss" scoped>-->
<!--  .v-preloader {-->
<!--    -->
<!--  }-->
<!--</style>-->
