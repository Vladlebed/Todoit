<template>
  <v-app>
    <v-main>
      <router-view/>
    </v-main>
    <notifications group="foo" position="bottom left" />
  </v-app>
</template>

<script>

export default {
  name: 'App',
};
</script>

<style lang="scss">
html{
  overflow-y: hidden !important;
}

::-webkit-scrollbar-button {
  background-image: none;
  background-repeat: no-repeat;
  width: 5px;
  height: 0;
}

::-webkit-scrollbar-track {
  background-color: rgba(0,0,0,0.5);
}

::-webkit-scrollbar-thumb {
  -webkit-border-radius: 0;
  border-radius: 0;
  background-color: rgba(255,255,255,0.7);
}

::-webkit-resizer {
  background-image: none;
  background-repeat: no-repeat;
  width: 4px;
  height: 0;
}

::-webkit-scrollbar {
  width: 4px;
  height: 6px;
}
</style>
