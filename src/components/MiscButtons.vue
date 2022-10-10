<script>
import { MDBBtn, } from "mdb-vue-ui-kit";
import bus from "../lib/bus";
import { SHOW_NSFW, updateNSFW } from "../lib/config";

export default {
    components: {
        MDBBtn,
    },
    data() {
        return {
            show_nsfw: SHOW_NSFW,
            button_color: '#FF575B'
        }
    },
    methods: {
        openSettingsPanel() {
            bus.fire('info-open');
            bus.fire('blur-show', 1400);
        },
        changeNSFW() {
            // This is triggered before the change.
            this.show_nsfw = !this.show_nsfw;
            this.button_color = this.show_nsfw ? '#02A676' : '#FF575B';
            updateNSFW(this.show_nsfw);
        },
    },
}
</script>
    
<template >
    <div class="misc-container">
        <MDBBtn class="btn btn-primary mdb-fab info-btn" floating size="lg" @click="openSettingsPanel">
            <i class="fas fa-info-circle"></i>
        </MDBBtn>
        <MDBBtn class="btn btn-primary nsfw-switch" @click="changeNSFW">
            <span v-if="show_nsfw">Hide NSFW content</span>
            <span v-else>Show NSFW content</span>
        </MDBBtn>
    </div>
</template>


<style>
.misc-container {
    pointer-events: none;
    position: absolute;
    width: 100%;
    height: 100%;
}

.info-btn {
    pointer-events: all;
    position: absolute;
    float: right;
    top: 5vh;
    right: 1vw;
}

.nsfw-switch {
    font-weight: 700 !important;
    pointer-events: all;
    position: absolute;
    float: right;
    top: 92vh;
    right: -1vw;
    text-transform: initial !important;
    background-color: v-bind(button_color) !important;
}

@media only screen and (max-width: 600px) {
    .nsfw-switch {
        position: relative;
        float: left;
        left: 50%;
        right: 0;
        transform: translateX(-50%);
        margin: 0 auto;
    }

    .info-btn {
        pointer-events: all;
        position: relative;
        float: right;
        top: 91.3vh;
        right: 3vw;
    }
}
</style>
