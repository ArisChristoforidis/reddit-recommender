<script>
import { MDBBtnClose } from "mdb-vue-ui-kit";
import bus from "../lib/bus";

export default {
    components: {
        MDBBtnClose,
    },
    data() {
        return {
            is_visible: false,
        }
    },
    methods: {
        hide() {
            if (!this.is_visible) return;
            this.is_visible = false;
            bus.fire('blur-hide');
        },
        show() {
            this.is_visible = true
        },
    },
    mounted() {
        bus.on('info-open', this.show);
        bus.on('blur-click', this.hide)
    },
    beforeUnmount() {
        bus.off('info-open', this.show);
        bus.off('blur-click', this.hide)
    }
}
</script>

<template >
    <Transition name="panel">
        <div v-if="is_visible" class="info-panel">
            <MDBBtnClose white class="x-btn" @click="hide" />
            <div class="info-content">
                <h3> Usage </h3>
                <ul class="usage-list">
                    <li>Use the interactive graph or the search bar to find your favorite subreddits; the recommender
                        will
                        show you subreddits with similar content to the one you selected.</li>
                    <li> Visit each subreddit independently, or use the <b>generate multireddit</b> button at the bottom
                        of
                        the sidebar to create a multireddit.</li>
                    <li> Sort by popularity or relevance to get better results. </li>
                    <li> You can show/hide NSFW results by clicking the button on the lower right corner. Search
                        recommendations will also be filtered.</li>
                </ul>
                <h3> About this project </h3>
                <p class="about">
                    Thanks for checking out my Reddit Recommender! This project uses 2022 post data from <a
                        class="info-link" href="https://files.pushshift.io/reddit/" target="_blank">Pushshift</a>. In
                    total,
                    there are 132,288
                    subreddits in the database. The graph contains the top 45000 subreddits, but you can access the full
                    amount from the search bar. For a more detailed overview of how the recommendation algorithm works,
                    visit the project's <a class="info-link"
                        href="https://github.com/ArisChristoforidis/reddit-recommender" target="_blank">Github page</a>.
                </p>

            </div>
        </div>
    </Transition>
</template>


<style>
.info-panel {
    position: absolute;
    height: 60vh;
    width: 40vw;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    margin: auto;
    background-color: #1d1d1d;
    border-radius: 5px;
    padding: 2vh 1vw;
    color: white;
    z-index: 1500;
    overflow: hidden;
}

.info-content {
    height: 100%;
    overflow-y: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none;
    scroll-behavior: smooth;
}

.info-content::-webkit-scrollbar {
    display: none;
}

.info-link {
    color: #02A676;
    background-color: transparent;
    text-decoration: none;
}

.info-link:hover {
    color: #02875F;
}

.usage-list {
    padding-left: 1vw;
}

.x-btn {
    display: block;
    right: 0;
}

li {
    text-align: justify;
    text-justify: auto;
}

.about {
    text-align: justify;
    text-justify: auto;
}

.panel-enter-active,
.panel-leave-active {
    transition: all 0.5s ease;
}

.panel-enter-from,
.panel-leave-to {
    transform: translateY(100vh);
}

@media only screen and (max-width: 1000px) {    
    .info-panel {
        width: 80vw;
    }
}

</style>
