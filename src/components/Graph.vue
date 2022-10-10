<script>
import createGraphScene from '../lib/createGraphScene';
import { MDBBtn } from "mdb-vue-ui-kit";

export default {
    components: {
        MDBBtn
    },

    data() {
        return {}
    },
    mounted() {
        const canvas = document.getElementById('cnv');
        this.scene = createGraphScene(canvas);
    },
    beforeUnmount() {
        if (this.scene) this.scene.dispose();
    }
}
</script>

<template >
</template>


<style>

</style>
