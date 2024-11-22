<template>
<div class="side-panel-loader">
    <div class="side-panel-default-loader-container">
        <svg class="side-panel-default-loader-circular" viewBox="25 25 50 50">
            <circle class="side-panel-default-loader-path" cx="50" cy="50" r="20" fill="none" stroke-miterlimit="10">
            </circle>
        </svg>
    </div>
</div>
</template>
<script setup lang="ts">

</script>

<style scoped>
.side-panel-loader {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 3200;
    display: block;
    opacity: 1;
    background-color: #eef2f4;
}

.side-panel-default-loader-container {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 110px;
    height: 110px;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
}

.side-panel-default-loader-circular {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    -webkit-animation: side-panel-loader-rotate 2s linear infinite;
    animation: side-panel-loader-rotate 2s linear infinite;
    -webkit-transform-origin: center center;
    transform-origin: center center;
} 

svg:not(:root) {
    overflow-clip-margin: content-box;
    overflow: hidden;
}

.side-panel-default-loader-path {
    stroke: #bfc3c8;
    stroke-width: 1.5;
    stroke-dasharray: 20, 200;
    stroke-dashoffset: 0;
    -webkit-animation: side-panel-loader-dash 1.5s ease-in-out infinite;
    animation: side-panel-loader-dash 1.5s ease-in-out infinite;
    stroke-linecap: round;
}

@-webkit-keyframes side-panel-loader-rotate {
	100% {
		-webkit-transform: rotate(360deg);
		transform: rotate(360deg);
	}
}

@keyframes side-panel-loader-rotate {
	100% {
		-webkit-transform: rotate(360deg);
		transform: rotate(360deg);
	}
}

@-webkit-keyframes side-panel-loader-dash {
	0% {
		stroke-dasharray: 1, 200;
		stroke-dashoffset: 0;
	}
	50% {
		stroke-dasharray: 89, 200;
		stroke-dashoffset: -35px;
	}
	100% {
		stroke-dasharray: 89, 200;
		stroke-dashoffset: -124px;
	}
}

@keyframes side-panel-loader-dash {
	0% {
		stroke-dasharray: 1, 200;
		stroke-dashoffset: 0;
	}
	50% {
		stroke-dasharray: 89, 200;
		stroke-dashoffset: -35px;
	}
	100% {
		stroke-dasharray: 89, 200;
		stroke-dashoffset: -124px;
	}
}

</style>