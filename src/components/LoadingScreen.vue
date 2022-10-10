<script>
import bus from '../lib/bus';
import { MDBSpinner } from 'mdb-vue-ui-kit';

export default {
    components: {
        MDBSpinner,
    },
    data() {
        return {
            done: false,
        }
    },
    methods: {
        onSceneLoadingFinished() {
            this.done = true;
        },
    },
    mounted() {
        bus.on('scene-loaded', this.onSceneLoadingFinished);
    },
    beforeUnmount() {
        bus.off('scene-loaded', this.onSceneLoadingFinished);
    }
}
</script>

<template>
    <Transition name="loading">
        <div v-if="!done" class="loading-container">
            <h1 class="loading-title"> Reddit Recommender</h1>
            <MDBSpinner style="color:white;" />
            <div style="color:white"> Loading...</div>
            <div style="color:white"> This may take several seconds</div>
        </div>
    </Transition>
</template>

<style>
.loading-container {
    pointer-events: none;
    position: absolute;
    width: 100vw;
    height: 100vh;
    background-color: #121212;
    z-index: 10000;
    text-align: center;
}

.loading-title {
    margin: 15vh 0 65vh 0;
    font-size: 56px;
    color: white;
}

.loading-enter-active,
.loading-leave-active {
    transition: all 1s ease;
}

.loading-enter-from,
.loading-leave-to {
    opacity: 0;
}

@media only screen and (max-width: 600px) {
    .loading-title {
        margin: 15vh 0 50vh 0;
    }
}
</style>
