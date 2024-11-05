<template>
  <div id="board" class="d-flex justify-content-center align-items-center" style="width: 95vw; height: 95vh;">
    <BCard class="bg-light">
      <h3 class="ms-3">Game configuration</h3>
      <BCardBody>
        <BListGroup>
          <BListGroupItem class="d-flex align-items-center">
            <label class="me-3" for="boardSize">Select board size: </label>
            <BFormSelect id="boardSize" v-model="selectedSize" style="width: 100px;">
              <option v-for="size in sizes" :key="size" :value="size">{{ size }}</option>
            </BFormSelect>
          </BListGroupItem>
          <BListGroupItem>
            <label class="me-3">Select scoring method:</label>
            <BFormRadioGroup
              v-model="selectedRule"
              :options="rules"
              button-variant="outline-dark"
              name="radios-btn-outline"
              buttons
            />
          </BListGroupItem>
          <BListGroupItem class="d-flex align-items-center">
            <label class="me-3">Komi: </label>
            <BFormInput v-model="selectedKomi" max="30" class="w-25" type="number" step="0.1" />
          </BListGroupItem>
          <BListGroupItem class="d-flex align-items-center">
            <label class="me-5">Start time: </label>
            <BInputGroup class="my-2">
                <BInput placeholder="MM" max="59" min="0" type="number" v-model="selectedMainMin" class="form-control"></BInput>
                <label class="mx-2 my-2 fw-bold">:</label>
                <BInput placeholder="SS" max="59" min="0" type="number" v-model="selectedMainSec" class="form-control"></BInput>
            </BInputGroup>
          </BListGroupItem>
          <BListGroupItem class="align-items-center">
            <label class="mb-2 fw-bold">Byo-yomi</label>
            <BRow>
              <BCol>
                <label :for="periodNums">Number of periods: </label>
                <BFormInput class="my-2" id="periodNums" v-model="selectedPeriodNum" max="50" type="number" />
              </BCol>
              <BCol>
                <label :for="periodLength">Period length: </label>
                <BInputGroup class="my-2">
                  <BInput placeholder="MM" max="59" min="0" type="number" v-model="selectedPeriodMin" class="form-control"></BInput>
                  <label class="mx-2 my-2 fw-bold">:</label>
                  <BInput placeholder="SS" max="59" min="0" type="number" v-model="selectedPeriodSec" class="form-control"></BInput>
                </BInputGroup>
              </BCol>
            </BRow>
          </BListGroupItem>
        </BListGroup>
      </BCardBody>
      <div class="d-grid gap-2">
        <BButton variant="dark" class="mx-3 mt-2" block @click="selectBoardSize">Start Game</BButton>
      </div>
    </BCard>
  </div>
</template>
  
  <script>
  import { BCard, BCardBody, BButton, BCardFooter, BListGroupItem, BListGroup,
          BDropdown, BDropdownDivider, BDropdownItem, BInputGroup, BInput, BFormInput,
          BFormGroup, BFormRadioGroup, BFormSelect, BRow, BCol, BFormCheckbox
   } from 'bootstrap-vue-next';
  export default {
    components: {
      BCard,
      BCardBody,
      BCardFooter,
      BRow,
      BCol,
      BListGroupItem,
      BListGroup,
      BDropdown,
      BDropdownDivider,
      BDropdownItem,
      BFormGroup,
      BInputGroup, BInput,
      BFormInput,
      BFormRadioGroup,
      BButton,
      BFormSelect,
      BFormCheckbox
  },
    data() {
      return {
        sizes: [9, 13, 19],
        rules: [
          { text: 'Area (Chinese rules)', value: 'Area' },
          { text: 'Territory (Japanese rules)', value: 'Territory' }
        ],
        selectedSize: 9,
        selectedRule: "Area",
        selected: false,
        selectedKomi: 7.5,
        selectedMainMin: "15",
        selectedMainSec: "00",
        selectedPeriodMin: "01",
        selectedPeriodSec: "00",
        selectedPeriodNum: 5,
        showAlert: false,

        config: {
          size: this.selectedSize, scoreMethod: this.selectedRule, komi: this.selectedKomi,
          mainTime: new Date(), periodTime: new Date(), periodLength: this.selectedPeriodNum
        }
      };
    },
    methods: {
      selectBoardSize() {
        if(isNaN(this.selectedKomi) || this.selectedKomi === '' || this.selectedKomi < 0){
          alert("Please enter valid komi");
          return;
        }

        if(isNaN(this.selectedPeriodNum) || this.selectedPeriodNum === '' || this.selectedPeriodNum < 0){
          alert("Please enter valid number of periods");
          return;
        }

        const mainMin = parseInt(this.selectedMainMin);
        const mainSec = parseInt(this.selectedMainSec);
        if(isNaN(mainMin) || (mainMin < 0 || mainMin > 59) || isNaN(mainSec) || (mainSec < 0 || mainSec > 59)){
          alert("Please enter valid start time");
          return;
        }
        const mainTime = new Date();
        mainTime.setMinutes(mainMin);
        mainTime.setSeconds(mainSec);

        const periodMin = parseInt(this.selectedPeriodMin);
        const periodSec = parseInt(this.selectedPeriodSec);
        if(isNaN(periodMin) || (periodMin < 0 || periodMin > 59) || isNaN(periodSec) || (periodSec < 0 || periodSec > 59)){
          alert("Please enter valid period time");
          return;
        }
        const periodTime = new Date();
        periodTime.setMinutes(periodMin);
        periodTime.setSeconds(periodSec);

        this.selected = true;
        this.config.size = this.selectedSize;
        this.config.scoreMethod = this.selectedRule;
        this.config.komi = this.selectedKomi;
        this.config.mainTime = mainTime;
        this.config.periodTime = periodTime;
        this.config.periodLength = this.selectedPeriodNum;
        this.$emit('board-selected', this.config);
      }
    }
  };
</script>

<style>
#board {
  background-color: #CCA56D;
}
</style>