<template>
<Teleport to="#app">
    <div v-if="showVar" :class="{'side-panel-overlay':disabledBackground}">
        <div  class="popup-window popup-window-with-titlebar ui-entity-editor-content-user-scope-popup popup-window-fixed-width popup-window-fixed-height" id="formMain" 
            :style="{
                display: 'block', 
                position: 'absolute',
                'z-index': '7000 !important', 
                width: props.width,
                left: position.x + 'px',
                top: position.y + 'px',
            }">
            <div @mousedown="startMove($event)" class="popup-window-titlebar" id="popup-window-titlebar-formMain" style="cursor: move;">
                <span class="popup-window-titlebar-text">
                    <b>{{label}}</b>
                </span>
            </div>
            <div class="popup-window-content popup-window-content-formMain" style="">
                <slot name="body"></slot>
            </div>
            <span class="popup-window-close-icon popup-window-titlebar-close-icon" @click="closeDialog"></span>
            <div class="popup-window-buttons">
                <slot name="footer"></slot>
            </div>
        </div>
    </div>            
</Teleport>
</template>
    <script setup lang="ts">
    import { reactive, ref, watch } from 'vue';
import { IPosition, PopupLocation } from './globalInterface';
    
    const model = defineModel();
    const showVar = ref(false);
    const props = withDefaults(defineProps<{
        width?:string,
        label?:string,
        location?:PopupLocation,
        disabledBackground?:boolean,
        draggable?:boolean
    }>(),{
        draggable:false,
        disabledBackground:true,
        location:PopupLocation.CENTER,
        label:'',
        width:'500px'
    });
    const position:IPosition=reactive({
        x:0,
        y:0
    });

    function closeDialog() {
        model.value=false;
    }
    
    function startMove(event:MouseEvent) {
        if (!props.draggable) return;
        const boundingClientRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const offsetX = event.clientX - boundingClientRect.left;
        const offsetY = event.clientY - boundingClientRect.top;
        const fnInstanse = (eventThis:MouseEvent) => {
            position.x = eventThis.clientX-offsetX;
            position.y = eventThis.clientY-offsetY;
        };
        document.body.addEventListener("mousemove", fnInstanse);
        document.body.addEventListener("mouseup",()=>
        document.body.removeEventListener("mousemove",fnInstanse)
        );
    }

    watch(()=> model.value, () => {
      if(model.value===true) {
        document.body.classList.add('disableScreenYScroll');
        switch (props.location) {
            case PopupLocation.CENTER:
                position.x = (window.innerWidth - parseInt(props.width)) / 2;
                position.y = 100;
            break;
            
            case PopupLocation.LEFT:
                position.x = 0;
                position.y = 100;
            break;

            case PopupLocation.RIGHT:
                position.x = window.innerWidth - parseInt(props.width);
                position.y = 100;
            break;

            default:
                position.x = (window.innerWidth - parseInt(props.width)) / 2;
                position.y = 100;
            break;
        }
        showVar.value = true;
      } else {
        document.body.classList.remove('disableScreenYScroll');
        showVar.value = false;
      }
    });
    
    </script>
<style scoped>
.side-panel-overlay{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 8000;
    background-color: rgba(0, 0, 0, .4);
    transform: translateZ(0);
    overflow: hidden;
    display: block;
    pointer-events: auto;
}

.popup-window-close-icon:after {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    -webkit-transform: translate3d(-50%, -50%, 0);
    transform: translate3d(-50%, -50%, 0);
    width: 10px;
    height: 10px;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='10' height='10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8.666.621a.5.5 0 00-.707 0L5.002 3.58 2.044.62a.5.5 0 00-.707 0l-.714.714a.5.5 0 000 .707L3.581 5 .623 7.957a.5.5 0 000 .708l.714.713a.5.5 0 00.707 0L5.002 6.42l2.957 2.958a.5.5 0 00.708 0l.713-.714a.5.5 0 000-.707L6.422 5 9.38 2.042a.5.5 0 000-.707L8.666.62z' fill='%23828b95'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-size: cover;
    content: "";
}

.ui-entity-editor-content-user-scope-popup .popup-window-buttons, .ui-entity-editor-content-user-scope-popup--alert .popup-window-buttons {
    padding: 17px 0;
}
.popup-window-buttons {
    text-align: center;
    padding: 20px 0 10px;
    position: relative;
}

.popup-window-titlebar-text, .popup-window-titlebar-text-version {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: #80868e;
    display: inline-block;
    font-size: 12px;
    font-weight: var(--ui-font-weight-bold);
    max-width: 100%;
    padding: 5px 30px 20px 4px;
    user-select: none;
    -o-text-overflow: ellipsis;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.popup-window-with-titlebar .popup-window-content {
    padding: 20px;
}
.popup-window-with-titlebar .popup-window-content, .popup-window-content-gray .popup-window-content {
    background-color: #eef2f4;
}

.popup-window-content.popup-window-content-formMain {
    max-height: 500px;
    overflow-y: scroll;
}

.popup-window-content {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    border-radius: var(--popup-window-content-border-radius);
    scrollbar-width: thin;
    scrollbar-color: var(--popup-window-scrollbar-thumb-background, rgba(82, 92, 105, 0.2));
}

.popup-window-close-icon {
    cursor: pointer;
    height: 27px;
    outline: none;
    opacity: 0.5;
    position: absolute;
    right: 3px;
    top: 5px;
    width: 27px;
    -webkit-transition: opacity 0.2s linear;
    -o-transition: opacity 0.2s linear;
    transition: opacity 0.2s linear;
}

</style>