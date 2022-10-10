<script>
import Graph from "./components/Graph.vue";
import SideBar from "./components/SideBar.vue";
import Searchbar from "./components/Searchbar.vue";
import LoadingScreen from "./components/LoadingScreen.vue";
import MiscButtons from './components/MiscButtons.vue';
import InfoPanel from "./components/InfoPanel.vue";
import Blur from "./components/Blur.vue";
import { loadData } from "./lib/loadData";

export default {
    name: 'app',
    components: {
        Graph,
        SideBar,
        Blur,
        Searchbar,
        MiscButtons,
        InfoPanel,
        LoadingScreen,
    },
    mounted() {
        loadData();
    }
}

</script>

<template>
    <div class="title-container">
        <b>    
            <div class="title">Reddit Recommender</div>
            <div class="credits">By <a href="https://github.com/ArisChristoforidis" target="_blank" class="info-link">Aris Christoforidis</a></div>
        </b>
    </div>
    <LoadingScreen />
    <SideBar />
    <Searchbar />
    <MiscButtons />
    <InfoPanel />
    <Graph />
    <Blur />
</template>


<style>
#app {
    font-family: 'Lato', Helvetica, Arial, sans-serif !important;
}

* {
    margin: 0;
    padding: 0;
}

.title-container {
    position: absolute;
    top: 90.7vh;
    margin-left: 1vw;
    z-index: 5000;
}

.credits {
    font-size: 14px;
    color: white;
}

.title {
    font-size: 30px;
    color: white;
    text-align: center;
}

@media only screen and (max-width: 600px) {
    .title-container {
        display: none;
    }
}

.mdb-component {
    background-color: #02A676 !important;
    text-transform: initial !important;
    font-weight: 700 !important;
}
</style>
