<template>
    <div class="ui-entity-editor-content-block ui-entity-editor-field-text">
      <div class="ui-entity-editor-block-before-action"></div>
      <div class="ui-entity-editor-block-title ui-entity-widget-content-block-title-edit">
        <label class="ui-entity-editor-block-title-text">
          {{ label }} <span v-if="required" style="color: rgb(255, 0, 0)">*</span>
        </label>
      </div>
      <div :class="{'ui-tile-uploader': true, 'ui-tile-uploader --drag-over': isDragOver}">
        <div class="ui-tile-uploader-items" v-if="model">
          <div v-for="file in model" :key="index" class="ui-tile-uploader-item ui-tile-uploader-item--complete">
            <div class="ui-tile-uploader-item-content">
              <div @click="removeFile(file)" class="ui-tile-uploader-item-remove" >
                
              </div>
              <!-- <div class="ui-tile-uploader-item-actions"></div> TODO -->
              <div class="ui-tile-uploader-item-preview">
                <div class="ui-tile-uploader-item-file-icon">
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40.32px" viewBox="0 0 100 117"
                         style="display:block"
                         fill="none">
                      <path fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="
                                M 0 5
                                c 0 0 0 -4 5 -5
                                H 63
                                l 26 28
                                v 82
                                c 0 0 0 4 -5 5
                                h -79
                                c 0 0 -4 0 -5 -5
                                Z"
                            fill="#e5e8eb"></path>
                      <path fill-rule="evenodd"
                            clip-rule="evenodd"
                            opacity="0.3"
                            d="
                                M 63 0
                                L 89 28
                                H 66
                                C 66 28 63 28 63 25
                                V 63
                                Z"
                            fill="#535c69"></path>
                      <svg xmlns="http://www.w3.org/2000/svg"
                           width="65"
                           height="33"
                           x="35"
                           y="53">
                        <rect width="100%"
                              height="33"
                              x="0"
                              y="0"
                              fill="#7e8997"
                              rx="2"
                              ry="2"></rect>
                        <text x="50%"
                              y="54%"
                              dominant-baseline="middle"
                              fill="#fff"
                              text-anchor="middle"
                              style="
                                color:#fff;
                                font-family: &quot;OpenSans-Semibold&quot;, &quot;Open Sans&quot;, Helvetica, Arial, sans-serif;
                                font-weight: 500;
                                font-size: 23px;
                                line-height: 25px;
                              ">{{ file.type }}</text>
                      </svg>
                    </svg>
                  </span>
                </div>
              </div>
              <div class="ui-tile-uploader-item-name-box" :title="file.name">
                <div class="ui-tile-uploader-item-name">
                  <span class="ui-tile-uploader-item-name-title">{{ file.clearName }}</span>
                  <span class="ui-tile-uploader-item-name-extension">.{{ file.type }}</span>
                </div> 
              </div>
                
            </div>
          </div>
        </div>
        <div class="ui-tile-uploader-drop-area" @drop.prevent="handleDrop" @dragover.prevent="isDragOver = true" @dragleave="isDragOver = false" @drop="isDragOver = false">
          <label class="ui-tile-uploader-drop-label" @click="triggerFileInput">Вы можете просто перетащить файл сюда или нажмите для загрузки</label>
          <input ref="fileInput" type="file" multiple @change="handleFileUpload" class="ui-tile-uploader-input" style="display: none"/>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  const props = withDefaults(defineProps<{
    label?: string | null;
    required?: boolean;
  }>(), {
    label: null,
    required: false
  });
  
  const model = defineModel() as any;
  
  const fileInput = ref<HTMLInputElement | null>(null);
  
  const isDragOver = ref(false);
  
  const triggerFileInput = () => {
    fileInput.value?.click();
  };
  
  const handleDrop = (event: DragEvent) => {
    if (event.dataTransfer?.files) {
      handleFiles(event.dataTransfer.files);
    }
  };
  
  const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      handleFiles(target.files);
    }
  };
  
  const removeFile = (file: any) => {
    model.value = model.value.filter((item: any) => item.name !== file.name);
  };
  
  
  const handleFiles = (files: FileList) => {
    const fileReader = new FileReader();
    const promise = Promise.all(
      Array.from(files).map((file) =>
        new Promise<string>((resolve, reject) => {
          fileReader.onload = () => {
            if (typeof fileReader.result === "string") {
              const base64String = fileReader.result.replace(/^data:.+;base64,/, '');
              resolve(base64String);
            } else {
              reject("Failed to read file");
            }
          };
          fileReader.onerror = reject;
          fileReader.readAsDataURL(file);
        })
      )
    );
    promise.then((base64List) => {
      model.value = Array.from(files).map((file, index) => {
        return {
          name: file.name,
          clearName: file.name.split('.').slice(0, -1).join('.'),
          size: file.size,
          type: file.name.split('.').pop(),
          fileObject: file,
          base64: base64List[index],
        }
      });
    });
  };
  
  </script>
  
  <style lang="scss">
  .ui-entity-editor-block-title {
      position: relative;
      display: flex;
      margin-bottom: 5px;
      color: #a3a9b1;
      font: 12px / 14px var(--ui-font-family-primary, var(--ui-font-family-helvetica));
      justify-content: space-between;
  }
  
  
  .ui-tile-uploader {
      position: relative;
  }
  
  .ui-tile-uploader-items {
      display: flex;
      flex-wrap: wrap
  }
  
  .ui-tile-uploader-item {
      position: relative;
      display: inline-block;
      width: 120px;
      height: 122px;
      padding: 4px;
      box-sizing: border-box;
      margin-right: 20px;
      margin-bottom: 24px;
      border-radius: 12px;
      overflow: hidden;
      background-color: #fff;
      transition: box-shadow .3s,top .3s;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
      will-change: top
  }
  
  .ui-tile-uploader-item:hover {
      box-shadow: 0 5px 6px 0 rgba(0,0,0,.22)
  }
  
  .ui-tile-uploader-item.--selected {
      box-shadow: 0 0 0 2px #2fc6f6
  }
  
  .ui-tile-uploader-item-enter-active {
      animation: ui-tile-uploader-item--animate .5s cubic-bezier(.44,.99,.48,1)
  }
  
  .ui-tile-uploader-item-leave-active {
      animation: ui-tile-uploader-item--animate .5s cubic-bezier(.44,.99,.48,1) reverse
  }
  
  @keyframes ui-tile-uploader-item--animate {
      0% {
          transform: scale(.8);
          opacity: 0
      }
  
      100% {
          transform: scale(1);
          opacity: 1
      }
  }
  
  .ui-tile-uploader-item--uploading {
      --ui-tile-uploader-item-state-bgcolor: rgba(47,198,246,0.95);
      --ui-tile-uploader-item-status-color: #fff;
      --ui-tile-uploader-item-content-bgcolor: rgba(255,255,255,0.2);
      --ui-tile-uploader-item-state-desc-color: rgba(255,255,255,0.7)
  }
  
  .ui-tile-uploader-item--load-failed,.ui-tile-uploader-item--upload-failed {
      --ui-tile-uploader-item-state-bgcolor: rgba(255,87,82,.95);
      --ui-tile-uploader-item-status-color: #fff;
      --ui-tile-uploader-item-state-icon-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='16' height='13' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M15.121 10.924L8.92.594a1.21 1.21 0 00-2.084 0L.634 10.925c-.488.813.102 1.84 1.047 1.84h12.403a1.215 1.215 0 001.037-1.84zm-8.133-6.73a.82.82 0 01.824-.824h.111a.82.82 0 01.824.824v3.08a.82.82 0 01-.824.823h-.111a.82.82 0 01-.824-.823v-3.08zM8.91 10.17c0 .57-.468 1.037-1.037 1.037-.57 0-1.037-.467-1.037-1.037 0-.569.467-1.037 1.037-1.037.569 0 1.037.468 1.037 1.037z' fill='%23fff'/%3E%3C/svg%3E");
      --ui-tile-uploader-item-state-icon-opacity: .7;
      --ui-tile-uploader-item-content-bgcolor: rgba(255,87,82,.2);
      --ui-tile-uploader-item-state-desc-color: rgba(255,255,255,0.8);
      --ui-tile-uploader-item-preview-overlay-opacity: 0
  }
  
  .ui-tile-uploader-item--added,.ui-tile-uploader-item--loading,.ui-tile-uploader-item--preparing,.ui-tile-uploader-item--pending {
      --ui-tile-uploader-item-state-bgcolor: #e7e8e8;
      --ui-tile-uploader-item-status-color: #525c69;
      --ui-tile-uploader-item-state-icon-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='18' height='18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath opacity='.8' fill-rule='evenodd' clip-rule='evenodd' d='M18 8.973a8.973 8.973 0 11-17.945 0 8.973 8.973 0 0117.945 0zm-2.834 0a6.14 6.14 0 11-12.278 0 6.14 6.14 0 0112.278 0zM7.915 4.939h2.144v3.048h1.998v2.195H7.915V4.94z' fill='%232FC6F6'/%3E%3C/svg%3E");
      --ui-tile-uploader-item-state-icon-opacity: 1;
      --ui-tile-uploader-item-content-bgcolor: rgba(255,255,255,.5);
      --ui-tile-uploader-item-state-desc-color: rgba(82,92,105,0.8);
      --ui-tile-uploader-item-state-remove-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='12' height='12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M7.122 5.637l3.904 3.905-1.504 1.505-3.905-3.905-3.905 3.904L.207 9.543l3.905-3.905L.207 1.732 1.712.227l3.905 3.905L9.522.227l1.504 1.505-3.904 3.905z' fill='%23525C69'/%3E%3C/svg%3E");
      --ui-tile-uploader-item-state-remove-opacity: .2;
      --ui-tile-uploader-item-state-remove-opacity-hover: .8
  }
  
  .ui-tile-uploader-item--load-failed,.ui-tile-uploader-item--upload-failed,.ui-tile-uploader-item--uploading {
      --ui-tile-uploader-item-state-remove-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='12' height='12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M7.122 5.637l3.904 3.905-1.504 1.505-3.905-3.905-3.905 3.904L.207 9.543l3.905-3.905L.207 1.732 1.712.227l3.905 3.905L9.522.227l1.504 1.505-3.904 3.905z' fill='%23fff'/%3E%3C/svg%3E");
      --ui-tile-uploader-item-state-remove-opacity: .4;
      --ui-tile-uploader-item-state-remove-opacity-hover: 1
  }
  
  .ui-tile-uploader-item--complete {
      --ui-tile-uploader-item-preview-overlay: none
  }
  
  .ui-tile-uploader-item-content {
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      width: 100%;
      height: 100%;
      position: relative;
      background-color: var(--ui-tile-uploader-item-content-bgcolor)
  }
  
  .ui-tile-uploader-item-state {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 29px;
      border-radius: 8px 8px 0 0;
      z-index: 10;
      font-family: var(--ui-font-family-primary,var(--ui-font-family-helvetica));
      background-color: var(--ui-tile-uploader-item-state-bgcolor)
  }
  
  .ui-tile-uploader-item-state-icon,.ui-tile-uploader-item-loader {
      position: absolute;
      left: 6px;
      top: 5px;
      width: 18px;
      height: 18px;
      background-image: var(--ui-tile-uploader-item-state-icon-image);
      opacity: var(--ui-tile-uploader-item-state-icon-opacity)
  }
  
  .ui-tile-uploader-item-state-icon {
      background-image: var(--ui-tile-uploader-item-state-icon-image);
      background-repeat: no-repeat;
      background-position: center;
      opacity: var(--ui-tile-uploader-item-state-icon-opacity)
  }
  
  .ui-tile-uploader-item-status {
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: absolute;
      left: 28px;
      top: 0;
      right: 20px;
      bottom: 0
  }
  
  .ui-tile-uploader-item-status-name {
      font-size: 12px;
      line-height: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 100%;
      color: var(--ui-tile-uploader-item-status-color)
  }
  
  .ui-tile-uploader-item-state-desc {
      font-size: 9px;
      line-height: 9px;
      white-space: nowrap;
      overflow: hidden;
      min-width: 100%;
      text-overflow: ellipsis;
      color: var(--ui-tile-uploader-item-state-desc-color)
  }
  
  .ui-tile-uploader-item-state-remove {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 27px;
      background-image: var(--ui-tile-uploader-item-state-remove-image);
      background-repeat: no-repeat;
      background-position: center;
      opacity: var(--ui-tile-uploader-item-state-remove-opacity);
      cursor: pointer;
      transition: opacity 300ms;
      z-index: 1
  }
  
  .ui-tile-uploader-item-state-remove:hover {
      opacity: var(--ui-tile-uploader-item-state-remove-opacity-hover)
  }
  
  .ui-tile-uploader-item-preview {
      flex: 1;
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden
  }
  
  .ui-tile-uploader-item-preview:before {
      display: var(--ui-tile-uploader-item-preview-overlay,block);
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      border-radius: 8px;
      background-color: #fff;
      opacity: var(--ui-tile-uploader-item-preview-overlay-opacity,0.7);
      z-index: 1
  }
  
  .ui-tile-uploader-item-image {
      position: relative;
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 8px;
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover
  }
  
  .ui-tile-uploader-item-image-default:before {
      content: '';
      position: absolute;
      left: 12px;
      right: 12px;
      top: 38px;
      bottom: 6px;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center bottom;
      background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='83' height='67'%3E%3Cpath fill='%23B9BEC4' fill-rule='evenodd' d='M22.132 22l27.667 28.126 11.07-11.252L83 61.375V67H0V44.498L22.132 22zM69.5 0C75.299 0 80 4.701 80 10.5S75.299 21 69.5 21 59 16.299 59 10.5 63.701 0 69.5 0z'/%3E%3C/svg%3E");
      opacity: .3
  }
  
  .ui-tile-uploader-item-name-box {
      display: flex;
      align-items: center
  }
  
  .ui-tile-uploader-item.--image .ui-tile-uploader-item-name-box {
      height: auto
  }
  
  .ui-tile-uploader-item-name {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      height: auto;
      max-height: 44px;
      padding: 6px 6px 3px 6px;
      color: #525c69;
      line-height: 13px;
      box-sizing: border-box;
      font: 11px var(--ui-font-family-primary,var(--ui-font-family-helvetica));
      color: rgba(82,92,105,.8);
      overflow: hidden;
      max-width: 100%;
      width: 100%;
      word-break: break-all;
      text-align: center
  }
  
  .ui-tile-uploader-item-name-extension {
      color: #a8adb4
  }
  
  .ui-tile-uploader-item-file-icon {
      width: 36px;
      height: 42px;
      margin: 20px auto 13px auto
  }
  
  .ui-tile-uploader-item-file-default {
      position: absolute;
      left: 50%;
      top: 47px;
      transform: translateX(-50%)
  }
  
  .ui-tile-uploader-item-actions {
      position: absolute;
      top: -4px;
      right: 0;
      display: flex;
      align-items: center;
      border-radius: 0 4px 0 8px;
      z-index: 4;
      width: 32px;
      transition: width .3s;
      justify-content: flex-end;
      overflow: hidden
  }
  
  .ui-tile-uploader-item-actions-pad {
      display: flex;
      border-radius: 0 4px 0 8px;
      padding: 0 4px;
      justify-content: flex-end;
      overflow: hidden;
      position: relative
  }
  
  .ui-tile-uploader-item-actions-pad::before {
      content: '';
      display: block;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: calc(100% - 32px);
      background-color: #fff;
      transition: left .3s;
      z-index: -1;
      border-radius: 0 4px 0 8px
  }
  
  .ui-tile-uploader-item.--selected .ui-tile-uploader-item-actions,.ui-tile-uploader-item:hover .ui-tile-uploader-item-actions {
      width:calc(100% - 32px)
  }
  
  .ui-tile-uploader-item.--selected .ui-tile-uploader-item-extra-actions,.ui-tile-uploader-item:hover .ui-tile-uploader-item-extra-actions {
      opacity:1
  }
  
  .ui-tile-uploader-item.--selected .ui-tile-uploader-item-actions-pad::before,.ui-tile-uploader-item:hover .ui-tile-uploader-item-actions-pad::before {
      left:0
  }
  
  .ui-tile-uploader-item-extra-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 25px;
      flex-shrink: 0;
      opacity: 0;
      transition: opacity .3s
  }
  
  .ui-tile-uploader-item-menu {
      display: flex;
      flex-shrink: 0;
      width: 24px;
      height: 25px;
      background-position: center;
      background-repeat: no-repeat;
      transition: opacity .3s;
      opacity: .5;
      cursor: pointer;
      z-index: 1;
      background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='16' height='4' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M4 2a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm4 2a2 2 0 100-4 2 2 0 000 4z' fill='%23525C69'/%3E%3C/svg%3E");
  }
  
  .ui-tile-uploader-item-menu:hover {
      opacity: .9
  }
  
  .ui-tile-uploader-item-remove {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      height: 25px;
      left: -4px;
      top: -4px;
      border-radius: 14px 0 8px 0;
      background-color: #fff;
      cursor: pointer;
      z-index: 1;
      right: auto;
      width: 0;
      pointer-events: none;
      box-sizing: border-box;
      overflow: hidden;
      transition: width .3s
  }
  
  .ui-tile-uploader-item:hover .ui-tile-uploader-item-remove {
      width: 32px;
      pointer-events: auto
  }
  
  .ui-tile-uploader-item-remove:before {
      display: inline-block;
      width: 11px;
      height: 11px;
      margin-top: 4px;
      background-position: center;
      background-repeat: no-repeat;
      content: '';
      background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='12' height='12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M7.122 5.637l3.904 3.905-1.504 1.505-3.905-3.905-3.905 3.904L.207 9.543l3.905-3.905L.207 1.732 1.712.227l3.905 3.905L9.522.227l1.504 1.505-3.904 3.905z' fill='%23525C69'/%3E%3C/svg%3E");
      opacity: 0;
      transition: opacity .3s
  }
  
  .ui-tile-uploader-item:hover .ui-tile-uploader-item-remove:before {
      opacity: .5
  }
  
  .ui-tile-uploader-item:hover .ui-tile-uploader-item-remove:hover:before {
      opacity: .9
  }
  
  .ui-tile-uploader-item-more {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: absolute;
      max-width: 100%;
      max-height: 100%;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
  }
  
  .ui-tile-uploader-item-more-icon {
      background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='32' height='8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.5.167a3.833 3.833 0 110 7.666 3.833 3.833 0 010-7.666zm11.5 0a3.833 3.833 0 110 7.666 3.833 3.833 0 010-7.666zm11.5 0a3.833 3.833 0 110 7.666 3.833 3.833 0 010-7.666z' fill='%23525C69' fill-rule='evenodd' opacity='.3'/%3E%3C/svg%3E");
      background-position: center;
      background-repeat: no-repeat;
      width: 100%;
      height: 45px
  }
  
  .ui-tile-uploader-item-more-label {
      width: 100%;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center
  }
  
  .ui-tile-uploader-item-more-count {
      font: 13px var(--ui-font-family-primary,var(--ui-font-family-helvetica));
      color: rgba(82,92,105,.9);
      display: inline-block;
      box-sizing: border-box;
      min-width: 16px;
      text-overflow: ellipsis;
      overflow: hidden;
      color: #fff;
      padding: 2px 6px 3px 6px;
      border-radius: 30px;
      background-color: #4fc3f7;
      margin-left: 4px;
      margin-right: 4px
  }
  
  .ui-tile-uploader-drop-box {
      display: flex;
      align-items: center;
      height: 41px;
  }
  
  .ui-tile-uploader-drop-label {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 5px 10px;
      width: 100%;
      height: 41px;
      border-radius: 12px;
      border: 2px dashed rgba(82,92,105,.15);
      font: 13px var(--ui-font-family-primary,var(--ui-font-family-helvetica));
      color: rgba(82,92,105,.5);
      text-align: center;
      transition: height .3s,border .3s;
      box-sizing: border-box;
      cursor: pointer
  }
  
  .ui-tile-uploader-drop-label:hover {
      border: 2px dashed rgba(82,92,105,.30)
  }
  
  .ui-tile-uploader.--drag-over .ui-tile-uploader-drop-label {
      // position: absolute;
      background-color: white;
      z-index: 5;
      // bottom: 0;
      // right: 0;
      // left: 0;
      border: 2px dashed #2fc6f6;
      // width: 100%;
      // height: 100%;
      font: 15px var(--ui-font-family-primary,var(--ui-font-family-helvetica))
  }
  
  .ui-tile-uploader.--drag-over .ui-tile-uploader-items {
      opacity: 0;
      pointer-events: none
  }
  
  .ui-tile-uploader.--drag-over .ui-tile-uploader-settings {
      display: none
  }
  
  .ui-tile-uploader-settings {
      display: block;
      margin-left: 10px;
      width: 32px;
      height: 32px;
      background: url("data:image/svg+xml;charset=utf-8,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8.691 11.078a3.158 3.158 0 01-3.769-3.77c.23-1.075 1.31-2.157 2.386-2.386a3.158 3.158 0 013.77 3.77 3.106 3.106 0 01-2.387 2.386zM13.83 6.57a5.992 5.992 0 00-.488-1.313.05.05 0 01.006-.053l.994-1.234a.7.7 0 00-.021-.905l-.63-.71a.7.7 0 00-.897-.127l-1.355.852a5.962 5.962 0 00-1.969-.895.05.05 0 01-.037-.04L9.173.586A.7.7 0 008.484 0h-.95a.698.698 0 00-.69.585l-.26 1.562a.05.05 0 01-.037.04 5.96 5.96 0 00-1.624.674.05.05 0 01-.053-.002l-1.263-.901a.7.7 0 00-.902.074l-.671.672a.7.7 0 00-.074.902l.903 1.265a.05.05 0 01.002.054 5.976 5.976 0 00-.669 1.611.05.05 0 01-.04.037l-1.57.262a.7.7 0 00-.585.69v.95a.7.7 0 00.585.69l1.57.262a.05.05 0 01.04.037c.118.469.287.918.508 1.335a.05.05 0 01-.005.054l-.99 1.226a.7.7 0 00.021.905l.63.71a.7.7 0 00.897.127l1.348-.846a.05.05 0 01.053 0 5.96 5.96 0 001.92.846l.267 1.594a.698.698 0 00.69.585h.95a.7.7 0 00.69-.585l.26-1.562a.05.05 0 01.036-.04 5.952 5.952 0 001.605-.663.05.05 0 01.053.002l1.317.94c.277.2.66.169.901-.074l.672-.671a.698.698 0 00.073-.902l-.937-1.314a.05.05 0 01-.002-.054 5.92 5.92 0 00.67-1.616.05.05 0 01.04-.037l1.553-.259a.699.699 0 00.585-.69v-.95a.7.7 0 00-.585-.69l-1.585-.264z' fill='%23525C69' fill-rule='evenodd'/%3E%3C/svg%3E") center no-repeat;
      background-size: 16px 16px;
      transition: opacity .3s;
      opacity: .4;
      cursor: pointer
  }
  
  .ui-tile-uploader-settings:hover,.ui-tile-uploader-settings.--selected {
      opacity: 1
  }
  
  .ui-tile-uploader-insert-into-text-button {
      display: inline-block;
      width: 24px;
      height: 25px;
      background-position: center;
      background-repeat: no-repeat;
      transition: opacity .3s;
      opacity: .5;
      cursor: pointer;
      z-index: 1;
      background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='16' height='10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12.708 2.034V10h-2.416V2.034H7V0h9v2.034h-3.292zm-8.543 1.86c-.088-.398.41-.678.699-.39l2.26 2.26a.4.4 0 010 .566L4.78 8.675c-.282.281-.764.022-.69-.37.088-.454.18-.963.252-1.418a.854.854 0 01-.091.005H.528a.5.5 0 01-.5-.5v-.69a.5.5 0 01.5-.5h3.723c.056 0 .11.006.164.017a19.265 19.265 0 00-.25-1.325z' fill='%23525C69'/%3E%3C/svg%3E");
  }
  
  .ui-tile-uploader-insert-into-text-button:hover {
      opacity: .9;
  }
  
  .ui-tile-uploader-insert-into-text-button.--inserted {
      background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='18' height='11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M14.708 10V2.034H18V0H9v2.034h3.292V10h2.416zM3.811 6.025L2.69 4.908l-.914.913L3.762 7.8l.05.049 3.445-3.402-.913-.913-2.533 2.49zm.73 4.034a4.523 4.523 0 110-9.045 4.523 4.523 0 010 9.045z' fill='%232FC6F6'/%3E%3C/svg%3E");
      opacity: 1
  }
  
  </style>
  