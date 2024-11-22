<template>
<div class="main-buttons-box">
    <div class="main-buttons-inner-container">
    <div v-for="(menu, index) in menus" 
        v-bind:key="index" 
        class="main-buttons-item"
        @click="changeSelected(menu, index)"
        v-bind:class="{
            selected: isActive(menu)
        }"
        >
        <a class="main-buttons-item-link">
        <span class="main-buttons-item-text">
            <span class="main-buttons-item-text-title">
            <span class="main-buttons-item-text-box">
                {{ menu[props.titleValue] }}
            </span>
            </span>
        </span>
        </a>
    </div>
    </div>
</div>
</template>
<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue';

const selected = ref<number | null>(null);
const props = withDefaults( defineProps<{
  menus: any[],
  isActive: (menu: any) => boolean,
  titleValue?: string,
}>(),{
   titleValue:'name' 
});

const emit = defineEmits<{
    (e: 'change:selected', element: any, index: number): void,
    (e: 'initialize'): void
}>();

/**
 * Инициализация компонента.
 */
onMounted(() => {
   emit('initialize');
});

/**
 * Изменяет выбранный элемент меню.
 *
 * @param {any} element - Элемент меню, который был выбран.
 * @param {number} index - Индекс выбранного элемента меню.
 */
function changeSelected(element: any, index: number) {
    if (selected.value == index) return;
    selected.value = index;
    emit('change:selected', element, index);
}

</script>

<style scoped>
.main-buttons-inner-container :first-child {
    margin-left: 0px;
}

