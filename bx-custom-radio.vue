<template>
  <div class="wrapper">
    <div class="custom-input" :style="{flex: '1 1 50%'}" :class="{active: selectedGender === false}">
      <input type="radio" id="female" name="gender" :value="false" v-model="selectedGender">
      <label for="female">{{props.labels[0]}}</label>
    </div>
    <div class="custom-input" :style="{flex: '1 1 50%'}" :class="{active: selectedGender === true}">
      <input type="radio" id="male" name="gender" :value="true" v-model="selectedGender">
      <label for="male">{{props.labels[1]}}</label>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';

const props = defineProps({

  labels: {
    type: Array,
    required: true,
    default: () => [
      '1',
      '2'
    ]
  },
  modelValue: {
    type: Boolean,
    default: false
  }
});

const selectedGender = ref(props.modelValue);
</script>

<style scoped>
.wrapper {
  display: flex;
  position: relative;
  padding: 0 10px;
  width: 100%;
  border: 1px solid rgb(var(--ui-field-color-border-default));
  background: #fff;
  font: 15px var(--ui-font-family-primary, var(--ui-font-family-helvetica));
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  outline: none;
  align-items: center;
  gap: 10px;
}

.custom-input {
  flex-grow: 1;
  flex-basis: 50%;
  transition: all .4s 0s ease;
}

.custom-input input[type=radio] {
  display: none;
}

.custom-input label {
  display: block;
  padding: 6px 8px;
  text-align: center;
  color: #757575;
  transition: all .4s 0s ease;
  border:  solid 1px transparent;
}

.custom-input.active label {
  border: var(--ui-field-color-primary) solid 1px;
  background: rgba(var(--ui-field-color-primary), .1);
}
</style>

