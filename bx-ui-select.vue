<template>
	<div class="main-ui-select-custom">
			<div class="main-ui-control-field">
					<span v-if="label!=null" class="main-ui-control-field-label">{{ label }} <span v-if="required" style="color: rgb(255, 0, 0)"> *</span></span>
					<div class="main-ui-control-custom main-ui-select-custom" 
				@click="disabled ? null : dropdownPopup?.initPopup(
						$event,
						PopupLocation.BOTTOM,
						{
							style: { 
								width: ($event.currentTarget as HTMLElement).getBoundingClientRect().width + 'px',
								overflow: 'auto',
								'border-radius':'0px',
								padding:'0px'
							}
						}
						)"
				:class="{
					'main-ui-disable': disabled, 
					'main-ui-focus': dropdownPopup?.isActive
				}">
							<span class="main-ui-select-custom-name" :style="{'flex-wrap': wrap ? 'wrap' : 'nowrap'}">
									<template v-if="$slots[`selected`]">
											<slot :name="`selected`" v-bind="{ model }"></slot>
									</template>
									<template v-else>
						<span v-if="model==null || (Array.isArray(model) && model.length==0)" class="main-ui-placeholder">{{ placeholder }}</span>
						<span v-else-if="!multiple">{{ showNoMultiple }}</span>
						<span v-else class="main-ui-square" v-for="(item, index) in model">
							<span class="main-ui-square-item">{{ options?.find((item)=>item[optionValue]==model[index])?.[optionLabel] }}</span>
							<span class="main-ui-item-icon main-ui-square-delete" v-if="!disabled" @click.stop="removeItem(item)"></span>
						</span>
						<span v-if="multiple && Array.isArray(model) && model.length>0 && !disabled" @click="removeAll" class="main-ui-control-custom-value-delete"><div class="main-ui-control-custom-value-delete-item" ></div></span>
									</template>
							</span>
							<span class="main-ui-square-search">
									<input type="text" tabindex="2" class="main-ui-square-search-item">
							</span>    
					</div>
			</div>
			
			<BxTeleport ref="dropdown" :class="popupClass">
					<template #body="{popup}">    
				<div :class="{'popup-multiselect-content':multiple, 'popup-select-content':!multiple}">
									<div
					v-if="options!=null && options?.length>0"
					v-for="(item, index) in options" 
					class="main-ui-select-custom-inner-item" 
					:class="{'main-ui-checked': multiple ? (Array.isArray(model) && model.includes(item[optionValue])) : item[optionValue]==model}"
					>
											<div class="main-ui-select-custom-inner-item-element" @click="onSelectectElement(item)">
													<template v-if="$slots[`dropdown`]">
															<slot v-bind="{ item, index, model}" :name="`dropdown`" ></slot>
													</template>
													<template v-else>
															<div :class="{'main-ui-select-custom-inner-label':multiple}">
									{{ item[optionLabel] }}
								</div>
													</template>
											</div>
									</div>
					<div v-else-if="loading" style="height: 150px;">
						<BxLoader style="background-color: transparent;" />
					</div>
					<div v-else class="ui-selector-tab-stub">
						<div class="ui-selector-tab-default-stub main-ui-select-custom-inner-item-element">
							<div class="ui-selector-tab-default-stub-icon"></div>
							<div class="ui-selector-tab-default-stub-titles">
								<div class="ui-selector-tab-default-stub-title">Данные не найдены</div>
							</div>
						</div>
					</div>
							</div>
			</template>
		</BxTeleport>
	</div>
	</template>
	<script setup lang="ts">
	import { computed, onMounted, Ref, ref, useTemplateRef, watch } from 'vue';
	import { ActionType, IElementPopup, PopupLocation } from './globalInterface';
	import BxTeleport from './bx-teleport.vue';
	import BxLoader from './bx-loader.vue';
	export interface IUiSelect {
		label?:string | null,
		placeholder?:string,
		optionLabel?:string,
		optionValue?:string,
		disabled?:boolean,
		required?:boolean,
		wrap?:boolean,
		multiple?:boolean,
		options?:Array<Record<string, any>> | null,
		popupClass?:Record<string, boolean>|{},
		loading?:boolean
	}
	
	const emit = defineEmits<{
			(e: 'element:select', data:Record<string, any>): void,
			(e: 'element:unselect', data:Record<string, any>): void,
			(e: 'dropdown:open'): void,
			(e: 'dropdown:closed'): void,
	}>();
	
	const props=withDefaults(defineProps<IUiSelect>(),{
			label:null,
		wrap:true,
		multiple:false,
		disabled:false,
		required:false,
			placeholder:'',
		loading:false,
			optionLabel:'name',
			optionValue:'id',
			options:null
	});
	
	const model:Ref<any> = defineModel();
	const dropdownPopup=useTemplateRef('dropdown');
	
	const selectedModel=computed(()=>model.value);
	
	function removeItem(item:any){
		if (!Array.isArray(model.value)) return;
		model.value= model.value.filter((i:any)=>i!=item);
	}
	
	function removeAll(){
		model.value=[];
	}
	
	function onSelectectElement(element:Record<string, any>){
		if (props.multiple) {
			
			if (model.value && model.value.includes(element[props.optionValue])){
				model.value.splice(model.value.indexOf(element[props.optionValue]), 1);
				emit('element:unselect', element);
			} else if (model.value!=null) {
				model.value.push(element[props.optionValue]);
				emit('element:select', element);
			} else {
				model.value=[element[props.optionValue]];
				emit('element:select', element);
			}
		} else {
			model.value=element[props.optionValue];
			emit('element:select', element);
			dropdownPopup.value?.close();
		}
	}
	
	const showNoMultiple= computed(()=>{
		return props.options?.find((item)=>item[props.optionValue]==model.value)?.[props.optionLabel];
	});
	
	watch(() => dropdownPopup.value?.isActive, (newValue,oldValue) => {
		if (newValue==true) emit('dropdown:open');
		else if(newValue==false) emit('dropdown:closed');
	})
	</script>
	
	<style scoped>
	.ui-selector-tab-stub {
			display: block;
			position: relative;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			/* background-color: #fff; */
	}
	
	.ui-selector-tab-default-stub {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		position: relative;
			left: 0;
			right: 0;
			bottom: 0;
			top: 0;
			padding: 20px;
	}
	
	.ui-selector-tab-default-stub-icon {
			width: 70px;
			min-height: 70px;
			flex: 1;
			background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='101' height='101' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath opacity='.1' fill-rule='evenodd' clip-rule='evenodd' d='M65.09 77.214a41.847 41.847 0 01-23.046 6.874C18.824 84.088 0 65.264 0 42.044 0 18.824 18.824 0 42.044 0c23.22 0 42.044 18.824 42.044 42.044 0 8.51-2.528 16.428-6.874 23.047l21.853 21.852a6.602 6.602 0 010 9.336l-2.788 2.788a6.602 6.602 0 01-9.336 0L65.091 77.214zm6.985-35.17c0 16.586-13.445 30.031-30.031 30.031S12.013 58.63 12.013 42.044s13.445-30.031 30.03-30.031c16.587 0 30.032 13.445 30.032 30.03z' fill='%23525C69'/%3E%3C/svg%3E");
			background-repeat: no-repeat;
			background-size: contain;
			background-position: 0 76%;
	}
	
	.ui-selector-tab-default-stub-title {
			color: #7f868d;
			font-size: 20px;
			font-family: var(--ui-font-family-secondary, var(--ui-font-family-open-sans));
			font-weight: var(--ui-font-weight-light, 300);
			text-align: center;
	}
	.ui-selector-tab-default-stub-titles {
			flex: 1;
			text-align: center;
			margin-top: 10px;
	}
	
	.main-ui-control-field-label {
		position: relative;
			display: flex;
		gap:4px;
			margin-bottom: 5px;
			color: #a3a9b1;
			font: 12px / 14px var(--ui-font-family-primary, var(--ui-font-family-helvetica));
	}
	
	.main-ui-control-custom{
		position: relative;
		padding: 0 10px;
		height: 38px;
		width: 100%;
		border: 1px solid rgb(var(--ui-field-color-border-default));
		/* border-radius: var(--main-ui-control-border-radius, var(--ui-border-radius-2xs, 2px)); */
		background: #fff;
		font: 15px var(--ui-font-family-primary, var(--ui-font-family-helvetica));
		box-sizing: border-box;
		transition: all .3s ease-in-out;
		outline: none;
	}
	
	.main-ui-control-custom .main-ui-control-input {
		position: relative;
		padding: 0 10px 0 30px;
		height: 38px;
		width: 100%;
		border: 1px solid rgb(var(--ui-field-color-border-default));
		/* border-radius: var(--main-ui-control-border-radius, var(--ui-border-radius-2xs, 2px)); */
		background: #fff;
		font: 15px var(--ui-font-family-primary, var(--ui-font-family-helvetica));
		box-sizing: border-box;
		transition: all .3s ease-in-out;
		outline: none;
	}
	
	.main-ui-control-custom-value-delete {
		height: 36px;
		width: 30px;
		position: absolute;
		top: 1px;
		right: 1px; 
	}
	
	.main-ui-control-custom-value-delete-item {
		position: absolute;
		top: 10px;
		cursor: pointer;
		right: 6px;
		display: inline-block;
		width: 18px;
		height: 18px;
		background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIzODUiIHZpZXdCb3g9IjAgMCAxOCAzODUiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZmlsbD0iIzUzNUM2OSIgZD0iTTUuMDY1IDQuNjgyTDIuMzc3IDEuOTk0IDEuMDEgMy4zNjIgMy42OTYgNi4wNS45OSA4Ljc1N2wxLjM2OCAxLjM3IDIuNzA4LTIuNzEgMi43IDIuNzAzIDEuMzctMS4zNjhMNi40MzMgNi4wNWwyLjY4Mi0yLjY4Mkw3Ljc0OCAyIDUuMDY1IDQuNjgyeiIvPjxnIGZpbGw9IiM3MTdBODQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMjgpIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMiIgcng9IjEiLz48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMiIgeT0iNCIgcng9IjEiLz48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMiIgeT0iOCIgcng9IjEiLz48L2c+PHBhdGggZmlsbD0iIzUyNUM2OCIgZD0iTS42NjcgNjEuNDE1TDAgNjRsMi40NDQtLjc2NWMtLjE1Mi0uNDE3LS4zNzYtLjc5Ny0uNjYtMS4xMi0uMzE4LS4zMjUtLjctLjU2My0xLjExNy0uN3ptNS40MDctNS45NjNsLTQuNzggNS4yMTNjLjM5Ny4yMDguNzY1LjQ3NCAxLjA5NC43OTIuMjcuMzQzLjQ5Ni43MjUuNjcgMS4xMzVsNC43NzctNS4yMWMtLjE4NS0uNDQ3LS40MzctLjg1Ny0uNzQ2LTEuMjEzLS4yOTYtLjMwNi0uNjQtLjU0OC0xLjAxOC0uNzE1bC4wMDItLjAwM3ptMi43MzMtMS4wNTdjLS4yNDItLjI2LS41Ny0uNDAzLS45MS0uMzk1LS4zMzguMDA4LS42Ni4xNjUtLjg5Mi40MzVsLS4yODcuMzEzYy4zODIuMTc3LjczMi40MjggMS4wMzMuNzQuMzA0LjM0OC41NS43NS43MzIgMS4xODdsLjI4OC0uMzE0Yy4yNDgtLjI1Mi4zOS0uNjA0LjM5OC0uOTc0LjAwNi0uMzctLjEyNS0uNzI4LS4zNjQtLjk5aC4wMDN6Ii8+PHBhdGggZmlsbD0iIzIxMjEyMSIgZD0iTTYgODV2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6Ii8+PHBhdGggZmlsbD0iIzUzNUM2OCIgZD0iTTEwLjEzIDE4OS45ODhsLTIuNTctMi43NmMtLjE4Ni0uMTk4LS40NTQtLjI3NC0uNzA1LS4yLS4yNTIuMDcyLS40NDcuMjg0LS41MTQuNTUzLS4wNjUuMjcuMDA4LjU1OC4xOTIuNzU0bC41MjUuNTYyLTQuMTMgMy4yOTItLjUxNi0uNTU0Yy0uMjgzLS4zLS43NC0uMy0xLjAyNSAwLS4yODIuMzA4LS4yODIuOCAwIDEuMTA4bDEuNTczIDEuNjg1LTIuOTAyIDMuMzIzYy0uMDM2LjAzOC0uMDU2LjA5LS4wNTYuMTQzIDAgLjA1My4wMi4xMDUuMDU2LjE0Mi4wNzMuMDcuMTg1LjA3LjI1OCAwbDMuMTAyLTMuMTI1IDEuNTczIDEuNjg1Yy4xOC4yMDIuNDUuMjgzLjcwNC4yMS4yNTQtLjA3LjQ1Mi0uMjgyLjUxOC0uNTU0LjA2Ny0uMjctLjAwOC0uNTYtLjE5Ny0uNzU1bC0uNTE3LS41NTMgMy4wNzMtNC40MjQuNTMyLjU3Yy4yODUuMy43NDIuMyAxLjAyNyAwIC4xMzctLjE0NS4yMTUtLjM0My4yMTUtLjU1IDAtLjIwNy0uMDc4LS40MDUtLjIxNi0uNTV6Ii8+PHBhdGggZmlsbD0iIzUzNUM2OSIgZD0iTTEwLjIzOCAxMjAuNzU0di0xLjI3SDguODg1Yy0uMDg1LS41OTItLjM0LTEuMS0uNjc3LTEuNjA3bC43Ni0uNzYyLS44NDUtLjg0Ni0uODQ2Ljc2Yy0uNDIzLS4zMzgtLjkzLS41OTItMS41MjMtLjY3NlYxMTVoLTEuMjd2MS4zNTRjLS41OTIuMDg0LTEuMS4zMzgtMS42MDcuNjc3bC0uNzYyLS43Ni0uODQ2Ljg0NS43Ni43NjJjLS4zMzguNTA4LS41OTIgMS4wMTUtLjY3NiAxLjYwOEgwdjEuMjdoMS4zNTRjLjA4NC41OS4zMzggMS4xLjY3NyAxLjUyMmwtLjc2Ljg0Ni45My45My43NjItLjc2Yy40MjMuMzM4IDEuMDE1LjU5MiAxLjYwNy42NzZ2MS4zNTNoMS4yNjh2LTEuMzU0Yy41OTMtLjA4NSAxLjEtLjM0IDEuNjA4LS42NzhsLjc2Mi43NjIuOTMtLjkzLS45My0uODQ3Yy4zMzgtLjQyMy41MDctMS4wMTUuNjc3LTEuNjA4aDEuMzUzdi4wODR6bS03LjQ0Ni0uNTkyYzAtMS4yNyAxLjAxNi0yLjM3IDIuMzctMi4zNyAxLjI3IDAgMi4zNyAxLjAxNiAyLjM3IDIuMzcgMCAxLjI3LTEuMDE3IDIuMzctMi4zNyAyLjM3LTEuMzU0LS4wODYtMi4zNy0xLjEtMi4zNy0yLjM3eiIvPjxwYXRoIGZpbGw9IiMyMTIxMjEiIGQ9Ik0xMC4yMzggMTU1Ljc1NHYtMS4yN0g4Ljg4NWMtLjA4NS0uNTkyLS4zNC0xLjEtLjY3Ny0xLjYwN2wuNzYtLjc2Mi0uODQ1LS44NDYtLjg0Ni43NmMtLjQyMy0uMzM4LS45My0uNTkyLTEuNTIzLS42NzZWMTUwaC0xLjI3djEuMzU0Yy0uNTkyLjA4NC0xLjEuMzM4LTEuNjA3LjY3N2wtLjc2Mi0uNzYtLjg0Ni44NDUuNzYuNzYyYy0uMzM4LjUwOC0uNTkyIDEuMDE1LS42NzYgMS42MDhIMHYxLjI3aDEuMzU0Yy4wODQuNTkuMzM4IDEuMS42NzcgMS41MjJsLS43Ni44NDYuOTMuOTMuNzYyLS43NmMuNDIzLjMzOCAxLjAxNS41OTIgMS42MDcuNjc2djEuMzUzaDEuMjY4di0xLjM1NGMuNTkzLS4wODUgMS4xLS4zNCAxLjYwOC0uNjc4bC43NjIuNzYyLjkzLS45My0uOTMtLjg0N2MuMzM4LS40MjMuNTA3LTEuMDE1LjY3Ny0xLjYwOGgxLjM1M3YuMDg0em0tNy40NDYtLjU5MmMwLTEuMjcgMS4wMTYtMi4zNyAyLjM3LTIuMzcgMS4yNyAwIDIuMzcgMS4wMTYgMi4zNyAyLjM3IDAgMS4yNy0xLjAxNyAyLjM3LTIuMzcgMi4zNy0xLjM1NC0uMDg2LTIuMzctMS4xLTIuMzctMi4zN3oiLz48cGF0aCBmaWxsPSIjNTM1QzY5IiBkPSJNMTEuNTA2IDI0NC41Yy4xODQgMCAuMzYtLjA3NC40OS0uMjA1LjEzLS4xMy4yMDQtLjMwNy4yMDQtLjQ5di0xLjA0M2MwLS4zODMtLjMxLS42OTQtLjY5NC0uNjk0LS4zODMgMC0uNjk0LjMxLS42OTQuNjk0djEuMDQyYzAgLjE4NC4wNzMuMzYuMjAzLjQ5LjEzLjEzMi4zMDcuMjA1LjQ5LjIwNXptLTcgLjA3Yy40MDYgMCAuNzM1LS4zMy43MzUtLjczNXYtMS4xYzAtLjQwNi0uMzI4LS43MzUtLjczNC0uNzM1LS40MDYgMC0uNzM1LjMzLS43MzUuNzM1djEuMWMwIC40MDYuMzMuNzM1LjczNi43MzV6bTkuNjUyLTEuMDM3aC0xLjE1MnYuNWMwIC44MjgtLjY3IDEuNS0xLjUgMS41LS44MjggMC0xLjUtLjY3Mi0xLjUtMS41di0uNWgtNHYuNWMwIC44MjgtLjY3IDEuNS0xLjUgMS41LS44MjggMC0xLjUtLjY3Mi0xLjUtMS41di0uNUgxLjg1NGMtLjUxNyAwLTEuMDEyLjIxNC0xLjM2My41OTUtLjM1LjM4LS41MjYuODktLjQ4NCAxLjQwNXYxMGMwIC41NTIuNDQ4IDEgMSAxaDE0Yy41NTIgMCAxLS40NDggMS0xdi0xMGMuMDItMS4wNTQtLjc5NS0xLjkzNi0xLjg0OC0yem0tLjE1MiAxMWgtMTJ2LTdoMTJ2N3pNNS4zNCAyNTEuMzRjLS40MDIuMzQ3LS43NTcuNzQyLTEuMDYgMS4xNzctLjE3My4yODUtLjI4Mi42MDYtLjMyLjkzOGgzLjI5NnYtLjg3M0g1LjM5Yy4wNTQtLjA5My4xMTgtLjE4LjE5LS4yNi4wOC0uMDkuMjY4LS4yNy41NjUtLjU0My4yMi0uMTk0LjQyNi0uNDAzLjYxNS0uNjI3LjE1NS0uMTkuMjgyLS40LjM3Ny0uNjI2LjA4LS4yLjEyLS40MTUuMTItLjYzLjAwNy0uMzctLjE0NS0uNzI1LS40MTctLjk3NC0uMzE0LS4yNzUtLjcyMy0uNDE1LTEuMTQtLjM5LS4zOTQtLjAxNS0uNzguMTA0LTEuMS4zMzYtLjMyMi4yOC0uNTEyLjY4NS0uNTI1IDEuMTEzbC45My4wOTRjLS4wMDQtLjIxNC4wNjctLjQyMi4yLS41OS4yNjgtLjIzMi42NjQtLjIzNS45MzUtLjAwNy4xMi4xMy4xODIuMzA2LjE3LjQ4My0uMDA3LjIwNy0uMDc3LjQwOC0uMi41NzUtLjIzNC4yOS0uNDkyLjU2LS43Ny44MDh2LS4wMDV6bTQuNzA2IDIuMTE1aC45MXYtLjk4N2guNjF2LS44MjJoLS42MXYtMy4xMWgtLjc5TDguMDQgMjUxLjY1di44MjJoMi4wMDZ2Ljk4Ny0uMDA1em0tMS4xMjctMS44MTNsMS4xMjYtMS42NzZ2MS42OEg4Ljkydi0uMDA0eiIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMjc2KSI+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjkiIGZpbGw9IiM1RTY2NzQiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMTAuMTc0IDguOTczbDIuMjg0LTIuMjgzYy4xNjUtLjE2Ni4xNjUtLjQzNCAwLS42bC0uNi0uNmMtLjE2Ni0uMTY1LS40MzQtLjE2NS0uNiAwTDguOTc1IDcuNzcyIDYuNjkgNS40OWMtLjE2Ni0uMTY2LS40MzQtLjE2Ni0uNiAwbC0uNi42Yy0uMTY1LjE2NS0uMTY1LjQzMyAwIC42TDcuNzczIDguOTcgNS40OSAxMS4yNTVjLS4xNjUuMTY2LS4xNjUuNDM0IDAgLjZsLjYuNmMuMTY2LjE2NS40MzQuMTY1LjYgMGwyLjI4My0yLjI4MyAyLjI4MyAyLjI4M2MuMTY2LjE2NS40MzQuMTY1LjYgMGwuNi0uNmMuMTY1LS4xNjYuMTY1LS40MzQgMC0uNmwtMi4yODItMi4yODJ6Ii8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMzEyKSI+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjkiIGZpbGw9IiM1RTY2NzQiIG9wYWNpdHk9Ii41MDEiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMTAuMTc0IDguOTczbDIuMjg0LTIuMjgzYy4xNjUtLjE2Ni4xNjUtLjQzNCAwLS42bC0uNi0uNmMtLjE2Ni0uMTY1LS40MzQtLjE2NS0uNiAwTDguOTc1IDcuNzcyIDYuNjkgNS40OWMtLjE2Ni0uMTY2LS40MzQtLjE2Ni0uNiAwbC0uNi42Yy0uMTY1LjE2NS0uMTY1LjQzMyAwIC42TDcuNzczIDguOTcgNS40OSAxMS4yNTVjLS4xNjUuMTY2LS4xNjUuNDM0IDAgLjZsLjYuNmMuMTY2LjE2NS40MzQuMTY1LjYgMGwyLjI4My0yLjI4MyAyLjI4MyAyLjI4M2MuMTY2LjE2NS40MzQuMTY1LjYgMGwuNi0uNmMuMTY1LS4xNjYuMTY1LS40MzQgMC0uNmwtMi4yODItMi4yODJ6Ii8+PC9nPjxyZWN0IHdpZHRoPSIxMyIgaGVpZ2h0PSIxMyIgeD0iLjUiIHk9Ii41IiBmaWxsPSIjRkZGIiBzdHJva2U9IiNDNkNERDMiIHJ4PSIyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDM0NikiLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDM2OSkiPjxyZWN0IHdpZHRoPSIxMyIgaGVpZ2h0PSIxMyIgeD0iLjUiIHk9IjEuMTI1IiBmaWxsPSIjRkZGIiBzdHJva2U9IiMyNTlFQzYiIHJ4PSIyIi8+PHBhdGggZmlsbD0iIzI1OUVDNiIgZD0iTTcuNTMgOC40ODdsLTMuNzc1LTMuNi0xLjI1IDEuMzY4IDQuOTQgNS4wMS4wNzUtLjA3NC4yODYuMzM1IDguNjk0LTEwLjRMMTUuMDk0IDAgNy41MyA4LjQ4N3oiLz48L2c+PHBhdGggZmlsbD0iIzUzNUM2QSIgZD0iTTE2LjE3OCAyMjcuNDM4bC00LjQ4LTQuNDhjLjU5LS45MTcuOTM2LTIuMDE3LjkzNi0zLjE5OCAwLTMuMjgtMi42NjgtNS45NDctNS45NDctNS45NDctMy4yOCAwLTUuOTQ3IDIuNjY3LTUuOTQ3IDUuOTQ3IDAgMy4yOCAyLjY2OCA1Ljk0NyA1Ljk0NyA1Ljk0NyAxLjI4MyAwIDIuNDY1LS40MDcgMy40NDItMS4xbDQuNDQgNC40NGMuMjIyLjIyNC41Ny4yMjQuNzkyIDBsLjgzNS0uODM1Yy4yMDQtLjIwNC4yMDQtLjU1LS4wMi0uNzc0em0tMTQuNS03LjY1OGMwLTIuNzcgMi4yNC01LjAxIDUuMDEtNS4wMSAyLjc3IDAgNS4wMSAyLjI0IDUuMDEgNS4wMSAwIDIuNzctMi4yNCA1LjAxLTUuMDEgNS4wMS0yLjc3IDAtNS4wMS0yLjI0LTUuMDEtNS4wMXoiLz48L2c+PC9zdmc+) 0 -312px no-repeat;
		transition: opacity .3s;
		opacity: 0;
	}
	
	.main-ui-control:hover .main-ui-control-custom-value-delete-item,
	.main-ui-control-field:hover .main-ui-control-custom-value-delete-item {
		opacity: 1;
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
		background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIzODUiIHZpZXdCb3g9IjAgMCAxOCAzODUiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZmlsbD0iIzUzNUM2OSIgZD0iTTUuMDY1IDQuNjgyTDIuMzc3IDEuOTk0IDEuMDEgMy4zNjIgMy42OTYgNi4wNS45OSA4Ljc1N2wxLjM2OCAxLjM3IDIuNzA4LTIuNzEgMi43IDIuNzAzIDEuMzctMS4zNjhMNi40MzMgNi4wNWwyLjY4Mi0yLjY4Mkw3Ljc0OCAyIDUuMDY1IDQuNjgyeiIvPjxnIGZpbGw9IiM3MTdBODQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMjgpIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMiIgcng9IjEiLz48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMiIgeT0iNCIgcng9IjEiLz48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMiIgeT0iOCIgcng9IjEiLz48L2c+PHBhdGggZmlsbD0iIzUyNUM2OCIgZD0iTS42NjcgNjEuNDE1TDAgNjRsMi40NDQtLjc2NWMtLjE1Mi0uNDE3LS4zNzYtLjc5Ny0uNjYtMS4xMi0uMzE4LS4zMjUtLjctLjU2My0xLjExNy0uN3ptNS40MDctNS45NjNsLTQuNzggNS4yMTNjLjM5Ny4yMDguNzY1LjQ3NCAxLjA5NC43OTIuMjcuMzQzLjQ5Ni43MjUuNjcgMS4xMzVsNC43NzctNS4yMWMtLjE4NS0uNDQ3LS40MzctLjg1Ny0uNzQ2LTEuMjEzLS4yOTYtLjMwNi0uNjQtLjU0OC0xLjAxOC0uNzE1bC4wMDItLjAwM3ptMi43MzMtMS4wNTdjLS4yNDItLjI2LS41Ny0uNDAzLS45MS0uMzk1LS4zMzguMDA4LS42Ni4xNjUtLjg5Mi40MzVsLS4yODcuMzEzYy4zODIuMTc3LjczMi40MjggMS4wMzMuNzQuMzA0LjM0OC41NS43NS43MzIgMS4xODdsLjI4OC0uMzE0Yy4yNDgtLjI1Mi4zOS0uNjA0LjM5OC0uOTc0LjAwNi0uMzctLjEyNS0uNzI4LS4zNjQtLjk5aC4wMDN6Ii8+PHBhdGggZmlsbD0iIzIxMjEyMSIgZD0iTTYgODV2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6Ii8+PHBhdGggZmlsbD0iIzUzNUM2OCIgZD0iTTEwLjEzIDE4OS45ODhsLTIuNTctMi43NmMtLjE4Ni0uMTk4LS40NTQtLjI3NC0uNzA1LS4yLS4yNTIuMDcyLS40NDcuMjg0LS41MTQuNTUzLS4wNjUuMjcuMDA4LjU1OC4xOTIuNzU0bC41MjUuNTYyLTQuMTMgMy4yOTItLjUxNi0uNTU0Yy0uMjgzLS4zLS43NC0uMy0xLjAyNSAwLS4yODIuMzA4LS4yODIuOCAwIDEuMTA4bDEuNTczIDEuNjg1LTIuOTAyIDMuMzIzYy0uMDM2LjAzOC0uMDU2LjA5LS4wNTYuMTQzIDAgLjA1My4wMi4xMDUuMDU2LjE0Mi4wNzMuMDcuMTg1LjA3LjI1OCAwbDMuMTAyLTMuMTI1IDEuNTczIDEuNjg1Yy4xOC4yMDIuNDUuMjgzLjcwNC4yMS4yNTQtLjA3LjQ1Mi0uMjgyLjUxOC0uNTU0LjA2Ny0uMjctLjAwOC0uNTYtLjE5Ny0uNzU1bC0uNTE3LS41NTMgMy4wNzMtNC40MjQuNTMyLjU3Yy4yODUuMy43NDIuMyAxLjAyNyAwIC4xMzctLjE0NS4yMTUtLjM0My4yMTUtLjU1IDAtLjIwNy0uMDc4LS40MDUtLjIxNi0uNTV6Ii8+PHBhdGggZmlsbD0iIzUzNUM2OSIgZD0iTTEwLjIzOCAxMjAuNzU0di0xLjI3SDguODg1Yy0uMDg1LS41OTItLjM0LTEuMS0uNjc3LTEuNjA3bC43Ni0uNzYyLS44NDUtLjg0Ni0uODQ2Ljc2Yy0uNDIzLS4zMzgtLjkzLS41OTItMS41MjMtLjY3NlYxMTVoLTEuMjd2MS4zNTRjLS41OTIuMDg0LTEuMS4zMzgtMS42MDcuNjc3bC0uNzYyLS43Ni0uODQ2Ljg0NS43Ni43NjJjLS4zMzguNTA4LS41OTIgMS4wMTUtLjY3NiAxLjYwOEgwdjEuMjdoMS4zNTRjLjA4NC41OS4zMzggMS4xLjY3NyAxLjUyMmwtLjc2Ljg0Ni45My45My43NjItLjc2Yy40MjMuMzM4IDEuMDE1LjU5MiAxLjYwNy42NzZ2MS4zNTNoMS4yNjh2LTEuMzU0Yy41OTMtLjA4NSAxLjEtLjM0IDEuNjA4LS42NzhsLjc2Mi43NjIuOTMtLjkzLS45My0uODQ3Yy4zMzgtLjQyMy41MDctMS4wMTUuNjc3LTEuNjA4aDEuMzUzdi4wODR6bS03LjQ0Ni0uNTkyYzAtMS4yNyAxLjAxNi0yLjM3IDIuMzctMi4zNyAxLjI3IDAgMi4zNyAxLjAxNiAyLjM3IDIuMzcgMCAxLjI3LTEuMDE3IDIuMzctMi4zNyAyLjM3LTEuMzU0LS4wODYtMi4zNy0xLjEtMi4zNy0yLjM3eiIvPjxwYXRoIGZpbGw9IiMyMTIxMjEiIGQ9Ik0xMC4yMzggMTU1Ljc1NHYtMS4yN0g4Ljg4NWMtLjA4NS0uNTkyLS4zNC0xLjEtLjY3Ny0xLjYwN2wuNzYtLjc2Mi0uODQ1LS44NDYtLjg0Ni43NmMtLjQyMy0uMzM4LS45My0uNTkyLTEuNTIzLS42NzZWMTUwaC0xLjI3djEuMzU0Yy0uNTkyLjA4NC0xLjEuMzM4LTEuNjA3LjY3N2wtLjc2Mi0uNzYtLjg0Ni44NDUuNzYuNzYyYy0uMzM4LjUwOC0uNTkyIDEuMDE1LS42NzYgMS42MDhIMHYxLjI3aDEuMzU0Yy4wODQuNTkuMzM4IDEuMS42NzcgMS41MjJsLS43Ni44NDYuOTMuOTMuNzYyLS43NmMuNDIzLjMzOCAxLjAxNS41OTIgMS42MDcuNjc2djEuMzUzaDEuMjY4di0xLjM1NGMuNTkzLS4wODUgMS4xLS4zNCAxLjYwOC0uNjc4bC43NjIuNzYyLjkzLS45My0uOTMtLjg0N2MuMzM4LS40MjMuNTA3LTEuMDE1LjY3Ny0xLjYwOGgxLjM1M3YuMDg0em0tNy40NDYtLjU5MmMwLTEuMjcgMS4wMTYtMi4zNyAyLjM3LTIuMzcgMS4yNyAwIDIuMzcgMS4wMTYgMi4zNyAyLjM3IDAgMS4yNy0xLjAxNyAyLjM3LTIuMzcgMi4zNy0xLjM1NC0uMDg2LTIuMzctMS4xLTIuMzctMi4zN3oiLz48cGF0aCBmaWxsPSIjNTM1QzY5IiBkPSJNMTEuNTA2IDI0NC41Yy4xODQgMCAuMzYtLjA3NC40OS0uMjA1LjEzLS4xMy4yMDQtLjMwNy4yMDQtLjQ5di0xLjA0M2MwLS4zODMtLjMxLS42OTQtLjY5NC0uNjk0LS4zODMgMC0uNjk0LjMxLS42OTQuNjk0djEuMDQyYzAgLjE4NC4wNzMuMzYuMjAzLjQ5LjEzLjEzMi4zMDcuMjA1LjQ5LjIwNXptLTcgLjA3Yy40MDYgMCAuNzM1LS4zMy43MzUtLjczNXYtMS4xYzAtLjQwNi0uMzI4LS43MzUtLjczNC0uNzM1LS40MDYgMC0uNzM1LjMzLS43MzUuNzM1djEuMWMwIC40MDYuMzMuNzM1LjczNi43MzV6bTkuNjUyLTEuMDM3aC0xLjE1MnYuNWMwIC44MjgtLjY3IDEuNS0xLjUgMS41LS44MjggMC0xLjUtLjY3Mi0xLjUtMS41di0uNWgtNHYuNWMwIC44MjgtLjY3IDEuNS0xLjUgMS41LS44MjggMC0xLjUtLjY3Mi0xLjUtMS41di0uNUgxLjg1NGMtLjUxNyAwLTEuMDEyLjIxNC0xLjM2My41OTUtLjM1LjM4LS41MjYuODktLjQ4NCAxLjQwNXYxMGMwIC41NTIuNDQ4IDEgMSAxaDE0Yy41NTIgMCAxLS40NDggMS0xdi0xMGMuMDItMS4wNTQtLjc5NS0xLjkzNi0xLjg0OC0yem0tLjE1MiAxMWgtMTJ2LTdoMTJ2N3pNNS4zNCAyNTEuMzRjLS40MDIuMzQ3LS43NTcuNzQyLTEuMDYgMS4xNzctLjE3My4yODUtLjI4Mi42MDYtLjMyLjkzOGgzLjI5NnYtLjg3M0g1LjM5Yy4wNTQtLjA5My4xMTgtLjE4LjE5LS4yNi4wOC0uMDkuMjY4LS4yNy41NjUtLjU0My4yMi0uMTk0LjQyNi0uNDAzLjYxNS0uNjI3LjE1NS0uMTkuMjgyLS40LjM3Ny0uNjI2LjA4LS4yLjEyLS40MTUuMTItLjYzLjAwNy0uMzctLjE0NS0uNzI1LS40MTctLjk3NC0uMzE0LS4yNzUtLjcyMy0uNDE1LTEuMTQtLjM5LS4zOTQtLjAxNS0uNzguMTA0LTEuMS4zMzYtLjMyMi4yOC0uNTEyLjY4NS0uNTI1IDEuMTEzbC45My4wOTRjLS4wMDQtLjIxNC4wNjctLjQyMi4yLS41OS4yNjgtLjIzMi42NjQtLjIzNS45MzUtLjAwNy4xMi4xMy4xODIuMzA2LjE3LjQ4My0uMDA3LjIwNy0uMDc3LjQwOC0uMi41NzUtLjIzNC4yOS0uNDkyLjU2LS43Ny44MDh2LS4wMDV6bTQuNzA2IDIuMTE1aC45MXYtLjk4N2guNjF2LS44MjJoLS42MXYtMy4xMWgtLjc5TDguMDQgMjUxLjY1di44MjJoMi4wMDZ2Ljk4Ny0uMDA1em0tMS4xMjctMS44MTNsMS4xMjYtMS42NzZ2MS42OEg4Ljkydi0uMDA0eiIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMjc2KSI+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjkiIGZpbGw9IiM1RTY2NzQiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMTAuMTc0IDguOTczbDIuMjg0LTIuMjgzYy4xNjUtLjE2Ni4xNjUtLjQzNCAwLS42bC0uNi0uNmMtLjE2Ni0uMTY1LS40MzQtLjE2NS0uNiAwTDguOTc1IDcuNzcyIDYuNjkgNS40OWMtLjE2Ni0uMTY2LS40MzQtLjE2Ni0uNiAwbC0uNi42Yy0uMTY1LjE2NS0uMTY1LjQzMyAwIC42TDcuNzczIDguOTcgNS40OSAxMS4yNTVjLS4xNjUuMTY2LS4xNjUuNDM0IDAgLjZsLjYuNmMuMTY2LjE2NS40MzQuMTY1LjYgMGwyLjI4My0yLjI4MyAyLjI4MyAyLjI4M2MuMTY2LjE2NS40MzQuMTY1LjYgMGwuNi0uNmMuMTY1LS4xNjYuMTY1LS40MzQgMC0uNmwtMi4yODItMi4yODJ6Ii8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMzEyKSI+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjkiIGZpbGw9IiM1RTY2NzQiIG9wYWNpdHk9Ii41MDEiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMTAuMTc0IDguOTczbDIuMjg0LTIuMjgzYy4xNjUtLjE2Ni4xNjUtLjQzNCAwLS42bC0uNi0uNmMtLjE2Ni0uMTY1LS40MzQtLjE2NS0uNiAwTDguOTc1IDcuNzcyIDYuNjkgNS40OWMtLjE2Ni0uMTY2LS40MzQtLjE2Ni0uNiAwbC0uNi42Yy0uMTY1LjE2NS0uMTY1LjQzMyAwIC42TDcuNzczIDguOTcgNS40OSAxMS4yNTVjLS4xNjUuMTY2LS4xNjUuNDM0IDAgLjZsLjYuNmMuMTY2LjE2NS40MzQuMTY1LjYgMGwyLjI4My0yLjI4MyAyLjI4MyAyLjI4M2MuMTY2LjE2NS40MzQuMTY1LjYgMGwuNi0uNmMuMTY1LS4xNjYuMTY1LS40MzQgMC0uNmwtMi4yODItMi4yODJ6Ii8+PC9nPjxyZWN0IHdpZHRoPSIxMyIgaGVpZ2h0PSIxMyIgeD0iLjUiIHk9Ii41IiBmaWxsPSIjRkZGIiBzdHJva2U9IiNDNkNERDMiIHJ4PSIyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDM0NikiLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDM2OSkiPjxyZWN0IHdpZHRoPSIxMyIgaGVpZ2h0PSIxMyIgeD0iLjUiIHk9IjEuMTI1IiBmaWxsPSIjRkZGIiBzdHJva2U9IiMyNTlFQzYiIHJ4PSIyIi8+PHBhdGggZmlsbD0iIzI1OUVDNiIgZD0iTTcuNTMgOC40ODdsLTMuNzc1LTMuNi0xLjI1IDEuMzY4IDQuOTQgNS4wMS4wNzUtLjA3NC4yODYuMzM1IDguNjk0LTEwLjRMMTUuMDk0IDAgNy41MyA4LjQ4N3oiLz48L2c+PHBhdGggZmlsbD0iIzUzNUM2QSIgZD0iTTE2LjE3OCAyMjcuNDM4bC00LjQ4LTQuNDhjLjU5LS45MTcuOTM2LTIuMDE3LjkzNi0zLjE5OCAwLTMuMjgtMi42NjgtNS45NDctNS45NDctNS45NDctMy4yOCAwLTUuOTQ3IDIuNjY3LTUuOTQ3IDUuOTQ3IDAgMy4yOCAyLjY2OCA1Ljk0NyA1Ljk0NyA1Ljk0NyAxLjI4MyAwIDIuNDY1LS40MDcgMy40NDItMS4xbDQuNDQgNC40NGMuMjIyLjIyNC41Ny4yMjQuNzkyIDBsLjgzNS0uODM1Yy4yMDQtLjIwNC4yMDQtLjU1LS4wMi0uNzc0em0tMTQuNS03LjY1OGMwLTIuNzcgMi4yNC01LjAxIDUuMDEtNS4wMSAyLjc3IDAgNS4wMSAyLjI0IDUuMDEgNS4wMSAwIDIuNzctMi4yNCA1LjAxLTUuMDEgNS4wMS0yLjc3IDAtNS4wMS0yLjI0LTUuMDEtNS4wMXoiLz48L2c+PC9zdmc+) 0 -276px no-repeat;
		transition: opacity .3s;
		opacity: 0;
	}
	
	.main-ui-control-custom-value-delete:hover .main-ui-control-custom-value-delete-item:after {
		opacity: 1;
	}
	
	
	.main-ui-hide {
		display: none;
	}
	
	.main-ui-select-custom-inner-item {
		margin-bottom: 0;
	}
	
	.main-ui-select-custom-inner-item.main-ui-select-custom-inner-item-selected {
		background: #f3f6f8;
	}
	
	.popup-select-content .main-ui-select-custom-inner-item,
	.popup-multiselect-content .main-ui-select-custom-inner-item {
		padding-left: 10px;
		padding-right: 10px;
		position: relative;
	}
	
	.main-ui-select-custom-inner-item.main-ui-select-custom-inner-item-selected {
		background: #f3f6f8;
	}
	
	.main-ui-control-custom.main-ui-select-custom .main-ui-square-search,
	.main-ui-control-custom.main-ui-select-custom .main-ui-square-search-item {
		position: absolute !important;
		opacity: 0 !important;
		width: 1px !important;
		height: 1px !important;
		padding: 0 !important;
		margin: 0 !important;
	}
	
	 .main-ui-control-custom.main-ui-multi-select .main-ui-square-search {
		position: relative;
	}
	
	.main-ui-control-custom.main-ui-multi-select .main-ui-square-search::before {
		display: inline-block;
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
	}
	
	.main-ui-control-custom.main-ui-multi-select {
		user-select: none;
	}
	
	.main-ui-square {
		box-sizing: border-box;
	}
	
	.main-ui-select-custom-inner-item.main-ui-select-custom-inner-item-legend {
		margin-top: 6px;
		padding-left: 10px;
		font-weight: var(--ui-font-weight-bold);
		cursor: default;
		border-bottom: none;
	}
	
	.main-ui-select-custom-inner-item.main-ui-select-custom-inner-item-legend .main-ui-select-custom-inner-item-element {
		height: 28px;
		line-height: 28px;
		margin-top: 2px;
	}
	
	.main-ui-select-custom-inner-item.main-ui-select-custom-inner-item-legend:hover {
		background: inherit;
	}
	
	.main-ui-select-custom-inner-item.main-ui-select-custom-inner-item-legend .main-ui-select-custom-inner-label::before {
		display: none;
	}
	
	.bx-mac .main-ui-mac-scroll::-webkit-scrollbar {
		width: 7px;
	}
	
	.bx-mac .main-ui-mac-scroll::-webkit-scrollbar-thumb {
		border-radius: 4px;
		background-color: rgba(0,0,0,.5);
	}
	
	.popup-select-content .main-ui-checked {
		background: #f3f6f8;
		font-weight: var(--ui-font-weight-bold);
	}
	
	.main-ui-popup-show-animation {
		animation: popupShowAnimation 200ms;
		animation-fill-mode: both;
	}
	
	.main-ui-popup-close-animation {
		animation: popupCloseAnimation 200ms;
		animation-fill-mode: both;
	}
	
	.main-ui-popup-fast-show-animation {
		animation: popupShowAnimation 150ms;
		animation-delay: 10ms;
		animation-fill-mode: both;
	}
	
	.main-ui-popup-fast-close-animation {
		animation: popupCloseAnimation 150ms;
		animation-fill-mode: both;
	}
	
	.main-ui-square.main-ui-square-selected {
		box-shadow: inset 0 0 0 2px #3BB4E3;
	}
	
	.main-ui-control-custom.main-ui-select-custom,
	.main-ui-control-custom.main-ui-multi-select {
		padding: 3px 50px 3px 3px;
		height: auto;
		min-height: 38px;
		background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI1IDE2Ij4gIDxwb2x5Z29uIGZpbGw9IiM1MzVDNjkiIGZpbGwtcnVsZT0iZXZlbm9kZCIgcG9pbnRzPSIzLjU0NiA3LjQyNSAzLjU0NiAxLjYwNyAxLjYwNyAxLjYwNyAxLjYwNyA4LjM5NCAxLjYwNyA5LjM2NCA5LjM2NCA5LjM2NCA5LjM2NCA3LjQyNSIgdHJhbnNmb3JtPSJyb3RhdGUoLTQ1IDkuOSAxLjY1NykiLz48L3N2Zz4=);
		background-repeat: no-repeat;
		background-position: right center;
		color: #535c69;
		box-sizing: border-box;
		appearance: none;
	}
	
	.main-ui-control-custom.main-ui-multi-select {
		display: table;
		padding-bottom: 0;
	}
	
	.main-ui-control-custom.main-ui-select-custom {
		min-height: 38px;
	}
	
	.main-ui-select-custom-name {
		display: flex;
		user-select: none;
			flex-direction: row;
			flex-wrap: nowrap;
		line-height: 30px;
		gap: 2px;
		vertical-align: middle;
		overflow: hidden;
		white-space: nowrap;
		text-wrap: nowrap;
		text-overflow: ellipsis;
	}
	
	
	.main-ui-select-custom-inner {
		padding: 6px;
		margin: 1px 0 0 0;
		box-shadow: 0 6px 21px 0 rgba(0,0,0,0.15);
		max-height: 177px;
		overflow: auto;
	}
	
	.main-ui-select-custom-inner-item {
		padding: 0 6px 0 3px;
		min-height: 33px;
		font: 14px/33px var(--ui-font-family-primary, var(--ui-font-family-helvetica));
		color: #80868e;
		transition: background .3s;
		cursor: pointer;
	}
	
	.main-ui-select-custom-inner-item:last-child {
		margin: 0;
	}
	
	.main-ui-select-custom-inner-item:hover {
		background: #f3f6f8;
	}
	
	.main-ui-select-custom-inner-item.color1 {
		background: #d5f8fc;
		cursor: default;
	}
	
	.main-ui-select-custom-inner-item.color2 {
		background: #f0f7ca;
		cursor: default;
	}
	
	.popup-multiselect-content {
		padding: 6px;
		max-height: 200px;
			overflow-y: overlay;
	}
	
	.popup-select-content {
		overflow: hidden;
		max-height: 200px;
			overflow-y: overlay;
		padding: 6px 0;
	}
	
	.popup-select-content .main-ui-select-custom-inner-item {
		border-bottom: 3px solid #fff;
	}
	
	.popup-multiselect-content .main-ui-select-custom-inner-item {
		margin: 0;
		padding: 0;
	}
	
	.popup-multiselect-content .main-ui-select-custom-inner-item:last-child,
	.popup-select-content .main-ui-select-custom-inner-item:last-child {
		margin: 0;
		border-bottom: 0;
	}
	
	.main-ui-square-container {
		display: block;
	}
	
	.main-ui-square {
		position: relative;
		display: inline-block;
		float: left;
		padding: 0 30px 0 13px;
		/* margin: 0 3px 3px 0; */
		height: 30px;
		border-radius: 2px;
		background: #bcedfc;
		font: 15px/30px var(--ui-font-family-primary, var(--ui-font-family-helvetica));
		vertical-align: middle;
		transition: background 0.2s linear;
		z-index: 2;
		margin-bottom: 0px;
	}
	
	.main-ui-square-item {
		display: inline-block;
		max-width: 250px;
		color: #333;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.main-ui-square-delete {
		height: 30px;
		width: 25px;
		background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2210%22%20height%3D%2210%22%20viewBox%3D%220%200%2010%2010%22%3E%3Cpath%20fill%3D%22%23535C69%22%20fill-rule%3D%22evenodd%22%20d%3D%22M5.065%203.682L2.377.994%201.01%202.362%203.696%205.05.99%207.757l1.368%201.37%202.708-2.71%202.7%202.703%201.37-1.368-2.702-2.7%202.682-2.684L7.748%201%205.065%203.682z%22/%3E%3C/svg%3E');
		background-repeat: no-repeat;
		background-position: center;
	}
	
	.main-ui-square-search {
		display: inline-block;
		padding: 0 0 0 5px;
		height: 30px;
		float: left;
	}
	
	.main-ui-square-search-item {
		width: 1px;
		padding: 0;
		height: 30px;
		border: none;
		font: 15px/30px var(--ui-font-family-primary, var(--ui-font-family-helvetica));
		box-sizing: border-box;
		letter-spacing: 10px;
	}
	
	.main-ui-select-custom .main-ui-control-custom-value-delete,
	.main-ui-multi-select .main-ui-control-custom-value-delete {
		right: 25px;
		top: 50%;
		height: -webkit-calc(100% - 2px);
		height: calc(100% - 2px);
		transform: translate(0,-50%);
	}
	
	.main-ui-multi-select .main-ui-control-custom-value-delete-item,
	.main-ui-select-custom .main-ui-control-custom-value-delete-item {
		top: 50%;
		transform: translate(0,-50%);
	}
	
	.main-ui-control-custom.main-ui-disable{
		background-color: var(--ui-field-color-disabled);
		cursor: not-allowed;
	}
	
	.main-ui-control-custom.main-ui-disable .main-ui-select-custom-name{
		color: #808081;
		cursor: not-allowed;
	}
	
	.main-ui-select-custom-inner-label {
		display: inline-block;
		position: relative;
		line-height: 21px;
		padding-left: 28px;
		padding-top: 6px;
		padding-bottom: 6px;
	}
	
	.main-ui-select-custom-inner-label:before {
		content: '';
		display: inline-block;
		position: absolute;
		top: 9px;
		left: 4px;
		height: 15px;
		width: 18px;
		background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2014%2014%22%3E%3Crect%20width%3D%2213%22%20height%3D%2213%22%20x%3D%22.5%22%20y%3D%22.5%22%20fill%3D%22%23FFF%22%20fill-rule%3D%22evenodd%22%20stroke%3D%22%23C6CDD3%22%20rx%3D%222%22/%3E%3C/svg%3E');
		background-repeat: no-repeat;
		background-position: center;
		vertical-align: middle;
	}
	
	.main-ui-checked .main-ui-select-custom-inner-label:before {
		background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2217%22%20height%3D%2215%22%20viewBox%3D%220%200%2017%2015%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Crect%20width%3D%2213%22%20height%3D%2213%22%20x%3D%22.5%22%20y%3D%221.125%22%20fill%3D%22%23FFF%22%20stroke%3D%22%23259EC6%22%20rx%3D%222%22/%3E%3Cpath%20fill%3D%22%23259EC6%22%20d%3D%22M7.53%208.487l-3.775-3.6-1.25%201.368%204.94%205.01.075-.074.286.335%208.694-10.4L15.094%200%207.53%208.487z%22/%3E%3C/g%3E%3C/svg%3E');
		background-repeat: no-repeat;
		background-position: 2px 0;
	}
	
	.main-ui-item-icon-block {
		position: absolute;
		top: 0;
		right: 3px;
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		justify-content: center;
		padding: 0 5px;
		height: 39px;
		width: 60px;
		box-sizing: border-box;
	}
	
	.main-ui-item-icon {
		position: absolute;
		right: 0;
		top: 0;
		width: 20px;
		height: 100%;
		transition: opacity .3s ease;
		opacity: .3;
		cursor: pointer;
	}
	
	.main-ui-item-icon:hover {
		opacity: 1;
	}
	
	.main-ui-focus {
		border-color: var(--ui-field-color-primary);
	}
	
	.main-ui-placeholder{
		color: #757575;
		padding: 0 7px;
	}
	
	
	@keyframes popupShowAnimation {
		0% {
			opacity: 0;
			transform: translate3d(0,5px,0);
		}
		100% {
			opacity: 1;
			transform: translate3d(0,0px,0);
		}
	}
	
	@keyframes popupCloseAnimation {
		0% {
			opacity: 1;
			transform: translate3d(0,0px,0);
		}
		100% {
			opacity: 0;
			transform: translate3d(0,25px,0);
		}
	}
	</style>