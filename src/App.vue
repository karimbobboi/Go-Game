<template>
  <div id="app">
    <BoardSize v-if="notSelected" @board-selected="startGame" />
    <GoBoard v-else />
  </div>
</template>

<script>
import BoardSize from './components/BoardSize.vue';
import GoBoard from './components/GoBoard.vue';

export default {
  name: 'App',
  data() {
    return {
      notSelected: true,
      boardSize: null
    };
  },
  components: {
    GoBoard,
    BoardSize
  },
  methods: {
    startGame(config) {
      this.notSelected = false;
      window.boardSize = config.size;
      window.komi = config.komi;
      window.scoring = config.scoreMethod;
      window.mainTime = config.mainTime;
      window.periodTime = config.periodTime;
      window.periodLength = config.periodLength;
    }
  }
};
</script>

<style>
#app {
  background-color: #CCA56D;
}
</style>
