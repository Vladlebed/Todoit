<template>
  <div :class="centredClasses">
    <v-alert type="error">
      <slot />
    </v-alert>
  </div>
</template>

<script>
export default {
  name: 'VError',

  props: {
    centred: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    centredClasses() {
      return this.centred ? 'd-flex justify-center align-center fill-height' : null;
    },
  },
};
</script>

<style scoped>

</style>
