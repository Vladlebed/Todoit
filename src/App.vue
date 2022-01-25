<template>
  <v-app>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',
};
</script>

<style lang="sass">
html
  overflow-y: hidden

::-webkit-scrollbar-button
  background-image: none
  background-repeat: no-repeat
  width: 5px
  height: 0

::-webkit-scrollbar-track
  background-color: transparent

::-webkit-scrollbar-thumb
  -webkit-border-radius: 0
  border-radius: 0
  background-color: white

::-webkit-scrollbar-thumb:hover
  background-color: gray

::-webkit-resizer
  background-image: none
  background-repeat: no-repeat
  width: 4px
  height: 0

::-webkit-scrollbar
  width: 4px
  height: 4px

</style>
