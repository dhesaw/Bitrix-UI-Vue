<template>
<div>
    <BxUiInputText v-if="opened" v-model="searchText" :label="props.label" data-touchable="true" />
    <BxUiSelect :style="'display:'+(opened ? 'none;' : 'block;')" class="child-select" 
        v-bind:="props"
        v-model="model" 
        :loading="loading"
        :options="showOptions" 
        @dropdown:open="()=>dropdownEvent(true)" 
        @dropdown:closed="()=>dropdownEvent(false)"
        @element:select="(val)=>selectedElements.push(val)"
    >
        <template v-if="$slots[`dropdown`]" #dropdown="{ item, index}"> 
            <slot name="dropdown" v-bind="{item, index}" /> 
        </template>
    </BxUiSelect>
</div>
</template>
<script setup lang="ts">
import BxUiInputText from './bx-ui-inputText.vue';
import BxUiSelect from './bx-ui-select.vue';
import { computed, onMounted, ref, watch } from 'vue';
const model = defineModel();
const selectedElements=ref<any>([]);

const props=withDefaults(defineProps<{
    asyncOptions:((value:string|any[],type?:string)=>void),
    label?:string | null,
    placeholder?:string,
    optionLabel?:string,
    optionValue?:string,
    disabled?:boolean,
    required?:boolean,
    wrap?:boolean,
    multiple?:boolean,
}>(),{
    label:null,
	wrap:true,
	multiple:false,
	disabled:false,
	required:false,
    placeholder:'',
    optionLabel:'name',
    optionValue:'id',
});

const opened = ref<Boolean>(false);
const searchText=ref<string>('');
const loading=ref<Boolean>(false);

const timerFind=ref<NodeJS.Timeout | null>(null);
const options=ref<any>([]);

const debounce = function (f:() => void, ms:number) {
    if (timerFind.value!=null) clearTimeout(timerFind.value);
    timerFind.value=setTimeout(f,ms);
}

function dropdownEvent(value:boolean){
    if (value===true){
        searchText.value='';
        options.value=[];
    }
    opened.value=value;
}

watch(()=>searchText.value, (newValue) => {
    if(newValue.length<2) return "";
    else debounce(async()=>{
        loading.value=true;
        options.value=await props.asyncOptions(newValue,'search');
        loading.value=false;
    }, 500);
});

watch(()=>model.value, async(newValue) => await checkRequiredOptions());
onMounted(async()=>await checkRequiredOptions());

async function checkRequiredOptions(){
    let notFound:any[]=[];
    if (props.multiple && Array.isArray(model.value)) {
        notFound=model.value.filter((item)=>!showOptions.value.some((i)=>i[props.optionValue]===item));
    } else if(!props.multiple && model.value!=null){
        notFound=[model.value].filter((item)=>!showOptions.value.some((i)=>i[props.optionValue]===item));
    }
    if (notFound.length>0){
        selectedElements.value=await props.asyncOptions(Array.isArray(model.value) ? model.value : [model.value],'single');
    } else {
        let elements:any[]= Array.isArray(model.value) ? model.value : [model.value];
        if (elements.length!=selectedElements.value.length) selectedElements.value=selectedElements.value.filter((item)=>elements.includes(item[props.optionValue]));
    }
}

const showOptions=computed(()=>{
    let result:any[] = [];
    if (selectedElements.value.length>0) result=[...selectedElements.value];
    if (options.value!=null) result=[...result,...options.value];
    result=result.filter((item,index,self)=>self.findIndex(i=>i[props.optionValue]===item[props.optionValue])===index);
    return result;
});

</script>

<style scoped>
.child-select :deep(.main-ui-control.main-ui-select) {
    background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjYiIGhlaWdodD0iMTUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CgogPGc+CiAgPHRpdGxlPkxheWVyIDE8L3RpdGxlPgogIDxnIHN0cm9rZT0ibnVsbCI+CiAgIDxwYXRoIHN0cm9rZT0ibnVsbCIgZD0ibTEuNTQyOTgsNS45MTA5N2MwLC0yLjQyNjcgMS45NDA1MywtNC4zOTIwNyA0LjMzNjU1LC00LjM5MjA3czQuMzM2NTUsMS45NjQzMiA0LjMzNjU1LDQuMzkyMDdjMCwyLjQyNzc1IC0xLjkzOTQ5LDQuMzkyMDcgLTQuMzM2NTUsNC4zOTIwN2MtMi4zOTcwNiwwIC00LjMzNjU1LC0xLjk2NDMyIC00LjMzNjU1LC00LjM5MjA3bTEzLjAyODM1LDcuMzEzOGwtMy45Njg0MSwtNC4wMjAyN2wtMC4wMTQ1NiwtMC4wMDg0M2MwLjYzNjQ0LC0wLjkzNjM0IDEuMDEwODIsLTIuMDYzMzIgMS4wMTA4MiwtMy4yODUxYzAsLTMuMTk5NzkgLTIuNTYxMzcsLTUuNzkyOSAtNS43MTk2NiwtNS43OTI5cy01LjcxOTY2LDIuNTkzMTEgLTUuNzE5NjYsNS43OTI5czIuNTYxMzcsNS43OTI5IDUuNzE5NjYsNS43OTI5YzEuMjA0MjUsMCAyLjMyMTE0LC0wLjM3OTE3IDMuMjQyNTMsLTEuMDIzNzZjMC4wMDQxNiwwLjAwNDIxIDAuMDA1MiwwLjAxMDUzIDAuMDEwNCwwLjAxNDc1bDMuOTY4NDEsNC4wMjAyN2MwLjM4Njg2LDAuMzg5NyAxLjAyMTIyLDAuMzg5NyAxLjQwODA4LDBsMC4wNjI0LC0wLjA2NjM1YzAuMzg2ODYsLTAuMzkxODEgMC4zODY4NiwtMS4wMzQzIDAsLTEuNDI2MTEiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZmlsbD0iIzUzNUM2OCIvPgogIDwvZz4KIDwvZz4KPC9zdmc+");
    }
</style>