<template>
    <Teleport v-if="popup" :to="popup.teleportId">
    <div
        class="popup-window"
        :id=" !props.outerClick ? 'bx-component-popup-vue' : ''"
        :style="{
        ...popup.style,
        position: 'absolute',
        'z-index': '6000',
            left: (Number(popup.position.x) + (popup.style?.left ? parseFloat(popup.style.left) : 0)) + 'px',
            top: (Number(popup.position.y)+(popup.style?.top ? parseFloat(popup.style.top) : 0)) + 'px',
        }" 
        :data-popupid="popup.popupId"
    >
        <div class="popup-window-content-teleport">
            <slot name="body" v-bind="{popup}" />
        </div>
    </div>
    </Teleport>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { IPosition, PopupLocation} from './globalInterface';

interface IElementPopup{
    type: PopupLocation,
    target: HTMLElement,
    popupId: number,
    teleportId:string,
    data?: any,
    position: IPosition,
    style?: Record<string, unknown> | {},
    class?: Record<string, boolean>| {}
}

interface IAdditionalOptions{
    style?: Record<string, unknown> | {},
    class?: Record<string, boolean>| {},
}

const popup = ref<IElementPopup | null>(null);
const globalClick = ref<HTMLDivElement | null>(document.querySelector('#app'));

const props=withDefaults(defineProps<{
    collision?: boolean,
    outerClick?: boolean,
}>() , {
    outerClick: false,
    collision: true
});

function close(){
    let tag = document.querySelector(`[data-popupid="${popup.value?.popupId}"][data-open='true']`) as HTMLElement;
    if (tag) {
        delete tag.dataset.open;
        delete tag.dataset.popupid;
    }
    popup.value=null;
    globalClick.value?.removeEventListener('mouseup', outerClick);
}

function outerClick(event:MouseEvent){
    let isClickPopup:boolean=false;
    if (props.collision){
        const elementsFromPoint = document.elementsFromPoint(event.clientX, event.clientY);
        isClickPopup = elementsFromPoint.some((el) => (el as HTMLElement).closest('.popup-window#bx-component-popup-vue')); //[data-popupid="'+popup.value?.popupId+'"]
    } else {
        isClickPopup = !!(event.target as HTMLElement).closest('.popup-window#bx-component-popup-vue[data-popupid="'+popup.value?.popupId+'"]');
    }
    let isClickEventTag = !!(event.target as HTMLElement).closest(`[data-popupid="${popup.value?.popupId}"][data-open='true']`);
    
    let clickTouchebale = (event.target as HTMLElement).closest(`[data-touchable="true"]`);

    if (clickTouchebale || isClickPopup || (props.outerClick && !isClickEventTag)) {
        globalClick.value?.addEventListener('mouseup', outerClick, { capture: true, once: true });
		return;
    }

    if (!isClickEventTag) {
        let tag = document.querySelector(`[data-popupid="${popup.value?.popupId}"][data-open='true']`) as HTMLElement;
        if (tag) {
            popup.value=null;
            delete tag.dataset.open;
            delete tag.dataset.popupid;
        }
    }
}

function initPopup(event: MouseEvent, type: PopupLocation, options:IAdditionalOptions = {}, data:any = null){
    let clickArea:HTMLElement = event.currentTarget as HTMLElement;
    let boundingClientRect: DOMRect = clickArea?.getBoundingClientRect();
    let appContainer = event.target instanceof HTMLElement ? event.target.closest('#app, .side-panel-content-container, .popup-window-content-formMain') : null;
    if (boundingClientRect==null || clickArea==null || appContainer==null) return;
    let popupId = Math.floor(Math.random() * 100000000) + 1;

    if(appContainer?.classList.contains('side-panel-content-container')){
        if(appContainer.id==null || appContainer.id=='') appContainer.id='panelContainer-'+Math.floor(Math.random() * 100000000) + 1;
    } else if(appContainer?.classList.contains('popup-window-content-formMain')){
        if(appContainer.id==null || appContainer.id=='') appContainer.id='formMain-'+Math.floor(Math.random() * 100000000) + 1;
    }
    
    if ((clickArea.dataset.popupid && parseInt(clickArea.dataset.popupid) > 0) || popup.value!=null) {
        delete clickArea.dataset.popupid;
        delete clickArea.dataset.open;
        popup.value=null;
        return;
    };
    
    clickArea.dataset.popupid=popupId.toString();
    clickArea.dataset.open='true';

    console.dir(appContainer?.id);
    let result:IElementPopup={ 
        position: { x: 0, y: 0 },
        teleportId: appContainer?.id ? '#'+appContainer.id : '#app',
        type: type,
        target: clickArea,
        popupId: popupId,
        data: data,
        ...options
    };

    const scrollPositionY = appContainer.scrollTop!==null  ? appContainer.scrollTop : window.pageYOffset;
    const scrollPositionX = appContainer.scrollLeft!==null ? appContainer.scrollLeft : window.pageXOffset;
    const appContainerRect = appContainer?.getBoundingClientRect();
    switch (type) {
        case PopupLocation.BOTTOM:
            console.dir([{el:clickArea,rect:boundingClientRect},{el:appContainer,rect:appContainerRect}]);
            result.position.x = (boundingClientRect.x - appContainerRect.x + (appContainer as HTMLElement).offsetLeft) + scrollPositionX;
            result.position.y = (boundingClientRect.top - appContainerRect.top + (appContainer as HTMLElement).offsetTop) + boundingClientRect.height + scrollPositionY;
        break;
        case PopupLocation.CENTER:
            result.position.x = (boundingClientRect.x - appContainerRect.x + (appContainer as HTMLElement).offsetLeft) + scrollPositionX;
            result.position.y = (boundingClientRect.top - appContainerRect.top + (appContainer as HTMLElement).offsetTop) + scrollPositionY;;
        break;
        case PopupLocation.RIGHT:
            result.position.x = (boundingClientRect.x - appContainerRect.x + (appContainer as HTMLElement).offsetLeft) + boundingClientRect.width + scrollPositionX;
            result.position.y = (boundingClientRect.top - appContainerRect.top + (appContainer as HTMLElement).offsetTop) + scrollPositionY;
        break; 
        case PopupLocation.LEFT:(boundingClientRect.x - appContainerRect.x + (appContainer as HTMLElement).offsetLeft)-boundingClientRect.width + scrollPositionX;
            result.position.y = (boundingClientRect.top - appContainerRect.top + (appContainer as HTMLElement).offsetTop) + scrollPositionY;
        break;
    }

    popup.value=result;
    globalClick.value?.addEventListener('mouseup', outerClick, { capture: true, once: true });
}

const isActive = computed(()=>popup.value!=null);

defineExpose({
    initPopup,
    close,
    isActive
});

</script>