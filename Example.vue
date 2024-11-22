<template>
    <BxHeaderNavigation 
        :menus="menus"
        @change:selected="changeSelected"
    />
    <div style="margin-left: 10px;">
        <bxUiCalendar
        style="width: 400px;"
        v-model="dateValue"
        :required="true"
        :range="true"
        :label="'поле типа календарь'"
        ></bxUiCalendar>

        <bxUiSelect 
        v-model="selectValue" 
        :label="'поле типа селект'" 
        :required="true"
        style="width: 400px;" 
        :options="[{label:'информация', id:1, guid:1}, {label:'телефонный звонок', id:2, guid:2},{label:'информация', id:3, guid:3}, {label:'телефонный звонок', id:4, guid:4},{label:'информация', id:5, guid:5}, {label:'телефонный звонок', id:6, guid:6}]"
        :optionValue="'id'"
        :multiple="true"
        :optionLabel="'label'"
        >
        </bxUiSelect>

        <bxUiInputText
            v-model="textValue"
            :label="'поле типа текст'"
            :required="true"
            style="width: 400px;"
        />

        <bxUiInputNumber 
            v-model="numberValue"
            :required="true"
            label="поле типа число"
            style="width: 400px;"
        />
        <br>
        <bxButton @click="showDialog=true" type="primary" label="Открыть sidePanel" />
        <bxButton @click="showDialog2=true" type="light" label="Открыть Dialog" />
    </div>

    <BxUiFilter 
        v-model="filterData" 
        style="margin: 10px; margin-left: 0px;" 
        :fields="{
            dateField:{type: Fields.DATE, settings:{label: 'Дата', required: true, range: true} },
            selectField:{type: Fields.DROPDOWN, settings:{
            label: 'селект', 
            required: true,
            optionValue:'id',
            multiple:true,
            optionLabel:'label',
            options:[
                {label:'информация', id:1, guid:1}, 
                {label:'телефонный звонок', id:2, guid:2},
                {label:'информация', id:3, guid:3}, 
            ],
        }},
           textField:{type:Fields.TEXT, settings:{label: 'поле типа текст', required: true} },
        }"
        />
    <BxMainUiGrid 
        :options="body" 
        :collumns="header" 
        :action="action"
    >
    </BxMainUiGrid>
    <BxSidePanel v-model="showDialog" width="1000px" label="Тестовый попуп">
        <div>Тестовый попап</div>
    </BxSidePanel>
    <BxDialog v-model="showDialog2" label="Тестовый диалог" :disabledBackground="true" :draggable="true">
        <template #body>
            <div>hello</div>
        </template>
        <template #footer>
            <bxButton type="success" label="Открыть" />
            <bxButton @click="showDialog2=false" type="primary" label="Закрыть" />
        </template>
    </BxDialog>
</template>
<script setup>
import { ref } from 'vue';
import BxHeaderNavigation from './components/BX-component/bx-header-navigation.vue'; 
import BxMainUiGrid from './components/BX-component/bx-main-ui-grid.vue';
import bxUiSelect from './components/BX-component/bx-ui-select.vue';
import bxUiInputText from './components/BX-component/bx-ui-inputText.vue';
import bxUiCalendar from './components/BX-component/bx-ui-calendar.vue';
import bxUiInputNumber from './components/BX-component/bx-ui-inputNumber.vue';
import BxUiFilter from './components/BX-component/bx-ui-filter.vue';
import bxButton from './components/BX-component/bx-button.vue';
import { Fields } from './components/BX-component/globalInterface';
import BxSidePanel from './components/BX-component/bx-SidePanel.vue';
import BxDialog from './components/BX-component/bx-Dialog.vue';

const menus = [
  { id:0, title: "Расчет ЗП" },
  { id:1, title: "Расчет бонусов" },
  { id:2, title: "Настройка схем ЗП"},
  { id:3, title: "Коэфф. эфект. администраторов"},
];

const selectValue=ref([1,2,3]);
const dateValue=ref(new Date());
const textValue=ref('привет');
const numberValue=ref(123);
const filterData=ref(null);
const showDialog = ref(false);
const showDialog2=ref(false);
const header=[
    {'title': 'ID', propertyName: 'id'},
    {'title': 'Название', propertyName: 'title'},
    {'title': 'Номер счёта', propertyName: 'account'},
];

const action = [
    {
        handlerFn: (dataRow) => {console.log(dataRow)},
        label: 'Подробнее',
    }
];

const body = Array.from({length: 100}, (_, i) => ({
    id: 1 + i,
    title: `Оплата приёма (пациент Владислав Михайлов) ${i}`,
    account: 75,
}));

function changeSelected(element, index) {
    console.log(element,index);
}

</script>