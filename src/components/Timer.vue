<template>
  <div :class="[isBlack ? 'blackStyling' : 'whiteStyling', 'timer']">
    <div class="player_tile">
      <div class="player_digits d-flex justify-content-center align-items-center">
        <span class="fw-medium" ref="min1" style="min-width: 150px; text-align: center;">{{ formattedTime }}</span>
      </div>
    </div>
    <div class="timer_trackMode">
      <span ref="timeLabel" class="timer_period">MAIN TIME</span>
      <div class="circle-container mt-3">
        <span class="fw-semibold fs-5">Periods: </span><span class="fw-semibold fs-5" ref="periodTxt">{{ currentPeriod }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      minutes: 1,
      seconds: 0,
      playing: false,
      mainTime: true,
      periods: [],
      numPeriods: 0,
      byo_yomi_periods: 8,
      periodsSizes: [1, 0],
    };
  },
  mounted() {
    this.startTimer();
    this.periods = Array(this.byo_yomi_periods).fill(false);
    this.minutes = window.mainTime.getMinutes();
    this.seconds = window.mainTime.getSeconds();
    this.byo_yomi_periods = window.periodLength;
    this.periodsSizes = [window.periodTime.getMinutes(), window.periodTime.getSeconds()]
  },
  computed: {
    formattedTime() {
      const paddedMinutes = this.minutes < 10 ? `0${this.minutes}` : this.minutes;
      const paddedSeconds = this.seconds < 10 ? `0${this.seconds}` : this.seconds;
      return `${paddedMinutes}:${paddedSeconds}`;
    },
    currentPeriod() {
      return this.byo_yomi_periods - this.numPeriods;
    },
  },
  props: {
    stop: Boolean,
    isBlack: Boolean,
  },
  methods: {
    stopTimer() {
      this.stop = true;
    },
    start() {
      this.stop = false;
    },
    startTimer() {
      this.playing = true; // game starts

      let timerId = setInterval(
        function () {
          //begin time loop
          if (this.playing && !this.stop) {
            const min = this.minutes;
            const sec = this.seconds;

            if (this.mainTime) {
              if (sec == 0) {
                if (min == 0) {
                  this.mainTime = false;
                  this.minutes = this.periodsSizes[0];
                  this.seconds = this.periodsSizes[1];
                  if(this.$refs.timeLabel)
                    this.$refs.timeLabel.textContent = "Period Time";
                } else {
                  this.minutes -= 1;
                  this.seconds = 59;
                }
              } else {
                this.seconds -= 1;
              }
            } else {
              if (sec == 0) {
                if (min == 0) {
                  this.periods[this.numPeriods] = true;
                  this.numPeriods += 1;
                  this.minutes = this.periodsSizes[0];
                  this.seconds = this.periodsSizes[1];
                } else {
                  this.minutes -= 1;
                  this.seconds = 59;
                }
              } else {
                this.seconds -= 1;
              }

              if (this.numPeriods >= this.byo_yomi_periods) {
                this.playing = false;
                this.minutes = 0;
                this.seconds = 0;
                if(this.$refs.periodTxt)
                    this.$refs.periodTxt.style.color = "red";
                clearInterval(timerId);
                this.$emit('timerRanOut', this.isBlack);
              }
            }
          } else {
            //timer stopped, waiting for turn
          }
        }.bind(this),
        1000
      );
    },
  },
};
</script>

<style scoped>
.timer {
  width: 100%;
  height: 80%;
  padding-top: 20px;
  border-radius: 5px;
  background-color: red;
}

.player_tile {
  position: relative;
  height: 150px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  box-shadow: inset 3px 3px 0 #000, inset -3px 3px 0 black,
    inset -3px -3px 0 black, inset 3px -3px 0 black;
  color: #ffffff;
  margin-top: 5px;
}

.player_digits {
  width: 100%;
}

.timer_trackMode {
  margin-bottom: 1em;
  height: 100%;
}

.timer_period {
  width: 100%;
  display: block;
  color: #020202;
  min-height: 50px;
  max-width: 400px;
  font-size: 1.5rem;
  font-weight: bold;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
  letter-spacing: 2px;
  border-bottom: 3px solid #000000;
  border-left: 3px solid #000000;
  border-right: 3px solid #000000;
  color: #ffffff;
  background-color: #0071d5;
  display: flex;
  justify-content: center;
  align-items: center;
}

.circle-container {
  display: flex;
  padding-top: 5px;
  justify-content: space-between;
}

.blackStyling {
  border-color: white;
  background-color: #2d2c2c;
  border: 2px solid black;
  color: white;
}

.blackStyling .player_digits {
  font-size: 3.5rem;
  color: white;
}

.whiteStyling {
  background-color: #f3f3f3;
  border: 2px solid black;
  color: #000;
}

.whiteStyling .player_digits {
  font-size: 3.5rem;
  color: black;
}
</style>
