<template>
  <div class="main-ui-calendar">
    <div data-type="DATE" class="main-ui-control-field">
      <span v-if="label!=null" class="main-ui-control-field-label">{{label}}<span v-if="required" style="color: rgb(255, 0, 0)">*</span></span>
      <div 
        @click="disabled ? null : calendarPopup?.initPopup($event, PopupLocation.BOTTOM)" 
        class="main-ui-control-custom filter-type-single main-ui-date-custom" 
        :class="{'main-ui-disable': disabled, 'main-ui-focus': calendarPopup?.isActive}"
      >
        <span class="main-ui-date-custom-button"></span>
  
        <span class="main-ui-control-input main-ui-date-custom-input">
          <span v-if="model==null || (Array.isArray(model) && model.length==0)" class="main-ui-placeholder">{{ placeholder }}</span>
          <span v-else>{{ outerText }}</span>
        </span>
        
        <div @click.prevent="clear" v-if="model && !disabled" class="main-ui-control-custom-value-delete">
          <span class="main-ui-control-custom-value-delete-item"></span>
        </div>
      
      </div>
    </div>
  <BxTeleport ref="calendar">
    <template #body="{popup}">
      <div class="bx-calendar bx-calendar-time-disabled" style="display: block">
          <div class="bx-calendar-header">
            <a class="bx-calendar-left-arrow" @click="previousMonth()" />
            <span class="bx-calendar-header-content">
              <a @click="calendarMonthPopup?.initPopup($event, PopupLocation.CENTER)" class="bx-calendar-top-month">{{months[showedDate.getMonth()]}}</a>
                <BxTeleport ref="calendarMonth" :collision="false">
                  <template #body="{popup}">
                    <div class="bx-calendar-month-popup">
                      <div class="bx-calendar-month-title">{{showedDate.toLocaleString('ru', { month: 'long' })}}</div>
                      <div class="bx-calendar-month-content">
                        <span 
                        class="bx-calendar-month" 
                        v-for="(month, index) in months" 
                        :key="index" 
                        @click="changeMonth(index)"
                        :class="{'bx-calendar-month-active': index === showedDate.getMonth()}"
                        >{{ month }}</span>
                      </div>
                    </div>
                  </template>
                </BxTeleport>
              <a class="bx-calendar-top-year" @click="calendarYearPopup?.initPopup($event, PopupLocation.CENTER)">{{showedDate.getFullYear()}}</a>
              <BxTeleport ref="calendarYear" :collision="false">
                <template #body="{popup}">
                  <div class="bx-calendar-year-popup">
                    <div class="bx-calendar-year-title">{{showedDate.getFullYear()}}</div>
                    <div class="bx-calendar-year-content">
                      <span class="bx-calendar-year-number" 
                        v-for="year in years" 
                        :class="{'bx-calendar-year-active': year === showedDate.getFullYear()}" 
                        @click="changeYear(year)"
                      >
                        {{year}}
                      </span>
                    </div>
                    <input type="text" class="bx-calendar-year-input" maxlength="4" @change="(v:any)=>changeYear(v.target.value)">
                  </div>
                </template>
              </BxTeleport>
            </span>
            <a class="bx-calendar-right-arrow" @click="nextMonth()" />
          </div>
          <div v-if="!monthPicker" class="bx-calendar-name-day-wrap">
            <span v-for="column in ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']" class="bx-calendar-name-day">{{ column }}</span>
          </div>
          <div v-if="!monthPicker" class="bx-calendar-cell-block">
            <div class="bx-calendar-layer">
              <div v-for="rowDate in dateMatrix" class="bx-calendar-range">
                <a 
                  class="bx-calendar-cell"
                  v-for="day in rowDate"
                  :class="{
                    'bx-calendar-date-hidden':day.getMonth() !== showedDate.getMonth() || (props.minDate && day < props.minDate) || (props.maxDate && day > props.maxDate),
                    'bx-calendar-weekend': day.getDay() === 0 || day.getDay() === 6,
                    'bx-calendar-active': isActiveDate(day),
                  }"
                  @click="setDateCalendar(day)"
                  >{{day.getDate()}}</a>
              </div> 
            </div>
          </div>
        </div>
    </template>
  </BxTeleport>
  </div>
  </template>
  
  <script setup lang="ts">
  import { computed, onMounted, reactive, ref, toRaw, useTemplateRef, watch } from 'vue';
  import { ActionType, IElementPopup, IPosition, PopupLocation } from './globalInterface';
  import { formatDate, isDateInRange } from './dateWorker.ts';
  import BxTeleport from './bx-teleport.vue';
  
  const props = withDefaults(defineProps<{
      label?:string|null,
      format?: string,
      range?:boolean,
      placeholder?:string,
      disabled?:boolean,
      required?:boolean,
      monthPicker?:boolean
      minDate?:Date|null,
      maxDate?:Date|null
    }>(),{
      monthPicker:false,
      disabled:false,
      required:false,
      label:null,
      format: 'dd.mm.yyyy',
      range:false,
      minDate:null,
      maxDate:null
  });
  
  const calendarPopup=useTemplateRef('calendar');
  const calendarMonthPopup=useTemplateRef('calendarMonth');
  const calendarYearPopup=useTemplateRef('calendarYear');
  const model = defineModel();
  // const test = useTemplateRef('test');
  // test.value?.initPopup();
  
  const showedDate=ref<Date>(new Date());
  const months = ref(["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"]);
  const years = computed(()=>Array.from({length:7},(v,i)=>showedDate.value.getFullYear()-3+i));
  
  const outerText=computed(()=>{
    let result="";
    if (props.monthPicker){
      return model.value ? new Date(model.value).toLocaleString('ru', { month: 'long' })
          .charAt(0).toUpperCase() + new Date(model.value).toLocaleString('ru', { month: 'long' })
          .slice(1) + ' ' + new Date(model.value).getFullYear() : '';
    } else if (Array.isArray(model.value)){
      result=model.value.map((dateEl:Date|null)=>dateEl?formatDate(dateEl,props.format):'').join(' - ');
    } else {
      result= model.value instanceof Date ? formatDate(model.value,props.format) : '';
    }
    return result;
  });
  
  function clear(){
    model.value=null;
  }
  
  function setDateCalendar(date:Date){
    if(props.minDate && date<props.minDate) return;
    if(props.maxDate && date>props.maxDate) return;
    if (props.range){
      if (model.value==null || !Array.isArray(model.value) || model.value.length==0){
        model.value=[new Date(date)];
      } else if (model.value.length==1){
        model.value[0]>date ? model.value=[date,model.value[0]] : model.value=[model.value[0],new Date(date)];
      } else if (model.value.length==2){
        if (model.value[0].toDateString()==date.toDateString() || model.value[1].toDateString()==date.toDateString()) model.value=[date];
        else if ((model.value[0]<date && model.value[1]>date) || (model.value[0]>date)) model.value=[new Date(date),model.value[1]];
        else if(model.value[1]<date) model.value=[model.value[0], new Date(date)];    
      }
    } else {
      model.value=new Date(date);   
    }
  
    if (showedDate.value.getMonth()!=date.getMonth() || showedDate.value.getFullYear()!=date.getFullYear()) showedDate.value=new Date(date);
  }
  
  function isActiveDate(date:Date){
    if (props.range){
      if (model.value==null) return false;
      if (Array.isArray(model.value) && model.value.length==1) return +new Date(model.value[0].toDateString()) === +new Date(date.toDateString())
      else return isDateInRange(date, model.value[0], model.value[1]);
    } else {
      if (model.value==null) return false;
      //@ts-ignore
      return model.value.toDateString()===date.toDateString();
    }
  }
  
  function changeMonth(index:number){
    showedDate.value.setMonth(index);
    showedDate.value=new Date(showedDate.value);
    if (props.monthPicker){
      model.value=new Date(showedDate.value);
    }
  }
  
  function changeYear(year:number){
    if (year < 1900 || year>2999) return;
    showedDate.value.setFullYear(year);
    showedDate.value=new Date(showedDate.value);
    if (props.monthPicker){
      model.value=new Date(showedDate.value);
    }
  }
  
  function previousMonth(){
    showedDate.value.setMonth(showedDate.value.getMonth()-1);
    showedDate.value=new Date(showedDate.value);
    if (props.monthPicker){
      model.value=new Date(showedDate.value);
    }
  }
  
  function nextMonth(){
    showedDate.value.setMonth(showedDate.value.getMonth()+1);
    showedDate.value=new Date(showedDate.value);
    if (props.monthPicker){
      model.value=new Date(showedDate.value);
    }
  }
  
  const dateMatrix=computed(()=>{
    const dateMatrixResult: Array<Array<Date>> = [];
    let firstDayOfMonth = new Date(showedDate.value.getFullYear(), showedDate.value.getMonth(), 1);
    if (firstDayOfMonth.getDay() != 1) {
      firstDayOfMonth = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth(), 2-(firstDayOfMonth.getDay()==0 ? 7 : firstDayOfMonth.getDay()) );
    }
    for (let i = 0; i < 6; i++) {
      dateMatrixResult[i] = [];
      for (let j = 0; j < 7; j++) {
        dateMatrixResult[i][j] = new Date(firstDayOfMonth);
        firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1);
      }
    }
    return dateMatrixResult;
  });
  
  // function outerClick(event:any){
  // 	let isClickPopup = !!event.target.closest('.popup-window#bx-component-popup-vue');
  //   let clickArea = event.target.closest("[data-hasPopup='true']");
  //   if (isClickPopup){
  //     globalClick.value?.addEventListener('mouseup', outerClick, { capture: true, once: true });
  // 		return;
  // 	}
  
  //   if ((clickArea==null || (clickArea.dataset.open==true)) && showMenuItems.value!=null) {
  //     showMenuItems.value.target.dataset.open='false';
  //   }
    
  //   showMenuItems.value=null;	
  // }
  
  // function initPopup(event:MouseEvent){
  //   console.log(event.currentTarget);
  //   let boundingClientRect: DOMRect = (event.target.closest('.main-ui-date-custom') as HTMLElement)?.getBoundingClientRect();
  //   let clickArea = event.target.closest("[data-hasPopup='true']");  
  //   if (boundingClientRect==null || clickArea==null) return;
    
  //   if (clickArea.dataset.open=="true") {
  //     clickArea.dataset.open=false;
  //     return;
  //   };
  //   let popupId = Math.floor(Math.random() * 100000000) + 1;
  //   clickArea.dataset.open=true;
  //   clickArea.dataset.popupId=popupId;
  //   globalClick.value?.addEventListener('mouseup', outerClick, { capture: true, once: true });
    
  //   let result:IElementPopup={ 
  //       position: { x: 0, y: 0 },
  //       type: ActionType.calendar,
  //       target: clickArea,
  //       popupId: popupId
  //   };
  
  //   result.position.x = boundingClientRect.x;
  //   result.position.y = boundingClientRect.bottom +1;
  //   showMenuItems.value=result;
  // }
  
  onMounted(()=>{
    if (props.range){
      if (!Array.isArray(model.value) && model.value!=null) model.value=[model.value];
      else if (model.value==null) model.value=[];
    }
  });
  
  
  </script>
  
  <style scoped>
  .popup-window{
    position: fixed;
  }
  
  .bx-calendar-placeholder{
    padding-left: 5px;
  }
  
  .main-ui-control-field-label {
      position: relative;
      display: flex;
      margin-bottom: 5px;
      color: #a3a9b1;
      gap:4px;
      font: 12px / 14px var(--ui-font-family-primary, var(--ui-font-family-helvetica));
  }
  
  .main-ui-filter-with-additional-filters .main-ui-filter-field-container-list > .main-ui-control-field-group[data-type="DATE"] .main-ui-control-field:not(.main-ui-filter-remove-margin-right) + .main-ui-control-field {
      margin-left: 10px;
  }
  .main-ui-filter-with-additional-filters .main-ui-filter-field-container-list > .main-ui-control-field-group[data-type="DATE"] > .main-ui-control-field {
      margin-right: 0;
  }
  .main-ui-control-field-group .main-ui-control-field:nth-last-of-type(2) {
      margin-right: 0;
  }
  .main-ui-control-field-group .main-ui-control-field {
      flex-grow: 1;
      /* flex-basis: min-content; */
      width: auto;
      float: left;
      margin-right: 10px;
      min-width: auto;
      margin-bottom: 0;
  }
  
  .main-ui-control-field-group .main-ui-date-custom {
      min-width: 100px;
  }
  .main-ui-date-custom {
      position: relative;
      display: inline-block;
      padding: 0;
      min-width: 168px;
      line-height: 38px;
      color: #a3a3a3;
      cursor: pointer;
      border: none;
  }
  .main-ui-control-custom{
    height: 38px;
    display: flex;
    flex-direction: row;
    align-items: center;
  
    /* position: relative; */
    /* padding: 0 10px; */
    width: 100%;
    /* height: 38px; */
    border: 1px solid rgb(var(--ui-field-color-border-default));
    /* border-radius: var(--main-ui-control-border-radius, var(--ui-border-radius-2xs, 2px)); */
    background: #fff;
    font: 15px var(--ui-font-family-primary, var(--ui-font-family-helvetica));
    /* box-sizing: border-box; */
    transition: all .3s ease-in-out;
    outline: none;
  }
  
  .main-ui-date-custom-button {
      height: 20px;
      width: 24px;
      background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIzODUiIHZpZXdCb3g9IjAgMCAxOCAzODUiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZmlsbD0iIzUzNUM2OSIgZD0iTTUuMDY1IDQuNjgyTDIuMzc3IDEuOTk0IDEuMDEgMy4zNjIgMy42OTYgNi4wNS45OSA4Ljc1N2wxLjM2OCAxLjM3IDIuNzA4LTIuNzEgMi43IDIuNzAzIDEuMzctMS4zNjhMNi40MzMgNi4wNWwyLjY4Mi0yLjY4Mkw3Ljc0OCAyIDUuMDY1IDQuNjgyeiIvPjxnIGZpbGw9IiM3MTdBODQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMjgpIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMiIgcng9IjEiLz48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMiIgeT0iNCIgcng9IjEiLz48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMiIgeT0iOCIgcng9IjEiLz48L2c+PHBhdGggZmlsbD0iIzUyNUM2OCIgZD0iTS42NjcgNjEuNDE1TDAgNjRsMi40NDQtLjc2NWMtLjE1Mi0uNDE3LS4zNzYtLjc5Ny0uNjYtMS4xMi0uMzE4LS4zMjUtLjctLjU2My0xLjExNy0uN3ptNS40MDctNS45NjNsLTQuNzggNS4yMTNjLjM5Ny4yMDguNzY1LjQ3NCAxLjA5NC43OTIuMjcuMzQzLjQ5Ni43MjUuNjcgMS4xMzVsNC43NzctNS4yMWMtLjE4NS0uNDQ3LS40MzctLjg1Ny0uNzQ2LTEuMjEzLS4yOTYtLjMwNi0uNjQtLjU0OC0xLjAxOC0uNzE1bC4wMDItLjAwM3ptMi43MzMtMS4wNTdjLS4yNDItLjI2LS41Ny0uNDAzLS45MS0uMzk1LS4zMzguMDA4LS42Ni4xNjUtLjg5Mi40MzVsLS4yODcuMzEzYy4zODIuMTc3LjczMi40MjggMS4wMzMuNzQuMzA0LjM0OC41NS43NS43MzIgMS4xODdsLjI4OC0uMzE0Yy4yNDgtLjI1Mi4zOS0uNjA0LjM5OC0uOTc0LjAwNi0uMzctLjEyNS0uNzI4LS4zNjQtLjk5aC4wMDN6Ii8+PHBhdGggZmlsbD0iIzIxMjEyMSIgZD0iTTYgODV2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6Ii8+PHBhdGggZmlsbD0iIzUzNUM2OCIgZD0iTTEwLjEzIDE4OS45ODhsLTIuNTctMi43NmMtLjE4Ni0uMTk4LS40NTQtLjI3NC0uNzA1LS4yLS4yNTIuMDcyLS40NDcuMjg0LS41MTQuNTUzLS4wNjUuMjcuMDA4LjU1OC4xOTIuNzU0bC41MjUuNTYyLTQuMTMgMy4yOTItLjUxNi0uNTU0Yy0uMjgzLS4zLS43NC0uMy0xLjAyNSAwLS4yODIuMzA4LS4yODIuOCAwIDEuMTA4bDEuNTczIDEuNjg1LTIuOTAyIDMuMzIzYy0uMDM2LjAzOC0uMDU2LjA5LS4wNTYuMTQzIDAgLjA1My4wMi4xMDUuMDU2LjE0Mi4wNzMuMDcuMTg1LjA3LjI1OCAwbDMuMTAyLTMuMTI1IDEuNTczIDEuNjg1Yy4xOC4yMDIuNDUuMjgzLjcwNC4yMS4yNTQtLjA3LjQ1Mi0uMjgyLjUxOC0uNTU0LjA2Ny0uMjctLjAwOC0uNTYtLjE5Ny0uNzU1bC0uNTE3LS41NTMgMy4wNzMtNC40MjQuNTMyLjU3Yy4yODUuMy43NDIuMyAxLjAyNyAwIC4xMzctLjE0NS4yMTUtLjM0My4yMTUtLjU1IDAtLjIwNy0uMDc4LS40MDUtLjIxNi0uNTV6Ii8+PHBhdGggZmlsbD0iIzUzNUM2OSIgZD0iTTEwLjIzOCAxMjAuNzU0di0xLjI3SDguODg1Yy0uMDg1LS41OTItLjM0LTEuMS0uNjc3LTEuNjA3bC43Ni0uNzYyLS44NDUtLjg0Ni0uODQ2Ljc2Yy0uNDIzLS4zMzgtLjkzLS41OTItMS41MjMtLjY3NlYxMTVoLTEuMjd2MS4zNTRjLS41OTIuMDg0LTEuMS4zMzgtMS42MDcuNjc3bC0uNzYyLS43Ni0uODQ2Ljg0NS43Ni43NjJjLS4zMzguNTA4LS41OTIgMS4wMTUtLjY3NiAxLjYwOEgwdjEuMjdoMS4zNTRjLjA4NC41OS4zMzggMS4xLjY3NyAxLjUyMmwtLjc2Ljg0Ni45My45My43NjItLjc2Yy40MjMuMzM4IDEuMDE1LjU5MiAxLjYwNy42NzZ2MS4zNTNoMS4yNjh2LTEuMzU0Yy41OTMtLjA4NSAxLjEtLjM0IDEuNjA4LS42NzhsLjc2Mi43NjIuOTMtLjkzLS45My0uODQ3Yy4zMzgtLjQyMy41MDctMS4wMTUuNjc3LTEuNjA4aDEuMzUzdi4wODR6bS03LjQ0Ni0uNTkyYzAtMS4yNyAxLjAxNi0yLjM3IDIuMzctMi4zNyAxLjI3IDAgMi4zNyAxLjAxNiAyLjM3IDIuMzcgMCAxLjI3LTEuMDE3IDIuMzctMi4zNyAyLjM3LTEuMzU0LS4wODYtMi4zNy0xLjEtMi4zNy0yLjM3eiIvPjxwYXRoIGZpbGw9IiMyMTIxMjEiIGQ9Ik0xMC4yMzggMTU1Ljc1NHYtMS4yN0g4Ljg4NWMtLjA4NS0uNTkyLS4zNC0xLjEtLjY3Ny0xLjYwN2wuNzYtLjc2Mi0uODQ1LS44NDYtLjg0Ni43NmMtLjQyMy0uMzM4LS45My0uNTkyLTEuNTIzLS42NzZWMTUwaC0xLjI3djEuMzU0Yy0uNTkyLjA4NC0xLjEuMzM4LTEuNjA3LjY3N2wtLjc2Mi0uNzYtLjg0Ni44NDUuNzYuNzYyYy0uMzM4LjUwOC0uNTkyIDEuMDE1LS42NzYgMS42MDhIMHYxLjI3aDEuMzU0Yy4wODQuNTkuMzM4IDEuMS42NzcgMS41MjJsLS43Ni44NDYuOTMuOTMuNzYyLS43NmMuNDIzLjMzOCAxLjAxNS41OTIgMS42MDcuNjc2djEuMzUzaDEuMjY4di0xLjM1NGMuNTkzLS4wODUgMS4xLS4zNCAxLjYwOC0uNjc4bC43NjIuNzYyLjkzLS45My0uOTMtLjg0N2MuMzM4LS40MjMuNTA3LTEuMDE1LjY3Ny0xLjYwOGgxLjM1M3YuMDg0em0tNy40NDYtLjU5MmMwLTEuMjcgMS4wMTYtMi4zNyAyLjM3LTIuMzcgMS4yNyAwIDIuMzcgMS4wMTYgMi4zNyAyLjM3IDAgMS4yNy0xLjAxNyAyLjM3LTIuMzcgMi4zNy0xLjM1NC0uMDg2LTIuMzctMS4xLTIuMzctMi4zN3oiLz48cGF0aCBmaWxsPSIjNTM1QzY5IiBkPSJNMTEuNTA2IDI0NC41Yy4xODQgMCAuMzYtLjA3NC40OS0uMjA1LjEzLS4xMy4yMDQtLjMwNy4yMDQtLjQ5di0xLjA0M2MwLS4zODMtLjMxLS42OTQtLjY5NC0uNjk0LS4zODMgMC0uNjk0LjMxLS42OTQuNjk0djEuMDQyYzAgLjE4NC4wNzMuMzYuMjAzLjQ5LjEzLjEzMi4zMDcuMjA1LjQ5LjIwNXptLTcgLjA3Yy40MDYgMCAuNzM1LS4zMy43MzUtLjczNXYtMS4xYzAtLjQwNi0uMzI4LS43MzUtLjczNC0uNzM1LS40MDYgMC0uNzM1LjMzLS43MzUuNzM1djEuMWMwIC40MDYuMzMuNzM1LjczNi43MzV6bTkuNjUyLTEuMDM3aC0xLjE1MnYuNWMwIC44MjgtLjY3IDEuNS0xLjUgMS41LS44MjggMC0xLjUtLjY3Mi0xLjUtMS41di0uNWgtNHYuNWMwIC44MjgtLjY3IDEuNS0xLjUgMS41LS44MjggMC0xLjUtLjY3Mi0xLjUtMS41di0uNUgxLjg1NGMtLjUxNyAwLTEuMDEyLjIxNC0xLjM2My41OTUtLjM1LjM4LS41MjYuODktLjQ4NCAxLjQwNXYxMGMwIC41NTIuNDQ4IDEgMSAxaDE0Yy41NTIgMCAxLS40NDggMS0xdi0xMGMuMDItMS4wNTQtLjc5NS0xLjkzNi0xLjg0OC0yem0tLjE1MiAxMWgtMTJ2LTdoMTJ2N3pNNS4zNCAyNTEuMzRjLS40MDIuMzQ3LS43NTcuNzQyLTEuMDYgMS4xNzctLjE3My4yODUtLjI4Mi42MDYtLjMyLjkzOGgzLjI5NnYtLjg3M0g1LjM5Yy4wNTQtLjA5My4xMTgtLjE4LjE5LS4yNi4wOC0uMDkuMjY4LS4yNy41NjUtLjU0My4yMi0uMTk0LjQyNi0uNDAzLjYxNS0uNjI3LjE1NS0uMTkuMjgyLS40LjM3Ny0uNjI2LjA4LS4yLjEyLS40MTUuMTItLjYzLjAwNy0uMzctLjE0NS0uNzI1LS40MTctLjk3NC0uMzE0LS4yNzUtLjcyMy0uNDE1LTEuMTQtLjM5LS4zOTQtLjAxNS0uNzguMTA0LTEuMS4zMzYtLjMyMi4yOC0uNTEyLjY4NS0uNTI1IDEuMTEzbC45My4wOTRjLS4wMDQtLjIxNC4wNjctLjQyMi4yLS41OS4yNjgtLjIzMi42NjQtLjIzNS45MzUtLjAwNy4xMi4xMy4xODIuMzA2LjE3LjQ4My0uMDA3LjIwNy0uMDc3LjQwOC0uMi41NzUtLjIzNC4yOS0uNDkyLjU2LS43Ny44MDh2LS4wMDV6bTQuNzA2IDIuMTE1aC45MXYtLjk4N2guNjF2LS44MjJoLS42MXYtMy4xMWgtLjc5TDguMDQgMjUxLjY1di44MjJoMi4wMDZ2Ljk4Ny0uMDA1em0tMS4xMjctMS44MTNsMS4xMjYtMS42NzZ2MS42OEg4Ljkydi0uMDA0eiIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMjc2KSI+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjkiIGZpbGw9IiM1RTY2NzQiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMTAuMTc0IDguOTczbDIuMjg0LTIuMjgzYy4xNjUtLjE2Ni4xNjUtLjQzNCAwLS42bC0uNi0uNmMtLjE2Ni0uMTY1LS40MzQtLjE2NS0uNiAwTDguOTc1IDcuNzcyIDYuNjkgNS40OWMtLjE2Ni0uMTY2LS40MzQtLjE2Ni0uNiAwbC0uNi42Yy0uMTY1LjE2NS0uMTY1LjQzMyAwIC42TDcuNzczIDguOTcgNS40OSAxMS4yNTVjLS4xNjUuMTY2LS4xNjUuNDM0IDAgLjZsLjYuNmMuMTY2LjE2NS40MzQuMTY1LjYgMGwyLjI4My0yLjI4MyAyLjI4MyAyLjI4M2MuMTY2LjE2NS40MzQuMTY1LjYgMGwuNi0uNmMuMTY1LS4xNjYuMTY1LS40MzQgMC0uNmwtMi4yODItMi4yODJ6Ii8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMzEyKSI+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjkiIGZpbGw9IiM1RTY2NzQiIG9wYWNpdHk9Ii41MDEiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMTAuMTc0IDguOTczbDIuMjg0LTIuMjgzYy4xNjUtLjE2Ni4xNjUtLjQzNCAwLS42bC0uNi0uNmMtLjE2Ni0uMTY1LS40MzQtLjE2NS0uNiAwTDguOTc1IDcuNzcyIDYuNjkgNS40OWMtLjE2Ni0uMTY2LS40MzQtLjE2Ni0uNiAwbC0uNi42Yy0uMTY1LjE2NS0uMTY1LjQzMyAwIC42TDcuNzczIDguOTcgNS40OSAxMS4yNTVjLS4xNjUuMTY2LS4xNjUuNDM0IDAgLjZsLjYuNmMuMTY2LjE2NS40MzQuMTY1LjYgMGwyLjI4My0yLjI4MyAyLjI4MyAyLjI4M2MuMTY2LjE2NS40MzQuMTY1LjYgMGwuNi0uNmMuMTY1LS4xNjYuMTY1LS40MzQgMC0uNmwtMi4yODItMi4yODJ6Ii8+PC9nPjxyZWN0IHdpZHRoPSIxMyIgaGVpZ2h0PSIxMyIgeD0iLjUiIHk9Ii41IiBmaWxsPSIjRkZGIiBzdHJva2U9IiNDNkNERDMiIHJ4PSIyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDM0NikiLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDM2OSkiPjxyZWN0IHdpZHRoPSIxMyIgaGVpZ2h0PSIxMyIgeD0iLjUiIHk9IjEuMTI1IiBmaWxsPSIjRkZGIiBzdHJva2U9IiMyNTlFQzYiIHJ4PSIyIi8+PHBhdGggZmlsbD0iIzI1OUVDNiIgZD0iTTcuNTMgOC40ODdsLTMuNzc1LTMuNi0xLjI1IDEuMzY4IDQuOTQgNS4wMS4wNzUtLjA3NC4yODYuMzM1IDguNjk0LTEwLjRMMTUuMDk0IDAgNy41MyA4LjQ4N3oiLz48L2c+PHBhdGggZmlsbD0iIzUzNUM2QSIgZD0iTTE2LjE3OCAyMjcuNDM4bC00LjQ4LTQuNDhjLjU5LS45MTcuOTM2LTIuMDE3LjkzNi0zLjE5OCAwLTMuMjgtMi42NjgtNS45NDctNS45NDctNS45NDctMy4yOCAwLTUuOTQ3IDIuNjY3LTUuOTQ3IDUuOTQ3IDAgMy4yOCAyLjY2OCA1Ljk0NyA1Ljk0NyA1Ljk0NyAxLjI4MyAwIDIuNDY1LS40MDcgMy40NDItMS4xbDQuNDQgNC40NGMuMjIyLjIyNC41Ny4yMjQuNzkyIDBsLjgzNS0uODM1Yy4yMDQtLjIwNC4yMDQtLjU1LS4wMi0uNzc0em0tMTQuNS03LjY1OGMwLTIuNzcgMi4yNC01LjAxIDUuMDEtNS4wMSAyLjc3IDAgNS4wMSAyLjI0IDUuMDEgNS4wMSAwIDIuNzctMi4yNCA1LjAxLTUuMDEgNS4wMS0yLjc3IDAtNS4wMS0yLjI0LTUuMDEtNS4wMXoiLz48L2c+PC9zdmc+) 6px -240px no-repeat; opacity: .4;
      z-index: 1;
      transition: opacity 200ms;
  }
  
  .main-ui-filter-field-container input:focus, .main-ui-focus {
      border: 1px solid rgba(81, 203, 238, 1);
  }
  .main-ui-control-custom .main-ui-control-input {
      /* position: relative; */
      /* height: 37px; */
      width: 100%;
      border: none;
      color: #535c69;
      background: transparent;
      /* box-sizing: border-box; */
      transition: all .3s ease-in-out;
      outline: none;
      cursor: pointer;
      padding: 0px;
      padding-left: 5px;
  }
  .main-ui-date-custom-input {
      width: 100%;
      box-sizing: border-box;
      padding: 0 30px 0 30px;
      line-height: 38px;
  }
  
  .main-ui-control-custom-value-delete {
      height: auto;
      width: 30px;
      position: absolute;
      top: 1px;
      right: 1px;
      background: #fff;
  }
  
  .main-ui-control-custom-value-delete-item {
    position: absolute;
    top: 10px;
    right: 6px;
    display: inline-block;
    width: 18px;
    height: 18px;
    background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIzODUiIHZpZXdCb3g9IjAgMCAxOCAzODUiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZmlsbD0iIzUzNUM2OSIgZD0iTTUuMDY1IDQuNjgyTDIuMzc3IDEuOTk0IDEuMDEgMy4zNjIgMy42OTYgNi4wNS45OSA4Ljc1N2wxLjM2OCAxLjM3IDIuNzA4LTIuNzEgMi43IDIuNzAzIDEuMzctMS4zNjhMNi40MzMgNi4wNWwyLjY4Mi0yLjY4Mkw3Ljc0OCAyIDUuMDY1IDQuNjgyeiIvPjxnIGZpbGw9IiM3MTdBODQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMjgpIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMiIgcng9IjEiLz48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMiIgeT0iNCIgcng9IjEiLz48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMiIgeT0iOCIgcng9IjEiLz48L2c+PHBhdGggZmlsbD0iIzUyNUM2OCIgZD0iTS42NjcgNjEuNDE1TDAgNjRsMi40NDQtLjc2NWMtLjE1Mi0uNDE3LS4zNzYtLjc5Ny0uNjYtMS4xMi0uMzE4LS4zMjUtLjctLjU2My0xLjExNy0uN3ptNS40MDctNS45NjNsLTQuNzggNS4yMTNjLjM5Ny4yMDguNzY1LjQ3NCAxLjA5NC43OTIuMjcuMzQzLjQ5Ni43MjUuNjcgMS4xMzVsNC43NzctNS4yMWMtLjE4NS0uNDQ3LS40MzctLjg1Ny0uNzQ2LTEuMjEzLS4yOTYtLjMwNi0uNjQtLjU0OC0xLjAxOC0uNzE1bC4wMDItLjAwM3ptMi43MzMtMS4wNTdjLS4yNDItLjI2LS41Ny0uNDAzLS45MS0uMzk1LS4zMzguMDA4LS42Ni4xNjUtLjg5Mi40MzVsLS4yODcuMzEzYy4zODIuMTc3LjczMi40MjggMS4wMzMuNzQuMzA0LjM0OC41NS43NS43MzIgMS4xODdsLjI4OC0uMzE0Yy4yNDgtLjI1Mi4zOS0uNjA0LjM5OC0uOTc0LjAwNi0uMzctLjEyNS0uNzI4LS4zNjQtLjk5aC4wMDN6Ii8+PHBhdGggZmlsbD0iIzIxMjEyMSIgZD0iTTYgODV2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6Ii8+PHBhdGggZmlsbD0iIzUzNUM2OCIgZD0iTTEwLjEzIDE4OS45ODhsLTIuNTctMi43NmMtLjE4Ni0uMTk4LS40NTQtLjI3NC0uNzA1LS4yLS4yNTIuMDcyLS40NDcuMjg0LS41MTQuNTUzLS4wNjUuMjcuMDA4LjU1OC4xOTIuNzU0bC41MjUuNTYyLTQuMTMgMy4yOTItLjUxNi0uNTU0Yy0uMjgzLS4zLS43NC0uMy0xLjAyNSAwLS4yODIuMzA4LS4yODIuOCAwIDEuMTA4bDEuNTczIDEuNjg1LTIuOTAyIDMuMzIzYy0uMDM2LjAzOC0uMDU2LjA5LS4wNTYuMTQzIDAgLjA1My4wMi4xMDUuMDU2LjE0Mi4wNzMuMDcuMTg1LjA3LjI1OCAwbDMuMTAyLTMuMTI1IDEuNTczIDEuNjg1Yy4xOC4yMDIuNDUuMjgzLjcwNC4yMS4yNTQtLjA3LjQ1Mi0uMjgyLjUxOC0uNTU0LjA2Ny0uMjctLjAwOC0uNTYtLjE5Ny0uNzU1bC0uNTE3LS41NTMgMy4wNzMtNC40MjQuNTMyLjU3Yy4yODUuMy43NDIuMyAxLjAyNyAwIC4xMzctLjE0NS4yMTUtLjM0My4yMTUtLjU1IDAtLjIwNy0uMDc4LS40MDUtLjIxNi0uNTV6Ii8+PHBhdGggZmlsbD0iIzUzNUM2OSIgZD0iTTEwLjIzOCAxMjAuNzU0di0xLjI3SDguODg1Yy0uMDg1LS41OTItLjM0LTEuMS0uNjc3LTEuNjA3bC43Ni0uNzYyLS44NDUtLjg0Ni0uODQ2Ljc2Yy0uNDIzLS4zMzgtLjkzLS41OTItMS41MjMtLjY3NlYxMTVoLTEuMjd2MS4zNTRjLS41OTIuMDg0LTEuMS4zMzgtMS42MDcuNjc3bC0uNzYyLS43Ni0uODQ2Ljg0NS43Ni43NjJjLS4zMzguNTA4LS41OTIgMS4wMTUtLjY3NiAxLjYwOEgwdjEuMjdoMS4zNTRjLjA4NC41OS4zMzggMS4xLjY3NyAxLjUyMmwtLjc2Ljg0Ni45My45My43NjItLjc2Yy40MjMuMzM4IDEuMDE1LjU5MiAxLjYwNy42NzZ2MS4zNTNoMS4yNjh2LTEuMzU0Yy41OTMtLjA4NSAxLjEtLjM0IDEuNjA4LS42NzhsLjc2Mi43NjIuOTMtLjkzLS45My0uODQ3Yy4zMzgtLjQyMy41MDctMS4wMTUuNjc3LTEuNjA4aDEuMzUzdi4wODR6bS03LjQ0Ni0uNTkyYzAtMS4yNyAxLjAxNi0yLjM3IDIuMzctMi4zNyAxLjI3IDAgMi4zNyAxLjAxNiAyLjM3IDIuMzcgMCAxLjI3LTEuMDE3IDIuMzctMi4zNyAyLjM3LTEuMzU0LS4wODYtMi4zNy0xLjEtMi4zNy0yLjM3eiIvPjxwYXRoIGZpbGw9IiMyMTIxMjEiIGQ9Ik0xMC4yMzggMTU1Ljc1NHYtMS4yN0g4Ljg4NWMtLjA4NS0uNTkyLS4zNC0xLjEtLjY3Ny0xLjYwN2wuNzYtLjc2Mi0uODQ1LS44NDYtLjg0Ni43NmMtLjQyMy0uMzM4LS45My0uNTkyLTEuNTIzLS42NzZWMTUwaC0xLjI3djEuMzU0Yy0uNTkyLjA4NC0xLjEuMzM4LTEuNjA3LjY3N2wtLjc2Mi0uNzYtLjg0Ni44NDUuNzYuNzYyYy0uMzM4LjUwOC0uNTkyIDEuMDE1LS42NzYgMS42MDhIMHYxLjI3aDEuMzU0Yy4wODQuNTkuMzM4IDEuMS42NzcgMS41MjJsLS43Ni44NDYuOTMuOTMuNzYyLS43NmMuNDIzLjMzOCAxLjAxNS41OTIgMS42MDcuNjc2djEuMzUzaDEuMjY4di0xLjM1NGMuNTkzLS4wODUgMS4xLS4zNCAxLjYwOC0uNjc4bC43NjIuNzYyLjkzLS45My0uOTMtLjg0N2MuMzM4LS40MjMuNTA3LTEuMDE1LjY3Ny0xLjYwOGgxLjM1M3YuMDg0em0tNy40NDYtLjU5MmMwLTEuMjcgMS4wMTYtMi4zNyAyLjM3LTIuMzcgMS4yNyAwIDIuMzcgMS4wMTYgMi4zNyAyLjM3IDAgMS4yNy0xLjAxNyAyLjM3LTIuMzcgMi4zNy0xLjM1NC0uMDg2LTIuMzctMS4xLTIuMzctMi4zN3oiLz48cGF0aCBmaWxsPSIjNTM1QzY5IiBkPSJNMTEuNTA2IDI0NC41Yy4xODQgMCAuMzYtLjA3NC40OS0uMjA1LjEzLS4xMy4yMDQtLjMwNy4yMDQtLjQ5di0xLjA0M2MwLS4zODMtLjMxLS42OTQtLjY5NC0uNjk0LS4zODMgMC0uNjk0LjMxLS42OTQuNjk0djEuMDQyYzAgLjE4NC4wNzMuMzYuMjAzLjQ5LjEzLjEzMi4zMDcuMjA1LjQ5LjIwNXptLTcgLjA3Yy40MDYgMCAuNzM1LS4zMy43MzUtLjczNXYtMS4xYzAtLjQwNi0uMzI4LS43MzUtLjczNC0uNzM1LS40MDYgMC0uNzM1LjMzLS43MzUuNzM1djEuMWMwIC40MDYuMzMuNzM1LjczNi43MzV6bTkuNjUyLTEuMDM3aC0xLjE1MnYuNWMwIC44MjgtLjY3IDEuNS0xLjUgMS41LS44MjggMC0xLjUtLjY3Mi0xLjUtMS41di0uNWgtNHYuNWMwIC44MjgtLjY3IDEuNS0xLjUgMS41LS44MjggMC0xLjUtLjY3Mi0xLjUtMS41di0uNUgxLjg1NGMtLjUxNyAwLTEuMDEyLjIxNC0xLjM2My41OTUtLjM1LjM4LS41MjYuODktLjQ4NCAxLjQwNXYxMGMwIC41NTIuNDQ4IDEgMSAxaDE0Yy41NTIgMCAxLS40NDggMS0xdi0xMGMuMDItMS4wNTQtLjc5NS0xLjkzNi0xLjg0OC0yem0tLjE1MiAxMWgtMTJ2LTdoMTJ2N3pNNS4zNCAyNTEuMzRjLS40MDIuMzQ3LS43NTcuNzQyLTEuMDYgMS4xNzctLjE3My4yODUtLjI4Mi42MDYtLjMyLjkzOGgzLjI5NnYtLjg3M0g1LjM5Yy4wNTQtLjA5My4xMTgtLjE4LjE5LS4yNi4wOC0uMDkuMjY4LS4yNy41NjUtLjU0My4yMi0uMTk0LjQyNi0uNDAzLjYxNS0uNjI3LjE1NS0uMTkuMjgyLS40LjM3Ny0uNjI2LjA4LS4yLjEyLS40MTUuMTItLjYzLjAwNy0uMzctLjE0NS0uNzI1LS40MTctLjk3NC0uMzE0LS4yNzUtLjcyMy0uNDE1LTEuMTQtLjM5LS4zOTQtLjAxNS0uNzguMTA0LTEuMS4zMzYtLjMyMi4yOC0uNTEyLjY4NS0uNTI1IDEuMTEzbC45My4wOTRjLS4wMDQtLjIxNC4wNjctLjQyMi4yLS41OS4yNjgtLjIzMi42NjQtLjIzNS45MzUtLjAwNy4xMi4xMy4xODIuMzA2LjE3LjQ4My0uMDA3LjIwNy0uMDc3LjQwOC0uMi41NzUtLjIzNC4yOS0uNDkyLjU2LS43Ny44MDh2LS4wMDV6bTQuNzA2IDIuMTE1aC45MXYtLjk4N2guNjF2LS44MjJoLS42MXYtMy4xMWgtLjc5TDguMDQgMjUxLjY1di44MjJoMi4wMDZ2Ljk4Ny0uMDA1em0tMS4xMjctMS44MTNsMS4xMjYtMS42NzZ2MS42OEg4Ljkydi0uMDA0eiIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMjc2KSI+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjkiIGZpbGw9IiM1RTY2NzQiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMTAuMTc0IDguOTczbDIuMjg0LTIuMjgzYy4xNjUtLjE2Ni4xNjUtLjQzNCAwLS42bC0uNi0uNmMtLjE2Ni0uMTY1LS40MzQtLjE2NS0uNiAwTDguOTc1IDcuNzcyIDYuNjkgNS40OWMtLjE2Ni0uMTY2LS40MzQtLjE2Ni0uNiAwbC0uNi42Yy0uMTY1LjE2NS0uMTY1LjQzMyAwIC42TDcuNzczIDguOTcgNS40OSAxMS4yNTVjLS4xNjUuMTY2LS4xNjUuNDM0IDAgLjZsLjYuNmMuMTY2LjE2NS40MzQuMTY1LjYgMGwyLjI4My0yLjI4MyAyLjI4MyAyLjI4M2MuMTY2LjE2NS40MzQuMTY1LjYgMGwuNi0uNmMuMTY1LS4xNjYuMTY1LS40MzQgMC0uNmwtMi4yODItMi4yODJ6Ii8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMzEyKSI+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjkiIGZpbGw9IiM1RTY2NzQiIG9wYWNpdHk9Ii41MDEiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMTAuMTc0IDguOTczbDIuMjg0LTIuMjgzYy4xNjUtLjE2Ni4xNjUtLjQzNCAwLS42bC0uNi0uNmMtLjE2Ni0uMTY1LS40MzQtLjE2NS0uNiAwTDguOTc1IDcuNzcyIDYuNjkgNS40OWMtLjE2Ni0uMTY2LS40MzQtLjE2Ni0uNiAwbC0uNi42Yy0uMTY1LjE2NS0uMTY1LjQzMyAwIC42TDcuNzczIDguOTcgNS40OSAxMS4yNTVjLS4xNjUuMTY2LS4xNjUuNDM0IDAgLjZsLjYuNmMuMTY2LjE2NS40MzQuMTY1LjYgMGwyLjI4My0yLjI4MyAyLjI4MyAyLjI4M2MuMTY2LjE2NS40MzQuMTY1LjYgMGwuNi0uNmMuMTY1LS4xNjYuMTY1LS40MzQgMC0uNmwtMi4yODItMi4yODJ6Ii8+PC9nPjxyZWN0IHdpZHRoPSIxMyIgaGVpZ2h0PSIxMyIgeD0iLjUiIHk9Ii41IiBmaWxsPSIjRkZGIiBzdHJva2U9IiNDNkNERDMiIHJ4PSIyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDM0NikiLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDM2OSkiPjxyZWN0IHdpZHRoPSIxMyIgaGVpZ2h0PSIxMyIgeD0iLjUiIHk9IjEuMTI1IiBmaWxsPSIjRkZGIiBzdHJva2U9IiMyNTlFQzYiIHJ4PSIyIi8+PHBhdGggZmlsbD0iIzI1OUVDNiIgZD0iTTcuNTMgOC40ODdsLTMuNzc1LTMuNi0xLjI1IDEuMzY4IDQuOTQgNS4wMS4wNzUtLjA3NC4yODYuMzM1IDguNjk0LTEwLjRMMTUuMDk0IDAgNy41MyA4LjQ4N3oiLz48L2c+PHBhdGggZmlsbD0iIzUzNUM2QSIgZD0iTTE2LjE3OCAyMjcuNDM4bC00LjQ4LTQuNDhjLjU5LS45MTcuOTM2LTIuMDE3LjkzNi0zLjE5OCAwLTMuMjgtMi42NjgtNS45NDctNS45NDctNS45NDctMy4yOCAwLTUuOTQ3IDIuNjY3LTUuOTQ3IDUuOTQ3IDAgMy4yOCAyLjY2OCA1Ljk0NyA1Ljk0NyA1Ljk0NyAxLjI4MyAwIDIuNDY1LS40MDcgMy40NDItMS4xbDQuNDQgNC40NGMuMjIyLjIyNC41Ny4yMjQuNzkyIDBsLjgzNS0uODM1Yy4yMDQtLjIwNC4yMDQtLjU1LS4wMi0uNzc0em0tMTQuNS03LjY1OGMwLTIuNzcgMi4yNC01LjAxIDUuMDEtNS4wMSAyLjc3IDAgNS4wMSAyLjI0IDUuMDEgNS4wMSAwIDIuNzctMi4yNCA1LjAxLTUuMDEgNS4wMS0yLjc3IDAtNS4wMS0yLjI0LTUuMDEtNS4wMXoiLz48L2c+PC9zdmc+') 0 -312px no-repeat;
    transition: opacity .3s;
    opacity: 0;
  }
  
  
  .main-ui-control-custom-value-delete-item:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: inline-block;
    width: 18px;
    height: 18px;
    background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIzODUiIHZpZXdCb3g9IjAgMCAxOCAzODUiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZmlsbD0iIzUzNUM2OSIgZD0iTTUuMDY1IDQuNjgyTDIuMzc3IDEuOTk0IDEuMDEgMy4zNjIgMy42OTYgNi4wNS45OSA4Ljc1N2wxLjM2OCAxLjM3IDIuNzA4LTIuNzEgMi43IDIuNzAzIDEuMzctMS4zNjhMNi40MzMgNi4wNWwyLjY4Mi0yLjY4Mkw3Ljc0OCAyIDUuMDY1IDQuNjgyeiIvPjxnIGZpbGw9IiM3MTdBODQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMjgpIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMiIgcng9IjEiLz48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMiIgeT0iNCIgcng9IjEiLz48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMiIgeT0iOCIgcng9IjEiLz48L2c+PHBhdGggZmlsbD0iIzUyNUM2OCIgZD0iTS42NjcgNjEuNDE1TDAgNjRsMi40NDQtLjc2NWMtLjE1Mi0uNDE3LS4zNzYtLjc5Ny0uNjYtMS4xMi0uMzE4LS4zMjUtLjctLjU2My0xLjExNy0uN3ptNS40MDctNS45NjNsLTQuNzggNS4yMTNjLjM5Ny4yMDguNzY1LjQ3NCAxLjA5NC43OTIuMjcuMzQzLjQ5Ni43MjUuNjcgMS4xMzVsNC43NzctNS4yMWMtLjE4NS0uNDQ3LS40MzctLjg1Ny0uNzQ2LTEuMjEzLS4yOTYtLjMwNi0uNjQtLjU0OC0xLjAxOC0uNzE1bC4wMDItLjAwM3ptMi43MzMtMS4wNTdjLS4yNDItLjI2LS41Ny0uNDAzLS45MS0uMzk1LS4zMzguMDA4LS42Ni4xNjUtLjg5Mi40MzVsLS4yODcuMzEzYy4zODIuMTc3LjczMi40MjggMS4wMzMuNzQuMzA0LjM0OC41NS43NS43MzIgMS4xODdsLjI4OC0uMzE0Yy4yNDgtLjI1Mi4zOS0uNjA0LjM5OC0uOTc0LjAwNi0uMzctLjEyNS0uNzI4LS4zNjQtLjk5aC4wMDN6Ii8+PHBhdGggZmlsbD0iIzIxMjEyMSIgZD0iTTYgODV2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6Ii8+PHBhdGggZmlsbD0iIzUzNUM2OCIgZD0iTTEwLjEzIDE4OS45ODhsLTIuNTctMi43NmMtLjE4Ni0uMTk4LS40NTQtLjI3NC0uNzA1LS4yLS4yNTIuMDcyLS40NDcuMjg0LS41MTQuNTUzLS4wNjUuMjcuMDA4LjU1OC4xOTIuNzU0bC41MjUuNTYyLTQuMTMgMy4yOTItLjUxNi0uNTU0Yy0uMjgzLS4zLS43NC0uMy0xLjAyNSAwLS4yODIuMzA4LS4yODIuOCAwIDEuMTA4bDEuNTczIDEuNjg1LTIuOTAyIDMuMzIzYy0uMDM2LjAzOC0uMDU2LjA5LS4wNTYuMTQzIDAgLjA1My4wMi4xMDUuMDU2LjE0Mi4wNzMuMDcuMTg1LjA3LjI1OCAwbDMuMTAyLTMuMTI1IDEuNTczIDEuNjg1Yy4xOC4yMDIuNDUuMjgzLjcwNC4yMS4yNTQtLjA3LjQ1Mi0uMjgyLjUxOC0uNTU0LjA2Ny0uMjctLjAwOC0uNTYtLjE5Ny0uNzU1bC0uNTE3LS41NTMgMy4wNzMtNC40MjQuNTMyLjU3Yy4yODUuMy43NDIuMyAxLjAyNyAwIC4xMzctLjE0NS4yMTUtLjM0My4yMTUtLjU1IDAtLjIwNy0uMDc4LS40MDUtLjIxNi0uNTV6Ii8+PHBhdGggZmlsbD0iIzUzNUM2OSIgZD0iTTEwLjIzOCAxMjAuNzU0di0xLjI3SDguODg1Yy0uMDg1LS41OTItLjM0LTEuMS0uNjc3LTEuNjA3bC43Ni0uNzYyLS44NDUtLjg0Ni0uODQ2Ljc2Yy0uNDIzLS4zMzgtLjkzLS41OTItMS41MjMtLjY3NlYxMTVoLTEuMjd2MS4zNTRjLS41OTIuMDg0LTEuMS4zMzgtMS42MDcuNjc3bC0uNzYyLS43Ni0uODQ2Ljg0NS43Ni43NjJjLS4zMzguNTA4LS41OTIgMS4wMTUtLjY3NiAxLjYwOEgwdjEuMjdoMS4zNTRjLjA4NC41OS4zMzggMS4xLjY3NyAxLjUyMmwtLjc2Ljg0Ni45My45My43NjItLjc2Yy40MjMuMzM4IDEuMDE1LjU5MiAxLjYwNy42NzZ2MS4zNTNoMS4yNjh2LTEuMzU0Yy41OTMtLjA4NSAxLjEtLjM0IDEuNjA4LS42NzhsLjc2Mi43NjIuOTMtLjkzLS45My0uODQ3Yy4zMzgtLjQyMy41MDctMS4wMTUuNjc3LTEuNjA4aDEuMzUzdi4wODR6bS03LjQ0Ni0uNTkyYzAtMS4yNyAxLjAxNi0yLjM3IDIuMzctMi4zNyAxLjI3IDAgMi4zNyAxLjAxNiAyLjM3IDIuMzcgMCAxLjI3LTEuMDE3IDIuMzctMi4zNyAyLjM3LTEuMzU0LS4wODYtMi4zNy0xLjEtMi4zNy0yLjM3eiIvPjxwYXRoIGZpbGw9IiMyMTIxMjEiIGQ9Ik0xMC4yMzggMTU1Ljc1NHYtMS4yN0g4Ljg4NWMtLjA4NS0uNTkyLS4zNC0xLjEtLjY3Ny0xLjYwN2wuNzYtLjc2Mi0uODQ1LS44NDYtLjg0Ni43NmMtLjQyMy0uMzM4LS45My0uNTkyLTEuNTIzLS42NzZWMTUwaC0xLjI3djEuMzU0Yy0uNTkyLjA4NC0xLjEuMzM4LTEuNjA3LjY3N2wtLjc2Mi0uNzYtLjg0Ni44NDUuNzYuNzYyYy0uMzM4LjUwOC0uNTkyIDEuMDE1LS42NzYgMS42MDhIMHYxLjI3aDEuMzU0Yy4wODQuNTkuMzM4IDEuMS42NzcgMS41MjJsLS43Ni44NDYuOTMuOTMuNzYyLS43NmMuNDIzLjMzOCAxLjAxNS41OTIgMS42MDcuNjc2djEuMzUzaDEuMjY4di0xLjM1NGMuNTkzLS4wODUgMS4xLS4zNCAxLjYwOC0uNjc4bC43NjIuNzYyLjkzLS45My0uOTMtLjg0N2MuMzM4LS40MjMuNTA3LTEuMDE1LjY3Ny0xLjYwOGgxLjM1M3YuMDg0em0tNy40NDYtLjU5MmMwLTEuMjcgMS4wMTYtMi4zNyAyLjM3LTIuMzcgMS4yNyAwIDIuMzcgMS4wMTYgMi4zNyAyLjM3IDAgMS4yNy0xLjAxNyAyLjM3LTIuMzcgMi4zNy0xLjM1NC0uMDg2LTIuMzctMS4xLTIuMzctMi4zN3oiLz48cGF0aCBmaWxsPSIjNTM1QzY5IiBkPSJNMTEuNTA2IDI0NC41Yy4xODQgMCAuMzYtLjA3NC40OS0uMjA1LjEzLS4xMy4yMDQtLjMwNy4yMDQtLjQ5di0xLjA0M2MwLS4zODMtLjMxLS42OTQtLjY5NC0uNjk0LS4zODMgMC0uNjk0LjMxLS42OTQuNjk0djEuMDQyYzAgLjE4NC4wNzMuMzYuMjAzLjQ5LjEzLjEzMi4zMDcuMjA1LjQ5LjIwNXptLTcgLjA3Yy40MDYgMCAuNzM1LS4zMy43MzUtLjczNXYtMS4xYzAtLjQwNi0uMzI4LS43MzUtLjczNC0uNzM1LS40MDYgMC0uNzM1LjMzLS43MzUuNzM1djEuMWMwIC40MDYuMzMuNzM1LjczNi43MzV6bTkuNjUyLTEuMDM3aC0xLjE1MnYuNWMwIC44MjgtLjY3IDEuNS0xLjUgMS41LS44MjggMC0xLjUtLjY3Mi0xLjUtMS41di0uNWgtNHYuNWMwIC44MjgtLjY3IDEuNS0xLjUgMS41LS44MjggMC0xLjUtLjY3Mi0xLjUtMS41di0uNUgxLjg1NGMtLjUxNyAwLTEuMDEyLjIxNC0xLjM2My41OTUtLjM1LjM4LS41MjYuODktLjQ4NCAxLjQwNXYxMGMwIC41NTIuNDQ4IDEgMSAxaDE0Yy41NTIgMCAxLS40NDggMS0xdi0xMGMuMDItMS4wNTQtLjc5NS0xLjkzNi0xLjg0OC0yem0tLjE1MiAxMWgtMTJ2LTdoMTJ2N3pNNS4zNCAyNTEuMzRjLS40MDIuMzQ3LS43NTcuNzQyLTEuMDYgMS4xNzctLjE3My4yODUtLjI4Mi42MDYtLjMyLjkzOGgzLjI5NnYtLjg3M0g1LjM5Yy4wNTQtLjA5My4xMTgtLjE4LjE5LS4yNi4wOC0uMDkuMjY4LS4yNy41NjUtLjU0My4yMi0uMTk0LjQyNi0uNDAzLjYxNS0uNjI3LjE1NS0uMTkuMjgyLS40LjM3Ny0uNjI2LjA4LS4yLjEyLS40MTUuMTItLjYzLjAwNy0uMzctLjE0NS0uNzI1LS40MTctLjk3NC0uMzE0LS4yNzUtLjcyMy0uNDE1LTEuMTQtLjM5LS4zOTQtLjAxNS0uNzguMTA0LTEuMS4zMzYtLjMyMi4yOC0uNTEyLjY4NS0uNTI1IDEuMTEzbC45My4wOTRjLS4wMDQtLjIxNC4wNjctLjQyMi4yLS41OS4yNjgtLjIzMi42NjQtLjIzNS45MzUtLjAwNy4xMi4xMy4xODIuMzA2LjE3LjQ4My0uMDA3LjIwNy0uMDc3LjQwOC0uMi41NzUtLjIzNC4yOS0uNDkyLjU2LS43Ny44MDh2LS4wMDV6bTQuNzA2IDIuMTE1aC45MXYtLjk4N2guNjF2LS44MjJoLS42MXYtMy4xMWgtLjc5TDguMDQgMjUxLjY1di44MjJoMi4wMDZ2Ljk4Ny0uMDA1em0tMS4xMjctMS44MTNsMS4xMjYtMS42NzZ2MS42OEg4Ljkydi0uMDA0eiIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMjc2KSI+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjkiIGZpbGw9IiM1RTY2NzQiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMTAuMTc0IDguOTczbDIuMjg0LTIuMjgzYy4xNjUtLjE2Ni4xNjUtLjQzNCAwLS42bC0uNi0uNmMtLjE2Ni0uMTY1LS40MzQtLjE2NS0uNiAwTDguOTc1IDcuNzcyIDYuNjkgNS40OWMtLjE2Ni0uMTY2LS40MzQtLjE2Ni0uNiAwbC0uNi42Yy0uMTY1LjE2NS0uMTY1LjQzMyAwIC42TDcuNzczIDguOTcgNS40OSAxMS4yNTVjLS4xNjUuMTY2LS4xNjUuNDM0IDAgLjZsLjYuNmMuMTY2LjE2NS40MzQuMTY1LjYgMGwyLjI4My0yLjI4MyAyLjI4MyAyLjI4M2MuMTY2LjE2NS40MzQuMTY1LjYgMGwuNi0uNmMuMTY1LS4xNjYuMTY1LS40MzQgMC0uNmwtMi4yODItMi4yODJ6Ii8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMzEyKSI+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjkiIGZpbGw9IiM1RTY2NzQiIG9wYWNpdHk9Ii41MDEiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMTAuMTc0IDguOTczbDIuMjg0LTIuMjgzYy4xNjUtLjE2Ni4xNjUtLjQzNCAwLS42bC0uNi0uNmMtLjE2Ni0uMTY1LS40MzQtLjE2NS0uNiAwTDguOTc1IDcuNzcyIDYuNjkgNS40OWMtLjE2Ni0uMTY2LS40MzQtLjE2Ni0uNiAwbC0uNi42Yy0uMTY1LjE2NS0uMTY1LjQzMyAwIC42TDcuNzczIDguOTcgNS40OSAxMS4yNTVjLS4xNjUuMTY2LS4xNjUuNDM0IDAgLjZsLjYuNmMuMTY2LjE2NS40MzQuMTY1LjYgMGwyLjI4My0yLjI4MyAyLjI4MyAyLjI4M2MuMTY2LjE2NS40MzQuMTY1LjYgMGwuNi0uNmMuMTY1LS4xNjYuMTY1LS40MzQgMC0uNmwtMi4yODItMi4yODJ6Ii8+PC9nPjxyZWN0IHdpZHRoPSIxMyIgaGVpZ2h0PSIxMyIgeD0iLjUiIHk9Ii41IiBmaWxsPSIjRkZGIiBzdHJva2U9IiNDNkNERDMiIHJ4PSIyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDM0NikiLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDM2OSkiPjxyZWN0IHdpZHRoPSIxMyIgaGVpZ2h0PSIxMyIgeD0iLjUiIHk9IjEuMTI1IiBmaWxsPSIjRkZGIiBzdHJva2U9IiMyNTlFQzYiIHJ4PSIyIi8+PHBhdGggZmlsbD0iIzI1OUVDNiIgZD0iTTcuNTMgOC40ODdsLTMuNzc1LTMuNi0xLjI1IDEuMzY4IDQuOTQgNS4wMS4wNzUtLjA3NC4yODYuMzM1IDguNjk0LTEwLjRMMTUuMDk0IDAgNy41MyA4LjQ4N3oiLz48L2c+PHBhdGggZmlsbD0iIzUzNUM2QSIgZD0iTTE2LjE3OCAyMjcuNDM4bC00LjQ4LTQuNDhjLjU5LS45MTcuOTM2LTIuMDE3LjkzNi0zLjE5OCAwLTMuMjgtMi42NjgtNS45NDctNS45NDctNS45NDctMy4yOCAwLTUuOTQ3IDIuNjY3LTUuOTQ3IDUuOTQ3IDAgMy4yOCAyLjY2OCA1Ljk0NyA1Ljk0NyA1Ljk0NyAxLjI4MyAwIDIuNDY1LS40MDcgMy40NDItMS4xbDQuNDQgNC40NGMuMjIyLjIyNC41Ny4yMjQuNzkyIDBsLjgzNS0uODM1Yy4yMDQtLjIwNC4yMDQtLjU1LS4wMi0uNzc0em0tMTQuNS03LjY1OGMwLTIuNzcgMi4yNC01LjAxIDUuMDEtNS4wMSAyLjc3IDAgNS4wMSAyLjI0IDUuMDEgNS4wMSAwIDIuNzctMi4yNCA1LjAxLTUuMDEgNS4wMS0yLjc3IDAtNS4wMS0yLjI0LTUuMDEtNS4wMXoiLz48L2c+PC9zdmc+') 0 -276px no-repeat;
    -webkit-transition: opacity .3s;
    transition: opacity .3s;
    opacity: 0;
  }
  
  .main-ui-control-custom.main-ui-disable{
    background-color: var(--ui-field-color-disabled);
    cursor: not-allowed;
  }
  
  .main-ui-control-custom.main-ui-disable .main-ui-control-input{
    color: #808081;
    cursor: not-allowed;
  }
  
  .main-ui-control:hover .main-ui-control-custom-value-delete-item,
  .main-ui-control-field:hover .main-ui-control-custom-value-delete-item {
    opacity: 1;
  }
  
  .main-ui-control-custom-value-delete:hover .main-ui-control-custom-value-delete-item:after {
    opacity: 1;
  }
  
  .bx-calendar * {
    box-sizing: content-box;
  }
  
  span.date-interval-hellip {
    width: 20px;
    display: inline-block;
    text-align: center;
  }
  
  img.calendar-icon {
    vertical-align: top;
    cursor: pointer;
    width: 17px;
    height: 18px;
    margin: 0 0 0 1px;
    box-sizing: content-box;
    border: 1px solid transparent;
    position: relative;
  }
  
  img.calendar-icon-hover {
    margin: 0;
    margin-left: 1px;
    border: 1px solid #aeb6c2;
    background-color: #dbe3f2;
  }
  
  .bx-calendar {
    font-family: var(--ui-font-family-primary, var(--ui-font-family-helvetica));
    color: #000;
    width: 200px;
    user-select: none;
  }
  .bx-calendar-header {
    margin-top: -2px;
    padding-bottom: 5px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 10px;
  }
  .bx-calendar-left-arrow,
  .bx-calendar-right-arrow {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAEnCAYAAAB7QGniAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjMxQUEzMjZDOUY2NDExRTFBODg5ODVBNzA3Njg3MUEwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjMxQUEzMjZEOUY2NDExRTFBODg5ODVBNzA3Njg3MUEwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MzFBQTMyNkE5RjY0MTFFMUE4ODk4NUE3MDc2ODcxQTAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MzFBQTMyNkI5RjY0MTFFMUE4ODk4NUE3MDc2ODcxQTAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4kAY3TAAAER0lEQVR42uyZSUslMRDHq9sWXFG8iDu4XTyoDAgevCv4voTfYL6OoB4Ujx58gnjyJiJuoILgvu/7hmsm//iSST+7J8F5MzxnOiBJVf1etqqudEeHMUYo29vbbHd3ly4vL6mwsJDKy8upsrLSgc0BNDU1xTIyMqiuro5yc3Pp7u6OVlZW6PX1lVpaWhza2NhgMzMzjCvE39jYmGrPz88z2N3NzU2qr6+noFJTU0Owew8PD5Sdna0Mz8/PNDo6Ktrt7e0EuwcAjZycHGHo6OhQP7i/vxcdOGtra+zq6ooaGxs/DLewsED5+fnvq5ucnGRZWVlUXV1NeXl5dHt7S+vr62KE1tZWx5H7tLW19WGfqqqqfu6TqXxZiFiiYFMHBgbQJNSQZUFPLB6PU0FBAZWVlcGpwgt7e3sET8RiMXK4l9nq6io1NTUJP3EfOtxnDLvNQ4Vqa2vJnZiYwM6KYHNdV0wBNWToYXfhhuLi4sD5Qg+7i/jJzMwMhKCH3UusMHnFPllBb29vSokHQM4tFJJtx3F+QlAClMNABiBhX0/JkK+nMMg3p5eXF7FUCaEte/H1pM8puXbJoqQQwrhIO/qSZRt62F0sE6vTVyNB6GF38VifnZ359gU1ZOhhd9va2gihGhQJ0MPuIjzxi+XlZZEoUFBDhh52jCueCK5kfX194mlBDRkF9n87YfyBrFJUVIRTiSoqKpydnR3GTy06Pz8XWQVnBxsfH2fcFeLQQU+oIUMPu8gqSPJBWQV6lVVKSkoC5wv957MKgs2YVTzP+1pZ5enpSUFop3tW8fSsorvmc1nl5OTkXdDiCX/Qq6yCUJUbKHuBDL3KKsfHx7S4uEjX19cCQg0Z+iirvEPd3d1GyuFvEl8TwmuQEbq5uTFD/G3LDF1cXJghfqaZIR7sZmh/f98M8XM27SCriacOOjw8NENHR0dGyBsaGkq7h5NZdJWWEM/XZoif+2bo8fExRQmDf4enKGFYPeanp6dpB1lNPHUQf/tLTfb1BgcH//PX/z8AyQRbWlrqBELJGTgZDD0RdDDa8VRC1jtu9J11FERu+Ztf+dPT07gCZHqBDL38MHTxaX1wcADfSR8KWf8UFwe1bpA1d7Sw+05zHUwAfsjUkxfUA+REbNmvLoqC9IzM/v5+Njs7y/QrCsjQq8hsaGigpaUlmpubE12ihgy9Os2bm5sRM8IgawAJvX9Oeg86oO4wdEAfWg0X0IMaWvVos7ooCv6DO1b1xz8Iv+uyupbTAf6bb6GQBEIhHQiDrO7p7IaznrhpC6JQiSCi0PBIvsT+ZgJJhu2vQNKflDDQ7mmxHs44cZstiEIlgjg0PDz8gYrFYh+/yuLxOAsDfKcUeoyCLoL+UUhRIyMjou7s7PQxni7hv5GfvbB20h767S2I4umLQ729vaLR1dUVfE8nAVmSQaenpydwPB2MdtwSst5Mo1usHWwqPwQYAL68iqBHZNxhAAAAAElFTkSuQmCC)
      no-repeat;
    border-radius: 4px;
    display: inline-block;
    font-size: 1px;
    height: 28px;
    vertical-align: top;
    width: 19px;
    cursor: pointer;
  }
  .bx-calendar-left-arrow:hover,
  .bx-calendar-right-arrow:hover {
    background-color: #ededed;
  }
  .bx-calendar-left-arrow {
    background-position: 7px -183px;
    margin-left: -3px;
    vertical-align: top;
  }
  .bx-calendar-right-arrow {
    background-position: 8px -205px;
  }
  .bx-calendar-header-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: nowrap;
    text-align: center;
    width: 165px;
  }
  .bx-calendar-top-month,
  .bx-calendar-top-year {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAEnCAYAAAB7QGniAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjMxQUEzMjZDOUY2NDExRTFBODg5ODVBNzA3Njg3MUEwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjMxQUEzMjZEOUY2NDExRTFBODg5ODVBNzA3Njg3MUEwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MzFBQTMyNkE5RjY0MTFFMUE4ODk4NUE3MDc2ODcxQTAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MzFBQTMyNkI5RjY0MTFFMUE4ODk4NUE3MDc2ODcxQTAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4kAY3TAAAER0lEQVR42uyZSUslMRDHq9sWXFG8iDu4XTyoDAgevCv4voTfYL6OoB4Ujx58gnjyJiJuoILgvu/7hmsm//iSST+7J8F5MzxnOiBJVf1etqqudEeHMUYo29vbbHd3ly4vL6mwsJDKy8upsrLSgc0BNDU1xTIyMqiuro5yc3Pp7u6OVlZW6PX1lVpaWhza2NhgMzMzjCvE39jYmGrPz88z2N3NzU2qr6+noFJTU0Owew8PD5Sdna0Mz8/PNDo6Ktrt7e0EuwcAjZycHGHo6OhQP7i/vxcdOGtra+zq6ooaGxs/DLewsED5+fnvq5ucnGRZWVlUXV1NeXl5dHt7S+vr62KE1tZWx5H7tLW19WGfqqqqfu6TqXxZiFiiYFMHBgbQJNSQZUFPLB6PU0FBAZWVlcGpwgt7e3sET8RiMXK4l9nq6io1NTUJP3EfOtxnDLvNQ4Vqa2vJnZiYwM6KYHNdV0wBNWToYXfhhuLi4sD5Qg+7i/jJzMwMhKCH3UusMHnFPllBb29vSokHQM4tFJJtx3F+QlAClMNABiBhX0/JkK+nMMg3p5eXF7FUCaEte/H1pM8puXbJoqQQwrhIO/qSZRt62F0sE6vTVyNB6GF38VifnZ359gU1ZOhhd9va2gihGhQJ0MPuIjzxi+XlZZEoUFBDhh52jCueCK5kfX194mlBDRkF9n87YfyBrFJUVIRTiSoqKpydnR3GTy06Pz8XWQVnBxsfH2fcFeLQQU+oIUMPu8gqSPJBWQV6lVVKSkoC5wv957MKgs2YVTzP+1pZ5enpSUFop3tW8fSsorvmc1nl5OTkXdDiCX/Qq6yCUJUbKHuBDL3KKsfHx7S4uEjX19cCQg0Z+iirvEPd3d1GyuFvEl8TwmuQEbq5uTFD/G3LDF1cXJghfqaZIR7sZmh/f98M8XM27SCriacOOjw8NENHR0dGyBsaGkq7h5NZdJWWEM/XZoif+2bo8fExRQmDf4enKGFYPeanp6dpB1lNPHUQf/tLTfb1BgcH//PX/z8AyQRbWlrqBELJGTgZDD0RdDDa8VRC1jtu9J11FERu+Ztf+dPT07gCZHqBDL38MHTxaX1wcADfSR8KWf8UFwe1bpA1d7Sw+05zHUwAfsjUkxfUA+REbNmvLoqC9IzM/v5+Njs7y/QrCsjQq8hsaGigpaUlmpubE12ihgy9Os2bm5sRM8IgawAJvX9Oeg86oO4wdEAfWg0X0IMaWvVos7ooCv6DO1b1xz8Iv+uyupbTAf6bb6GQBEIhHQiDrO7p7IaznrhpC6JQiSCi0PBIvsT+ZgJJhu2vQNKflDDQ7mmxHs44cZstiEIlgjg0PDz8gYrFYh+/yuLxOAsDfKcUeoyCLoL+UUhRIyMjou7s7PQxni7hv5GfvbB20h767S2I4umLQ729vaLR1dUVfE8nAVmSQaenpydwPB2MdtwSst5Mo1usHWwqPwQYAL68iqBHZNxhAAAAAElFTkSuQmCC)
      no-repeat right -223px;
    color: #000 !important;
    border-radius: 3px;
    cursor: pointer;
    display: inline-block;
    font-size: 16px;
    line-height: 20px;
    text-decoration: none !important;
    margin: 0 1px;
    padding: 5px 15px 3px 7px;
  }
  .bx-calendar-top-month:hover,
  .bx-calendar-top-year:hover {
    background-color: #ededed;
    text-decoration: none;
  }
  
  .bx-calendar-cell-block {
    overflow: hidden;
    position: relative;
    padding-bottom: 5px;
  }
  
  .bx-calendar-cell {
    display: inline-block;
    font-size: 12px;
    line-height: 15px;
    height: 19px;
    margin: 0 3px 0 2px;
    padding-top: 4px;
    text-align: center;
    text-decoration: none;
    vertical-align: top;
    width: 23px;
    cursor: pointer;
  }
  .bx-calendar-cell {
    line-height: 16px\9;
  }
  .bx-calendar-cell,
  .bx-calendar-cell:link,
  .bx-calendar-cell:active,
  .bx-calendar-cell:visited {
    color: #000;
  }
  .bx-calendar-cell:hover {
    background-color: #eee;
    color: #000;
    text-decoration: none;
  }
  .bx-calendar-name-day {
    display: inline-block;
    color: #a9a9a9;
    font-size: 10px;
    height: 13px;
    margin: 0 3px 0 2px;
    padding-top: 0;
    text-align: center;
    vertical-align: top;
    width: 23px;
  }
  .bx-calendar-range {
    border-bottom: 1px solid #f3f2ed;
    margin: 0 -5px 0 -7px;
    padding: 1px 7px 1px 8px;
    position: relative;
    z-index: 5;
  }
  .bx-calendar-weekend,
  .bx-calendar-weekend:link,
  .bx-calendar-weekend:active,
  .bx-calendar-weekend:visited {
    color: #d25050;
  }
  .bx-calendar-weekend:hover {
    color: #d25050;
  }
  .bx-calendar-date-hidden,
  .bx-calendar-date-hidden:link,
  .bx-calendar-date-hidden:active,
  .bx-calendar-date-hidden:visited {
    color: #ccc;
  }
  .bx-calendar-active {
    background-color: #dce3ea;
  }
  .bx-calendar-active:hover {
    background-color: #dce3ea;
  }
  .bx-calendar-name-day-wrap {
    background-color: #eee;
    height: 12px;
    line-height: 12px;
    padding: 1px 7px 0 8px;
    position: relative;
    margin: 0 -5px 3px -7px;
    z-index: 5;
  }
  .bx-calendar-range-noline {
    border: none;
  }
  
  .bx-calendar-set-time-wrap {
    border-top: 1px solid #f2f2f2;
    border-bottom: 1px solid #f2f2f2;
    margin: -5px 3px 0 0;
    position: relative;
    text-decoration: none;
  }
  .bx-calendar-set-time {
    cursor: pointer;
    font-size: 11px;
    color: #b2b2b2 !important;
    display: block;
    height: 14px;
    margin-right: 3px;
    text-align: center;
    padding: 1px 0 0;
    text-decoration: none;
  }
  .bx-calendar-set-time:hover {
    color: #8c8c8c !important;
    text-decoration: none !important;
  }
  
  .bx-calendar-set-time-opened .bx-calendar-set-time {
    display: none;
  }
  .bx-calendar-set-time-opened .bx-calendar-form-block {
    display: block;
  }
  
  .bx-calendar-buttons-disabled {
    display: none;
  }
  .bx-calendar-set-time-wrap-simple {
    border-bottom: none;
  }
  
  .bx-calendar-set-time {
    cursor: pointer;
    font-size: 11px;
    color: #b2b2b2;
    height: 14px;
    margin-right: 3px;
    text-align: center;
    padding: 1px 0 0;
  }
  .bx-calendar-set-time i {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAEnCAYAAAB7QGniAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjMxQUEzMjZDOUY2NDExRTFBODg5ODVBNzA3Njg3MUEwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjMxQUEzMjZEOUY2NDExRTFBODg5ODVBNzA3Njg3MUEwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MzFBQTMyNkE5RjY0MTFFMUE4ODk4NUE3MDc2ODcxQTAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MzFBQTMyNkI5RjY0MTFFMUE4ODk4NUE3MDc2ODcxQTAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4kAY3TAAAER0lEQVR42uyZSUslMRDHq9sWXFG8iDu4XTyoDAgevCv4voTfYL6OoB4Ujx58gnjyJiJuoILgvu/7hmsm//iSST+7J8F5MzxnOiBJVf1etqqudEeHMUYo29vbbHd3ly4vL6mwsJDKy8upsrLSgc0BNDU1xTIyMqiuro5yc3Pp7u6OVlZW6PX1lVpaWhza2NhgMzMzjCvE39jYmGrPz88z2N3NzU2qr6+noFJTU0Owew8PD5Sdna0Mz8/PNDo6Ktrt7e0EuwcAjZycHGHo6OhQP7i/vxcdOGtra+zq6ooaGxs/DLewsED5+fnvq5ucnGRZWVlUXV1NeXl5dHt7S+vr62KE1tZWx5H7tLW19WGfqqqqfu6TqXxZiFiiYFMHBgbQJNSQZUFPLB6PU0FBAZWVlcGpwgt7e3sET8RiMXK4l9nq6io1NTUJP3EfOtxnDLvNQ4Vqa2vJnZiYwM6KYHNdV0wBNWToYXfhhuLi4sD5Qg+7i/jJzMwMhKCH3UusMHnFPllBb29vSokHQM4tFJJtx3F+QlAClMNABiBhX0/JkK+nMMg3p5eXF7FUCaEte/H1pM8puXbJoqQQwrhIO/qSZRt62F0sE6vTVyNB6GF38VifnZ359gU1ZOhhd9va2gihGhQJ0MPuIjzxi+XlZZEoUFBDhh52jCueCK5kfX194mlBDRkF9n87YfyBrFJUVIRTiSoqKpydnR3GTy06Pz8XWQVnBxsfH2fcFeLQQU+oIUMPu8gqSPJBWQV6lVVKSkoC5wv957MKgs2YVTzP+1pZ5enpSUFop3tW8fSsorvmc1nl5OTkXdDiCX/Qq6yCUJUbKHuBDL3KKsfHx7S4uEjX19cCQg0Z+iirvEPd3d1GyuFvEl8TwmuQEbq5uTFD/G3LDF1cXJghfqaZIR7sZmh/f98M8XM27SCriacOOjw8NENHR0dGyBsaGkq7h5NZdJWWEM/XZoif+2bo8fExRQmDf4enKGFYPeanp6dpB1lNPHUQf/tLTfb1BgcH//PX/z8AyQRbWlrqBELJGTgZDD0RdDDa8VRC1jtu9J11FERu+Ztf+dPT07gCZHqBDL38MHTxaX1wcADfSR8KWf8UFwe1bpA1d7Sw+05zHUwAfsjUkxfUA+REbNmvLoqC9IzM/v5+Njs7y/QrCsjQq8hsaGigpaUlmpubE12ihgy9Os2bm5sRM8IgawAJvX9Oeg86oO4wdEAfWg0X0IMaWvVos7ooCv6DO1b1xz8Iv+uyupbTAf6bb6GQBEIhHQiDrO7p7IaznrhpC6JQiSCi0PBIvsT+ZgJJhu2vQNKflDDQ7mmxHs44cZstiEIlgjg0PDz8gYrFYh+/yuLxOAsDfKcUeoyCLoL+UUhRIyMjou7s7PQxni7hv5GfvbB20h767S2I4umLQ729vaLR1dUVfE8nAVmSQaenpydwPB2MdtwSst5Mo1usHWwqPwQYAL68iqBHZNxhAAAAAElFTkSuQmCC)
      no-repeat 0 0;
    height: 9px;
    display: inline-block;
    margin: 2px 3px 0 0;
    vertical-align: top;
    width: 9px;
  }
  
  .bx-calendar-button-block {
    padding: 9px 0 8px;
    text-align: center;
  }
  .bx-calendar-button {
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    vertical-align: top;
  }
  .bx-calendar-button-select {
    margin-right: 8px;
    text-align: right;
  }
  .bx-calendar-button-left,
  .bx-calendar-button-right {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAEnCAYAAAB7QGniAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjMxQUEzMjZDOUY2NDExRTFBODg5ODVBNzA3Njg3MUEwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjMxQUEzMjZEOUY2NDExRTFBODg5ODVBNzA3Njg3MUEwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MzFBQTMyNkE5RjY0MTFFMUE4ODk4NUE3MDc2ODcxQTAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MzFBQTMyNkI5RjY0MTFFMUE4ODk4NUE3MDc2ODcxQTAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4kAY3TAAAER0lEQVR42uyZSUslMRDHq9sWXFG8iDu4XTyoDAgevCv4voTfYL6OoB4Ujx58gnjyJiJuoILgvu/7hmsm//iSST+7J8F5MzxnOiBJVf1etqqudEeHMUYo29vbbHd3ly4vL6mwsJDKy8upsrLSgc0BNDU1xTIyMqiuro5yc3Pp7u6OVlZW6PX1lVpaWhza2NhgMzMzjCvE39jYmGrPz88z2N3NzU2qr6+noFJTU0Owew8PD5Sdna0Mz8/PNDo6Ktrt7e0EuwcAjZycHGHo6OhQP7i/vxcdOGtra+zq6ooaGxs/DLewsED5+fnvq5ucnGRZWVlUXV1NeXl5dHt7S+vr62KE1tZWx5H7tLW19WGfqqqqfu6TqXxZiFiiYFMHBgbQJNSQZUFPLB6PU0FBAZWVlcGpwgt7e3sET8RiMXK4l9nq6io1NTUJP3EfOtxnDLvNQ4Vqa2vJnZiYwM6KYHNdV0wBNWToYXfhhuLi4sD5Qg+7i/jJzMwMhKCH3UusMHnFPllBb29vSokHQM4tFJJtx3F+QlAClMNABiBhX0/JkK+nMMg3p5eXF7FUCaEte/H1pM8puXbJoqQQwrhIO/qSZRt62F0sE6vTVyNB6GF38VifnZ359gU1ZOhhd9va2gihGhQJ0MPuIjzxi+XlZZEoUFBDhh52jCueCK5kfX194mlBDRkF9n87YfyBrFJUVIRTiSoqKpydnR3GTy06Pz8XWQVnBxsfH2fcFeLQQU+oIUMPu8gqSPJBWQV6lVVKSkoC5wv957MKgs2YVTzP+1pZ5enpSUFop3tW8fSsorvmc1nl5OTkXdDiCX/Qq6yCUJUbKHuBDL3KKsfHx7S4uEjX19cCQg0Z+iirvEPd3d1GyuFvEl8TwmuQEbq5uTFD/G3LDF1cXJghfqaZIR7sZmh/f98M8XM27SCriacOOjw8NENHR0dGyBsaGkq7h5NZdJWWEM/XZoif+2bo8fExRQmDf4enKGFYPeanp6dpB1lNPHUQf/tLTfb1BgcH//PX/z8AyQRbWlrqBELJGTgZDD0RdDDa8VRC1jtu9J11FERu+Ztf+dPT07gCZHqBDL38MHTxaX1wcADfSR8KWf8UFwe1bpA1d7Sw+05zHUwAfsjUkxfUA+REbNmvLoqC9IzM/v5+Njs7y/QrCsjQq8hsaGigpaUlmpubE12ihgy9Os2bm5sRM8IgawAJvX9Oeg86oO4wdEAfWg0X0IMaWvVos7ooCv6DO1b1xz8Iv+uyupbTAf6bb6GQBEIhHQiDrO7p7IaznrhpC6JQiSCi0PBIvsT+ZgJJhu2vQNKflDDQ7mmxHs44cZstiEIlgjg0PDz8gYrFYh+/yuLxOAsDfKcUeoyCLoL+UUhRIyMjou7s7PQxni7hv5GfvbB20h767S2I4umLQ729vaLR1dUVfE8nAVmSQaenpydwPB2MdtwSst5Mo1usHWwqPwQYAL68iqBHZNxhAAAAAElFTkSuQmCC)
      no-repeat;
    display: inline-block;
    vertical-align: top;
    height: 23px;
    width: 4px;
  }
  .bx-calendar-button-text {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAEnCAYAAAB7QGniAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjMxQUEzMjZDOUY2NDExRTFBODg5ODVBNzA3Njg3MUEwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjMxQUEzMjZEOUY2NDExRTFBODg5ODVBNzA3Njg3MUEwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MzFBQTMyNkE5RjY0MTFFMUE4ODk4NUE3MDc2ODcxQTAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MzFBQTMyNkI5RjY0MTFFMUE4ODk4NUE3MDc2ODcxQTAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4kAY3TAAAER0lEQVR42uyZSUslMRDHq9sWXFG8iDu4XTyoDAgevCv4voTfYL6OoB4Ujx58gnjyJiJuoILgvu/7hmsm//iSST+7J8F5MzxnOiBJVf1etqqudEeHMUYo29vbbHd3ly4vL6mwsJDKy8upsrLSgc0BNDU1xTIyMqiuro5yc3Pp7u6OVlZW6PX1lVpaWhza2NhgMzMzjCvE39jYmGrPz88z2N3NzU2qr6+noFJTU0Owew8PD5Sdna0Mz8/PNDo6Ktrt7e0EuwcAjZycHGHo6OhQP7i/vxcdOGtra+zq6ooaGxs/DLewsED5+fnvq5ucnGRZWVlUXV1NeXl5dHt7S+vr62KE1tZWx5H7tLW19WGfqqqqfu6TqXxZiFiiYFMHBgbQJNSQZUFPLB6PU0FBAZWVlcGpwgt7e3sET8RiMXK4l9nq6io1NTUJP3EfOtxnDLvNQ4Vqa2vJnZiYwM6KYHNdV0wBNWToYXfhhuLi4sD5Qg+7i/jJzMwMhKCH3UusMHnFPllBb29vSokHQM4tFJJtx3F+QlAClMNABiBhX0/JkK+nMMg3p5eXF7FUCaEte/H1pM8puXbJoqQQwrhIO/qSZRt62F0sE6vTVyNB6GF38VifnZ359gU1ZOhhd9va2gihGhQJ0MPuIjzxi+XlZZEoUFBDhh52jCueCK5kfX194mlBDRkF9n87YfyBrFJUVIRTiSoqKpydnR3GTy06Pz8XWQVnBxsfH2fcFeLQQU+oIUMPu8gqSPJBWQV6lVVKSkoC5wv957MKgs2YVTzP+1pZ5enpSUFop3tW8fSsorvmc1nl5OTkXdDiCX/Qq6yCUJUbKHuBDL3KKsfHx7S4uEjX19cCQg0Z+iirvEPd3d1GyuFvEl8TwmuQEbq5uTFD/G3LDF1cXJghfqaZIR7sZmh/f98M8XM27SCriacOOjw8NENHR0dGyBsaGkq7h5NZdJWWEM/XZoif+2bo8fExRQmDf4enKGFYPeanp6dpB1lNPHUQf/tLTfb1BgcH//PX/z8AyQRbWlrqBELJGTgZDD0RdDDa8VRC1jtu9J11FERu+Ztf+dPT07gCZHqBDL38MHTxaX1wcADfSR8KWf8UFwe1bpA1d7Sw+05zHUwAfsjUkxfUA+REbNmvLoqC9IzM/v5+Njs7y/QrCsjQq8hsaGigpaUlmpubE12ihgy9Os2bm5sRM8IgawAJvX9Oeg86oO4wdEAfWg0X0IMaWvVos7ooCv6DO1b1xz8Iv+uyupbTAf6bb6GQBEIhHQiDrO7p7IaznrhpC6JQiSCi0PBIvsT+ZgJJhu2vQNKflDDQ7mmxHs44cZstiEIlgjg0PDz8gYrFYh+/yuLxOAsDfKcUeoyCLoL+UUhRIyMjou7s7PQxni7hv5GfvbB20h767S2I4umLQ729vaLR1dUVfE8nAVmSQaenpydwPB2MdtwSst5Mo1usHWwqPwQYAL68iqBHZNxhAAAAAElFTkSuQmCC)
      repeat-x 0 -99px;
    color: #000;
    display: inline-block;
    height: 19px;
    font-size: 12px;
    line-height: 16px;
    vertical-align: top;
    padding: 4px 10px 0;
  }
  .bx-calendar-button-left {
    background-position: 0 -45px;
  }
  .bx-calendar-button-right {
    background-position: -5px -45px;
  }
  .bx-calendar-button:hover .bx-calendar-button-left {
    background-position: 0 -15px;
  }
  .bx-calendar-button:hover .bx-calendar-button-right {
    background-position: -5px -15px;
  }
  .bx-calendar-button:hover .bx-calendar-button-text {
    background-position: 0 -74px;
  }
  .bx-calendar-button:active .bx-calendar-button-text {
    background-position: 0 -74px;
  }
  
  .bx-calendar-form-block {
    display: none;
  }
  .bx-calendar-form-text {
    display: inline-block;
    color: #a6a6a6;
    font-size: 11px;
    margin-top: 10px;
    padding: 0 0 0 5px;
    vertical-align: top;
    width: 38px;
  }
  .bx-calendar-form {
    display: inline-block;
    vertical-align: top;
  }
  .bx-calendar-form-arrow-l,
  .bx-calendar-form-arrow-r {
    display: inline-block;
    vertical-align: top;
  }
  .bx-calendar-form-arrow-l {
    margin-left: 2px;
  }
  .bx-calendar-form-arrow-top,
  .bx-calendar-form-arrow-bottom {
    display: block;
    height: 17px;
    width: 15px;
  }
  .bx-calendar-form-arrow-top {
    padding-top: 4px;
    height: 14px;
  }
  .bx-calendar-form-arrow-l .bx-calendar-form-arrow-top,
  .bx-calendar-form-arrow-l .bx-calendar-form-arrow-bottom {
    padding-left: 5px;
  }
  .bx-calendar-form-arrow-r .bx-calendar-form-arrow-top,
  .bx-calendar-form-arrow-r .bx-calendar-form-arrow-bottom {
    padding-left: 1px;
    padding-right: 5px;
  }
  .bx-calendar-form-arrow-top i,
  .bx-calendar-form-arrow-bottom i {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAEnCAYAAAB7QGniAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjMxQUEzMjZDOUY2NDExRTFBODg5ODVBNzA3Njg3MUEwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjMxQUEzMjZEOUY2NDExRTFBODg5ODVBNzA3Njg3MUEwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MzFBQTMyNkE5RjY0MTFFMUE4ODk4NUE3MDc2ODcxQTAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MzFBQTMyNkI5RjY0MTFFMUE4ODk4NUE3MDc2ODcxQTAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4kAY3TAAAER0lEQVR42uyZSUslMRDHq9sWXFG8iDu4XTyoDAgevCv4voTfYL6OoB4Ujx58gnjyJiJuoILgvu/7hmsm//iSST+7J8F5MzxnOiBJVf1etqqudEeHMUYo29vbbHd3ly4vL6mwsJDKy8upsrLSgc0BNDU1xTIyMqiuro5yc3Pp7u6OVlZW6PX1lVpaWhza2NhgMzMzjCvE39jYmGrPz88z2N3NzU2qr6+noFJTU0Owew8PD5Sdna0Mz8/PNDo6Ktrt7e0EuwcAjZycHGHo6OhQP7i/vxcdOGtra+zq6ooaGxs/DLewsED5+fnvq5ucnGRZWVlUXV1NeXl5dHt7S+vr62KE1tZWx5H7tLW19WGfqqqqfu6TqXxZiFiiYFMHBgbQJNSQZUFPLB6PU0FBAZWVlcGpwgt7e3sET8RiMXK4l9nq6io1NTUJP3EfOtxnDLvNQ4Vqa2vJnZiYwM6KYHNdV0wBNWToYXfhhuLi4sD5Qg+7i/jJzMwMhKCH3UusMHnFPllBb29vSokHQM4tFJJtx3F+QlAClMNABiBhX0/JkK+nMMg3p5eXF7FUCaEte/H1pM8puXbJoqQQwrhIO/qSZRt62F0sE6vTVyNB6GF38VifnZ359gU1ZOhhd9va2gihGhQJ0MPuIjzxi+XlZZEoUFBDhh52jCueCK5kfX194mlBDRkF9n87YfyBrFJUVIRTiSoqKpydnR3GTy06Pz8XWQVnBxsfH2fcFeLQQU+oIUMPu8gqSPJBWQV6lVVKSkoC5wv957MKgs2YVTzP+1pZ5enpSUFop3tW8fSsorvmc1nl5OTkXdDiCX/Qq6yCUJUbKHuBDL3KKsfHx7S4uEjX19cCQg0Z+iirvEPd3d1GyuFvEl8TwmuQEbq5uTFD/G3LDF1cXJghfqaZIR7sZmh/f98M8XM27SCriacOOjw8NENHR0dGyBsaGkq7h5NZdJWWEM/XZoif+2bo8fExRQmDf4enKGFYPeanp6dpB1lNPHUQf/tLTfb1BgcH//PX/z8AyQRbWlrqBELJGTgZDD0RdDDa8VRC1jtu9J11FERu+Ztf+dPT07gCZHqBDL38MHTxaX1wcADfSR8KWf8UFwe1bpA1d7Sw+05zHUwAfsjUkxfUA+REbNmvLoqC9IzM/v5+Njs7y/QrCsjQq8hsaGigpaUlmpubE12ihgy9Os2bm5sRM8IgawAJvX9Oeg86oO4wdEAfWg0X0IMaWvVos7ooCv6DO1b1xz8Iv+uyupbTAf6bb6GQBEIhHQiDrO7p7IaznrhpC6JQiSCi0PBIvsT+ZgJJhu2vQNKflDDQ7mmxHs44cZstiEIlgjg0PDz8gYrFYh+/yuLxOAsDfKcUeoyCLoL+UUhRIyMjou7s7PQxni7hv5GfvbB20h767S2I4umLQ729vaLR1dUVfE8nAVmSQaenpydwPB2MdtwSst5Mo1usHWwqPwQYAL68iqBHZNxhAAAAAElFTkSuQmCC)
      no-repeat;
    display: block;
    height: 13px;
    width: 14px;
  }
  .bx-calendar-form-arrow-top i {
    background-position: 4px -125px;
  }
  .bx-calendar-form-arrow-bottom i {
    background-position: 4px -137px;
  }
  .bx-calendar-form-arrow-top:hover i {
    background-position: 4px -275px;
    background-color: #f2f2f2;
  }
  .bx-calendar-form-arrow-bottom:hover i {
    background-position: 4px -286px;
    background-color: #f2f2f2;
  }
  
  .bx-calendar-form-input {
    background: #fff;
    border: 1px solid #d1d1d1;
    box-shadow: inset 1px 1px 0 #f7f7f7;
    display: inline-block;
    height: 21px;
    margin-top: 6px;
    font-size: 15px;
    text-align: center;
    padding: 0;
    vertical-align: top;
    width: 28px;
  }
  
  .bx-calendar-form-separator {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAEnCAYAAAB7QGniAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjMxQUEzMjZDOUY2NDExRTFBODg5ODVBNzA3Njg3MUEwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjMxQUEzMjZEOUY2NDExRTFBODg5ODVBNzA3Njg3MUEwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MzFBQTMyNkE5RjY0MTFFMUE4ODk4NUE3MDc2ODcxQTAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MzFBQTMyNkI5RjY0MTFFMUE4ODk4NUE3MDc2ODcxQTAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4kAY3TAAAER0lEQVR42uyZSUslMRDHq9sWXFG8iDu4XTyoDAgevCv4voTfYL6OoB4Ujx58gnjyJiJuoILgvu/7hmsm//iSST+7J8F5MzxnOiBJVf1etqqudEeHMUYo29vbbHd3ly4vL6mwsJDKy8upsrLSgc0BNDU1xTIyMqiuro5yc3Pp7u6OVlZW6PX1lVpaWhza2NhgMzMzjCvE39jYmGrPz88z2N3NzU2qr6+noFJTU0Owew8PD5Sdna0Mz8/PNDo6Ktrt7e0EuwcAjZycHGHo6OhQP7i/vxcdOGtra+zq6ooaGxs/DLewsED5+fnvq5ucnGRZWVlUXV1NeXl5dHt7S+vr62KE1tZWx5H7tLW19WGfqqqqfu6TqXxZiFiiYFMHBgbQJNSQZUFPLB6PU0FBAZWVlcGpwgt7e3sET8RiMXK4l9nq6io1NTUJP3EfOtxnDLvNQ4Vqa2vJnZiYwM6KYHNdV0wBNWToYXfhhuLi4sD5Qg+7i/jJzMwMhKCH3UusMHnFPllBb29vSokHQM4tFJJtx3F+QlAClMNABiBhX0/JkK+nMMg3p5eXF7FUCaEte/H1pM8puXbJoqQQwrhIO/qSZRt62F0sE6vTVyNB6GF38VifnZ359gU1ZOhhd9va2gihGhQJ0MPuIjzxi+XlZZEoUFBDhh52jCueCK5kfX194mlBDRkF9n87YfyBrFJUVIRTiSoqKpydnR3GTy06Pz8XWQVnBxsfH2fcFeLQQU+oIUMPu8gqSPJBWQV6lVVKSkoC5wv957MKgs2YVTzP+1pZ5enpSUFop3tW8fSsorvmc1nl5OTkXdDiCX/Qq6yCUJUbKHuBDL3KKsfHx7S4uEjX19cCQg0Z+iirvEPd3d1GyuFvEl8TwmuQEbq5uTFD/G3LDF1cXJghfqaZIR7sZmh/f98M8XM27SCriacOOjw8NENHR0dGyBsaGkq7h5NZdJWWEM/XZoif+2bo8fExRQmDf4enKGFYPeanp6dpB1lNPHUQf/tLTfb1BgcH//PX/z8AyQRbWlrqBELJGTgZDD0RdDDa8VRC1jtu9J11FERu+Ztf+dPT07gCZHqBDL38MHTxaX1wcADfSR8KWf8UFwe1bpA1d7Sw+05zHUwAfsjUkxfUA+REbNmvLoqC9IzM/v5+Njs7y/QrCsjQq8hsaGigpaUlmpubE12ihgy9Os2bm5sRM8IgawAJvX9Oeg86oO4wdEAfWg0X0IMaWvVos7ooCv6DO1b1xz8Iv+uyupbTAf6bb6GQBEIhHQiDrO7p7IaznrhpC6JQiSCi0PBIvsT+ZgJJhu2vQNKflDDQ7mmxHs44cZstiEIlgjg0PDz8gYrFYh+/yuLxOAsDfKcUeoyCLoL+UUhRIyMjou7s7PQxni7hv5GfvbB20h767S2I4umLQ729vaLR1dUVfE8nAVmSQaenpydwPB2MdtwSst5Mo1usHWwqPwQYAL68iqBHZNxhAAAAAElFTkSuQmCC)
      no-repeat 0 -246px;
    color: #aaa;
    display: inline-block;
    height: 23px;
    font-size: 14px;
    font-weight: var(--ui-font-weight-bold);
    text-align: center;
    padding-top: 7px;
    vertical-align: top;
    width: 8px;
  }
  .bx-calendar-form-close {
    display: block;
    font-size: 1px;
    right: -8px;
    top: 0;
    height: 35px;
    position: absolute;
    width: 20px;
  }
  .bx-calendar-form-close i {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAEnCAYAAAB7QGniAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjMxQUEzMjZDOUY2NDExRTFBODg5ODVBNzA3Njg3MUEwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjMxQUEzMjZEOUY2NDExRTFBODg5ODVBNzA3Njg3MUEwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MzFBQTMyNkE5RjY0MTFFMUE4ODk4NUE3MDc2ODcxQTAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MzFBQTMyNkI5RjY0MTFFMUE4ODk4NUE3MDc2ODcxQTAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4kAY3TAAAER0lEQVR42uyZSUslMRDHq9sWXFG8iDu4XTyoDAgevCv4voTfYL6OoB4Ujx58gnjyJiJuoILgvu/7hmsm//iSST+7J8F5MzxnOiBJVf1etqqudEeHMUYo29vbbHd3ly4vL6mwsJDKy8upsrLSgc0BNDU1xTIyMqiuro5yc3Pp7u6OVlZW6PX1lVpaWhza2NhgMzMzjCvE39jYmGrPz88z2N3NzU2qr6+noFJTU0Owew8PD5Sdna0Mz8/PNDo6Ktrt7e0EuwcAjZycHGHo6OhQP7i/vxcdOGtra+zq6ooaGxs/DLewsED5+fnvq5ucnGRZWVlUXV1NeXl5dHt7S+vr62KE1tZWx5H7tLW19WGfqqqqfu6TqXxZiFiiYFMHBgbQJNSQZUFPLB6PU0FBAZWVlcGpwgt7e3sET8RiMXK4l9nq6io1NTUJP3EfOtxnDLvNQ4Vqa2vJnZiYwM6KYHNdV0wBNWToYXfhhuLi4sD5Qg+7i/jJzMwMhKCH3UusMHnFPllBb29vSokHQM4tFJJtx3F+QlAClMNABiBhX0/JkK+nMMg3p5eXF7FUCaEte/H1pM8puXbJoqQQwrhIO/qSZRt62F0sE6vTVyNB6GF38VifnZ359gU1ZOhhd9va2gihGhQJ0MPuIjzxi+XlZZEoUFBDhh52jCueCK5kfX194mlBDRkF9n87YfyBrFJUVIRTiSoqKpydnR3GTy06Pz8XWQVnBxsfH2fcFeLQQU+oIUMPu8gqSPJBWQV6lVVKSkoC5wv957MKgs2YVTzP+1pZ5enpSUFop3tW8fSsorvmc1nl5OTkXdDiCX/Qq6yCUJUbKHuBDL3KKsfHx7S4uEjX19cCQg0Z+iirvEPd3d1GyuFvEl8TwmuQEbq5uTFD/G3LDF1cXJghfqaZIR7sZmh/f98M8XM27SCriacOOjw8NENHR0dGyBsaGkq7h5NZdJWWEM/XZoif+2bo8fExRQmDf4enKGFYPeanp6dpB1lNPHUQf/tLTfb1BgcH//PX/z8AyQRbWlrqBELJGTgZDD0RdDDa8VRC1jtu9J11FERu+Ztf+dPT07gCZHqBDL38MHTxaX1wcADfSR8KWf8UFwe1bpA1d7Sw+05zHUwAfsjUkxfUA+REbNmvLoqC9IzM/v5+Njs7y/QrCsjQq8hsaGigpaUlmpubE12ihgy9Os2bm5sRM8IgawAJvX9Oeg86oO4wdEAfWg0X0IMaWvVos7ooCv6DO1b1xz8Iv+uyupbTAf6bb6GQBEIhHQiDrO7p7IaznrhpC6JQiSCi0PBIvsT+ZgJJhu2vQNKflDDQ7mmxHs44cZstiEIlgjg0PDz8gYrFYh+/yuLxOAsDfKcUeoyCLoL+UUhRIyMjou7s7PQxni7hv5GfvbB20h767S2I4umLQ729vaLR1dUVfE8nAVmSQaenpydwPB2MdtwSst5Mo1usHWwqPwQYAL68iqBHZNxhAAAAAElFTkSuQmCC)
      no-repeat 4px -151px;
    display: block;
    height: 15px;
    margin: 10px 0 0;
    width: 15px;
  }
  .bx-calendar-form-close:hover i {
    background-position: 4px -169px;
    background-color: #e8e8e8;
  }
  
  .bx-calendar-AM-PM-block {
    cursor: pointer;
    display: inline-block;
    margin-left: -4px;
    vertical-align: top;
  }
  .bx-calendar-AM-PM-text {
    display: inline-block;
    color: #333;
    margin-top: 11px;
    vertical-align: top;
    font-family: var(--ui-font-family-primary, var(--ui-font-family-helvetica));
    font-size: 13px;
    line-height: 15px;
    text-transform: uppercase;
  }
  .bx-calendar-AM-PM-block .bx-calendar-form-arrow-r {
    width: 19px;
  }
  
  .bx-calendar-year-popup {
    font-family: var(--ui-font-family-primary, var(--ui-font-family-helvetica));
    margin-top: -2px;
    padding-bottom: 7px;
    width: 45px;
  }
  .bx-calendar-month-popup {
    font-family: var(--ui-font-family-primary, var(--ui-font-family-helvetica));
    margin-top: -2px;
    padding-bottom: 7px;
    width: 85px;
  }
  .bx-calendar-year-title,
  .bx-calendar-month-title {
    color: #000;
    font-size: 16px;
    line-height: 20px;
    padding-bottom: 5px;
  }
  .bx-calendar-year-content,
  .bx-calendar-month-content {
    color: #000;
    border-top: 1px solid #e5e5e5;
    font-size: 13px;
    padding: 5px 0 0 2px;
  }
  .bx-calendar-year-number,
  .bx-calendar-month {
    display: block;
    border-radius: 3px;
    cursor: pointer;
    margin: 0 0 2px -5px;
    text-decoration: none !important;
    padding: 2px 0 2px 4px;
  }
  .bx-calendar-month,
  .bx-calendar-month:link,
  .bx-calendar-month:active,
  .bx-calendar-month:visited,
  .bx-calendar-year-number,
  .bx-calendar-year-number:link,
  .bx-calendar-year-number:active,
  .bx-calendar-year-number:visited {
    color: #000;
  }
  .bx-calendar-month:hover,
  .bx-calendar-year-number:hover {
    background-color: #ededed;
    text-decoration: none;
  }
  
  .bx-calendar-month-active,
  .bx-calendar-month-active:link,
  .bx-calendar-month-active:active,
  .bx-calendar-month-active:visited,
  .bx-calendar-year-active,
  .bx-calendar-year-active:link,
  .bx-calendar-year-active:active,
  .bx-calendar-year-active:visited {
    color: #ca0707;
  }
  
  .bx-calendar-year-input,
  .bx-calendar-month-input {
    background: #fff;
    border: 1px solid #b5b5b5;
    border-radius: 2px;
    box-shadow: inset 2px 2px 1px #ededed;
    height: 19px;
    margin-top: 10px;
    font-size: 16px;
    text-align: center;
    width: 41px;
  }
  
  .bx-calendar-time-disabled .bx-calendar-button-block,
  .bx-calendar-time-disabled .bx-calendar-set-time-wrap {
    display: none;
  }
  
  * html .bx-calendar-month-title,
  * html .bx-calendar-year-title {
    margin-top: -2px;
  }
  * html .bx-calendar-month-popup,
  * html .bx-calendar-year-popup {
    margin-left: -2px;
  }
  * + html .bx-calendar-month-title,
  * + html .bx-calendar-year-title {
    margin-top: -2px;
  }
  * + html .bx-calendar-month-popup,
  * + html .bx-calendar-year-popup {
    margin-left: -2px;
  }
  * + html .bx-calendar-form-input {
    padding-top: 4px;
    height: 17px;
  }
  * html .bx-calendar-button-text {
    height: 23px;
  }
  * html .bx-calendar-name-day {
    padding-top: 3px;
  }
  * html .bx-calendar-cell {
    height: 23px;
  }
  * html .bx-calendar-form-arrow-top,
  * html .bx-calendar-form-arrow-bottom {
    font-size: 0;
  }
  * html .bx-calendar-form-arrow-top,
  * html .bx-calendar-form-arrow-bottom {
    width: 20px;
  }
  * html .bx-calendar-button-text {
    padding-top: 3px;
  }
  * html .bx-calendar-left-arrow,
  * html .bx-calendar-right-arrow {
    width: 17px;
    margin-left: 0;
  }
  * html .bx-calendar-form-text {
    width: 46px;
  }
  
  .main-ui-placeholder{
    color: #757575;
  }
  </style>
  