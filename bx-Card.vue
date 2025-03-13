<template>
<div class="crm-entity-card-container-content">
    <div class="ui-entity-editor-section">
        <div class="ui-entity-editor-section-header">
            <div class="ui-entity-editor-header-title">
                <slot v-if="$slots[`header`]" name="header" />
                <span v-else class="ui-entity-editor-header-title-text">{{title}}</span>
            </div>
            <div v-if="headerButton!=null" class="ui-entity-editor-header-actions">
                <span @click="headerButton.handlerFn" class="ui-entity-editor-header-edit-lnk">{{ headerButton.label }}</span>
            </div>
        </div>
        <div class="ui-entity-editor-section-content ui-entity-editor-section-content-padding-right">
            <div class="ui-entity-editor-content-block">
                <slot name="body" />
            </div>
            <div class="ui-entity-card-content-actions-container">
                <div class="ui-entity-card-content-actions-block">
                    <slot name="footer" />
                </div>
            </div>
        </div>
    </div>
</div>
</template>
<script setup lang="ts">

const props=withDefaults(defineProps<{
    title?:string,
    headerButton?:{label:string, handlerFn:() => void}|null
}>(),{
    headerButton:null,
    title:'Заголовок'
});

</script>
<style scoped>
.ui-entity-editor-header-edit-lnk:hover {
	border-bottom-color: #6a6f75;
	color: #6a6f75;
	opacity: 1;
}

.ui-entity-editor-header-edit-lnk {
    position: relative;
    display: inline-block;
    margin-left: 8px;
    white-space: normal;
    border-bottom: 1px dashed transparent;
    color: #333;
    text-transform: lowercase;
    letter-spacing: .2px;
    font-weight: normal;
    font-size: 13px;
    line-height: 14px;
    opacity: .5;
    cursor: pointer;
    transition: 300ms all ease;
    order: 2;
    word-break: keep-all;
}

.crm-entity-card-container-content .ui-entity-editor-section, .crm-entity-card-container-content .ui-entity-editor-section-edit {
    border-radius: var(--ui-entity-editor-section-border-radius, var(--ui-border-radius-md, 1px));
    padding: 0 15px;
}
.ui-entity-editor-section, .ui-entity-editor-section-edit {
    position: relative;
    box-sizing: border-box;
    margin-bottom: 15px;
    border-radius: var(--ui-entity-editor-section-border-radius, var(--ui-border-radius-md, 1px));
    padding: 0 20px;
    background-color: #f9fafb;
    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, .04);
    transition: background-color 250ms linear, opacity 250ms linear;
}

.crm-entity-card-container-content .ui-entity-editor-header-title-text {
    display: inline;
    word-wrap: break-word;
    text-transform: uppercase;
    font: 11px / 23px var(--ui-font-family-secondary, var(--ui-font-family-open-sans));
    font-weight: var(--ui-font-weight-semi-bold, 600);
}
.ui-entity-editor-header-title-text {
    display: inline-block;
    height: 23px;
    color: #525c69;
    vertical-align: middle;
    text-transform: none;
    font: 400 18px / 24px var(--ui-font-family-primary, var(--ui-font-family-helvetica));
}

.crm-entity-card-container-content .ui-entity-editor-section-header {
    padding: 11px 0;
}
.ui-entity-editor-section-header {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    border-bottom: 1px solid #e8ecee;
    margin: 0 auto;
    padding: 15px 0 20px;
    position: relative;
}

.crm-entity-card-container-content .ui-entity-editor-header-title {
    flex: 1;
    overflow: hidden;
}
.ui-entity-editor-header-title {
    width: calc(100% - 30px);
}

.crm-entity-card-container-content .ui-entity-editor-header-actions {
    margin-left: 15px;
}

.ui-entity-editor-header-actions {
    padding: 2px 0;
    transition: 300ms all ease;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
}

.ui-entity-editor-section-content {
    position: relative;
    padding: 15px 0;
    transition: 250ms linear padding, 250ms linear height;
}

.ui-entity-editor-section-content-padding-right > .ui-entity-editor-content-block {
    padding-right: 16px;
}

.ui-entity-editor-content-block {
    color: #424956;
    word-break: break-all;
    word-break: break-word;
    font: 15px / 17px var(--ui-font-family-primary, var(--ui-font-family-helvetica));
}
/* .ui-entity-editor-content-block */
.ui-entity-editor-included-area-container{
    position: relative;
    margin: 0 0 15px;
    transition: 220ms opacity linear;
    box-sizing: border-box;
}

.ui-entity-card-content-actions-container {
    box-sizing: border-box;
    margin: 0;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
}

.ui-entity-editor-content-add-lnk, .ui-entity-editor-content-create-lnk, .ui-entity-editor-content-remove-lnk, .ui-entity-editor-content-remove-lnk-disabled {
    display: inline-block;
    margin: 1px 15px 1px 0;
    border-bottom: 1px dashed;
    color: #80868e;
    text-decoration: none;
    white-space: nowrap;
    font: 13px / 15px var(--ui-font-family-primary, var(--ui-font-family-helvetica));
    cursor: pointer;
    transition: 220ms all ease;
}

</style>