.main-buttons,
.main-buttons-more-menu-popup,
.main-buttons-menu-popup,
.main-buttons-default-menu-popup, 
.main-buttons-box {
    --mib-height: 60px;
    --mib-background: #fff;
    --mib-item-spacing: 50px;
    --mib-padding-left: 25px;
    --mib-padding-right: 50px;
    --mib-padding-top: 0;
    --mib-padding-bottom: 0;
    --mib-margin-bottom: 8px;

    --mib-menu-underline-size: 0;
    --mib-menu-underline-color: transparent;
    --mib-menu-underline-bottom: 0;

    --mib-item-font-size: 15px;
    --mib-item-font-family: var(--ui-font-family-secondary, var(--ui-font-family-open-sans));
    --mib-item-font-weight: var(--ui-font-weight-semi-bold, 600);
    --mib-item-color: #545c6a;
    --mib-item-active-color: #1058d0;
    --mib-item-hover-color: var(--mib-item-active-color);
    --mib-item-passive-opacity: 0.6;
    --mib-item-underline-size: 2px;
    --mib-item-underline-color: #1058d0;
    --mib-item-underline-bottom: 0;
    --mib-item-hover-underline-size: 0;
    --mib-item-hover-underline-color: transparent;
    --mib-item-link-transition: none;

    --mib-item-super-title-font-size: 8px;
    --mib-item-super-title-color: #2fc6f6;
    --mib-item-super-title-font-family: var(--ui-font-family-secondary, var(--ui-font-family-open-sans));
    --mib-item-super-title-font-weight: var(--ui-font-weight-semi-bold, 600);

    --mib-item-edit-button-opacity: 0.4;
    --mib-item-drag-button-opacity: 0.4;

    --mib-item-edit-button-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6.46068 8.05197C4.94329 8.37468 3.62514 7.05614 3.94791 5.53908C4.10055 4.82172 4.82142 4.1008 5.53879 3.94813C7.05589 3.62523 8.37455 4.94347 8.05177 6.46094C7.88246 7.25682 7.25656 7.88272 6.46068 8.05197ZM9.88625 5.04705C9.81118 4.74015 9.7025 4.44648 9.56145 4.17196C9.55552 4.16041 9.55689 4.14652 9.56505 4.13641L10.2281 3.31431C10.3719 3.13705 10.3654 2.88201 10.2137 2.71095L9.79348 2.23798C9.64115 2.06708 9.38855 2.03094 9.19586 2.15268L8.29225 2.72073C7.90051 2.44703 7.45752 2.24388 6.97985 2.12418C6.96718 2.121 6.95757 2.11066 6.95541 2.09776L6.78217 1.05667C6.74507 0.831731 6.55042 0.666687 6.32193 0.666687H5.68865C5.46062 0.666687 5.2653 0.831731 5.22903 1.05667L5.05483 2.09815C5.05267 2.11101 5.04308 2.12132 5.03043 2.12449C4.64386 2.22137 4.28077 2.37428 3.94816 2.57419C3.93695 2.58092 3.92287 2.58043 3.91222 2.57282L3.07038 1.97202C2.88518 1.8397 2.63079 1.86039 2.46916 2.02168L2.02177 2.4694C1.86048 2.63103 1.83978 2.88543 1.97246 3.07064L2.57467 3.91417C2.58226 3.9248 2.58279 3.93888 2.57607 3.95009C2.3781 4.28013 2.22679 4.64106 2.13001 5.02412C2.12681 5.03677 2.1165 5.04633 2.10365 5.04848L1.05646 5.22335C0.831873 5.26043 0.666504 5.45511 0.666504 5.68361V6.31643C0.666504 6.54491 0.831873 6.73961 1.05646 6.77669L2.10361 6.95155C2.11649 6.95371 2.12681 6.96329 2.12999 6.97595C2.20872 7.28869 2.32086 7.58784 2.46828 7.86631C2.47442 7.87792 2.47313 7.89203 2.46487 7.90226L1.80513 8.71938C1.66176 8.89648 1.66777 9.15168 1.81945 9.32259L2.23937 9.79557C2.3917 9.96678 2.64445 10.0023 2.83715 9.88085L3.73567 9.3164C3.74668 9.30947 3.76072 9.30976 3.77149 9.31705C4.15498 9.57621 4.5876 9.76706 5.05129 9.88085L5.22905 10.9433C5.26532 11.1683 5.46062 11.3334 5.68865 11.3334H6.32193C6.55043 11.3334 6.74507 11.1683 6.78217 10.9434L6.9557 9.90207C6.95786 9.88918 6.96747 9.87886 6.98014 9.87569C7.36171 9.78014 7.72009 9.62994 8.04956 9.43355C8.06077 9.42688 8.0748 9.42741 8.0854 9.43498L8.96312 10.0619C9.148 10.1947 9.40257 10.1738 9.56402 10.012L10.0116 9.56445C10.1727 9.40331 10.1945 9.14906 10.0607 8.9635L9.43592 8.08744C9.42833 8.07681 9.42781 8.06275 9.43453 8.05155C9.63308 7.72039 9.78521 7.35876 9.88145 6.97398C9.88462 6.96131 9.89494 6.95171 9.90781 6.94955L10.9432 6.77666C11.1685 6.73956 11.3332 6.54488 11.3332 6.31639V5.68358C11.3328 5.45511 11.1681 5.26043 10.9429 5.22333L9.88625 5.04705Z' fill='%23525c68'/%3E%3C/svg%3E");
    --mib-item-edit-button-image-white: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6.46068 8.05197C4.94329 8.37468 3.62514 7.05614 3.94791 5.53908C4.10055 4.82172 4.82142 4.1008 5.53879 3.94813C7.05589 3.62523 8.37455 4.94347 8.05177 6.46094C7.88246 7.25682 7.25656 7.88272 6.46068 8.05197ZM9.88625 5.04705C9.81118 4.74015 9.7025 4.44648 9.56145 4.17196C9.55552 4.16041 9.55689 4.14652 9.56505 4.13641L10.2281 3.31431C10.3719 3.13705 10.3654 2.88201 10.2137 2.71095L9.79348 2.23798C9.64115 2.06708 9.38855 2.03094 9.19586 2.15268L8.29225 2.72073C7.90051 2.44703 7.45752 2.24388 6.97985 2.12418C6.96718 2.121 6.95757 2.11066 6.95541 2.09776L6.78217 1.05667C6.74507 0.831731 6.55042 0.666687 6.32193 0.666687H5.68865C5.46062 0.666687 5.2653 0.831731 5.22903 1.05667L5.05483 2.09815C5.05267 2.11101 5.04308 2.12132 5.03043 2.12449C4.64386 2.22137 4.28077 2.37428 3.94816 2.57419C3.93695 2.58092 3.92287 2.58043 3.91222 2.57282L3.07038 1.97202C2.88518 1.8397 2.63079 1.86039 2.46916 2.02168L2.02177 2.4694C1.86048 2.63103 1.83978 2.88543 1.97246 3.07064L2.57467 3.91417C2.58226 3.9248 2.58279 3.93888 2.57607 3.95009C2.3781 4.28013 2.22679 4.64106 2.13001 5.02412C2.12681 5.03677 2.1165 5.04633 2.10365 5.04848L1.05646 5.22335C0.831873 5.26043 0.666504 5.45511 0.666504 5.68361V6.31643C0.666504 6.54491 0.831873 6.73961 1.05646 6.77669L2.10361 6.95155C2.11649 6.95371 2.12681 6.96329 2.12999 6.97595C2.20872 7.28869 2.32086 7.58784 2.46828 7.86631C2.47442 7.87792 2.47313 7.89203 2.46487 7.90226L1.80513 8.71938C1.66176 8.89648 1.66777 9.15168 1.81945 9.32259L2.23937 9.79557C2.3917 9.96678 2.64445 10.0023 2.83715 9.88085L3.73567 9.3164C3.74668 9.30947 3.76072 9.30976 3.77149 9.31705C4.15498 9.57621 4.5876 9.76706 5.05129 9.88085L5.22905 10.9433C5.26532 11.1683 5.46062 11.3334 5.68865 11.3334H6.32193C6.55043 11.3334 6.74507 11.1683 6.78217 10.9434L6.9557 9.90207C6.95786 9.88918 6.96747 9.87886 6.98014 9.87569C7.36171 9.78014 7.72009 9.62994 8.04956 9.43355C8.06077 9.42688 8.0748 9.42741 8.0854 9.43498L8.96312 10.0619C9.148 10.1947 9.40257 10.1738 9.56402 10.012L10.0116 9.56445C10.1727 9.40331 10.1945 9.14906 10.0607 8.9635L9.43592 8.08744C9.42833 8.07681 9.42781 8.06275 9.43453 8.05155C9.63308 7.72039 9.78521 7.35876 9.88145 6.97398C9.88462 6.96131 9.89494 6.95171 9.90781 6.94955L10.9432 6.77666C11.1685 6.73956 11.3332 6.54488 11.3332 6.31639V5.68358C11.3328 5.45511 11.1681 5.26043 10.9429 5.22333L9.88625 5.04705Z' fill='%23FFF'/%3E%3C/svg%3E");
    --mib-item-edit-button-image-opacity: 1;
    --mib-item-edit-button-right: -17px;
    --mib-item-edit-button-top: 3px;

    --mib-item-drag-button-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='14' viewBox='0 0 6 14'%3E%3Cpath fill='%23717A84' fill-rule='evenodd' d='M0 0h2v2H0V0zm0 4h2v2H0V4zm4-4h2v2H4V0zm0 4h2v2H4V4zM0 8h2v2H0V8zm4 0h2v2H4V8zm-4 4h2v2H0v-2zm4 0h2v2H4v-2z'/%3E%3C/svg%3E");
    --mib-item-drag-button-image-white: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='14' viewBox='0 0 6 14'%3E%3Cpath fill='%23FFF' fill-rule='evenodd' d='M0 0h2v2H0V0zm0 4h2v2H0V4zm4-4h2v2H4V0zm0 4h2v2H4V4zM0 8h2v2H0V8zm4 0h2v2H4V8zm-4 4h2v2H0v-2zm4 0h2v2H4v-2z'/%3E%3C/svg%3E");
    --mib-item-drag-button-image-opacity: 1;

    --mib-item-menu-arrow-width: 10px;
    --mib-item-menu-arrow-height: 7px;
    --mib-item-menu-arrow-margin-left: 8px;
    --mib-item-menu-arrow-image: url("data:image/svg+xml,%3Csvg width='10' height='7' viewBox='0 0 10 7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8.74487 0.411011L5.75298 3.4029L4.99922 4.14499L4.25975 3.4029L1.26786 0.411011L0.212108 1.46676L5.00632 6.26098L9.80054 1.46676L8.74487 0.411011Z' fill='%23525C69'/%3E%3C/svg%3E");
    --mib-item-menu-arrow-image-white: url("data:image/svg+xml,%3Csvg width='10' height='7' viewBox='0 0 10 7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8.74487 0.411011L5.75298 3.4029L4.99922 4.14499L4.25975 3.4029L1.26786 0.411011L0.212108 1.46676L5.00632 6.26098L9.80054 1.46676L8.74487 0.411011Z' fill='%23FFF'/%3E%3C/svg%3E");
}

