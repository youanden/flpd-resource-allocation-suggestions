<template>
  <div id="app">
    <home></home>
    <transition name="fade">
      <div class="loading-container" v-if="isLoading">
        <img class="preloader" :src="basePath + 'static/animated_preloader.svg'" />
      </div>
    </transition>
  </div>
</template>
<script>
import Home from '../views/Home';

export default {
  components: {
    Home
  },
  data() {
    return {
      isLoading: true,
      basePath: process.env.basePath
    };
  },
  methods: {
    loaded() {
      this.isLoading = false;
    },
    loading() {
      this.isLoading = true;
    }
  }
}
</script>
<style lang="scss">
body {
  margin: 0;
  font-size: 2rem;
  font-family: -apple-system, BlinkMacSystemFont,
               'avenir next', avenir,
               helvetica, 'helvetica neue',
               Ubuntu,
               'segoe ui', arial,
               sans-serif;
}
.page {
  text-align: center;
  /* nesting for the need to test postcss */
  code {
    background-color: #f0f0f0;
    padding: 3px 5px;
    border-radius: 2px;
  }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-to {
  opacity: 0
}
.loading-container {
  position: absolute;
  right: 0;
  bottom: 0;
  .preloader {
    position: absolute;
    right: 20px;
    bottom: 20px;
    width: 100px;
    height: 100px;
  }
}
</style>
