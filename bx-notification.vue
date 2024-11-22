<template>
        <TransitionGroup name="notify" tag="div" class="ui-notification-balloon ui-notification-balloon-animate" style="position: fixed; top: 1px; right: 0px;">
            <div v-for="(notify,index) in notification.notifications.value" :key="index" class="ui-notification-balloon-content" 
            :class="{
                'ui-notification-balloon-content-error':notify.TYPE=='ERROR', 
                'ui-notification-balloon-content-success':notify.TYPE=='SUCCESS'
            }" 
            style="width: 400px;">
                <div class="ui-notification-balloon-message">{{ notify.MESSAGE }}</div>
                <div class="ui-notification-balloon-actions">
                    <span class="close-btn" @click.prevent="notification.removeNotification(notify)">x</span>
                </div>
            </div>
        </TransitionGroup>
</template>
<script setup lang="ts">
import { useNotification } from './notification';
const notification = useNotification();

</script>
<style scoped>
.notify-enter-active,
.notify-leave-active {
  transition: all 0.5s ease;
}
.notify-enter-from,
.notify-leave-to {
  opacity: 0;
}

/* /bitrix/js/ui/notification/ui.notification.min.css?16698673001796 */
/* Start:/bitrix/js/ui/notification/ui.notification.min.css?16698673001796*/
.ui-notification-balloon {
    display: flex;
    flex-direction: column;
    gap: 5px;
    position: fixed;
    opacity: 0;
    z-index: 9900;
    transform: translateZ(0);
    transition: opacity .25s linear,left .5s ease,top .5s ease,right .5s ease,bottom .5s ease
}

.ui-notification-balloon-animate {
    opacity: .8
}

.ui-notification-balloon-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    background: #000;
    border-radius: 26px;
    font: 13px var(--ui-font-family-primary,var(--ui-font-family-helvetica))
}

.ui-notification-balloon-content.ui-notification-balloon-content-error{
    background: #d73232;
}

.ui-notification-balloon-content.ui-notification-balloon-content-error .close-btn{
    color: #d4d4d4;
}
.ui-notification-balloon-content.ui-notification-balloon-content-error .close-btn:hover{
    color: #fff;
    font-weight: 600;
}

.ui-notification-balloon-message {
    flex: 1;
    color: #fff;
    padding: 14px 16px 14px 25px
}

.ui-notification-balloon-message:empty:before {
    content: "\00a0"
}

.ui-notification-balloon-message a,.ui-notification-balloon-message a:hover {
    color: #fff;
    text-decoration: none;
    border-bottom: 1px solid rgba(255,255,255,0.4)
}

.ui-notification-balloon-message a:hover {
    border-bottom-color: #fff
}

.ui-notification-balloon-actions {
    display: flex;
    align-items: center;
    margin-right: 25px
}
.close-btn{
    cursor: pointer;
}
.close-btn:hover{
    color: #fff;
}


</style>