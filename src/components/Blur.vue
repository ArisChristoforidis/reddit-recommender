<script>
import bus from '../lib/bus';

export default {
    data() {
        return {
            z: 0,
            show_blur_screen: false,
        };
    },
    methods: {
        show(z_index) {
            this.z = z_index;
            this.show_blur_screen = true;
        },
        hide() {
            this.show_blur_screen = false;
        },
        onClick() {
            bus.fire('blur-click');
        }
    },
    mounted() {
        bus.on('blur-show', this.show);
        bus.on('blur-hide', this.hide);
    },
    beforeUnmount () {
        bus.off('blur-show', this.show);
        bus.off('blur-hide', this.hide);
    }
}
</script>
    
<template>
    <Transition>
        <div @click="onClick" v-if="show_blur_screen" class="blur-screen"></div>
    </Transition>
</template>
    
<style>
.blur-screen {
    position: absolute;
    backdrop-filter: blur(4px);
    height: 100vh;
    width: 100vw;
    z-index: v-bind(z);
}

.v-enter-active,
.v-leave-active {
    transition: opacity 0.35s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>    