.main-buttons-item .main-buttons-item-text {
    position: relative;
    display: flex;
    align-items: stretch;
}

.main-buttons-box {
    display: flex;
    background: var(--mib-background);
    border-radius: var(--mib-radius);
    height: var(--mib-height);
    padding: var(--mib-padding-top) var(--mib-padding-right) var(--mib-padding-bottom) var(--mib-padding-left);
    margin-bottom: var(--mib-margin-bottom);
}

.main-buttons-item-link {
    position: relative;
    display: flex;
    font-family: var(--mib-item-font-family);
    font-size: var(--mib-item-font-size);
    font-weight: var(--mib-item-font-weight);
    color: var(--mib-item-color);
    outline: 0;
    transition: var(--mib-item-link-transition);
    text-decoration: none;
    vertical-align: middle;
    box-sizing: border-box;
    cursor: pointer;
    text-transform: none;
    white-space: nowrap;
    align-items: stretch;
    user-select: none;
}
.main-buttons-item.selected{
    border-bottom: 2px solid var(--mib-item-underline-color);
}

.main-buttons-item.selected .main-buttons-item-link {
    color:var(--mib-item-active-color);
}


.main-buttons-item-link:hover {
    color: var(--mib-item-hover-color);
}

.main-buttons-item {
    position: relative;
    display: inline-flex;
    margin-left: var(--mib-item-spacing);
    height: var(--mib-height);
    box-sizing: border-box;
    text-decoration: none;

}

.main-buttons-item .main-buttons-item-text-box {
    top: 50%;
    transform: translateY(-50%);
}

.main-buttons-item-text-box {
    position: relative;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
