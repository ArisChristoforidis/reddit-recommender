<script>
import { MDBBtnClose, MDBBtn, MDBIcon, MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem } from "mdb-vue-ui-kit";
import { SimpleBar } from 'simplebar-vue3';

import bus from "../lib/bus";
import { name_data_associations } from "../lib/loadData";
import { full_graph } from "../lib/loadData";
import { ref } from "vue";
import { SORTING_ORDER, SELECTED_SORTING_ORDER, SHOW_NSFW, updateSortingOrder } from '../lib/config'

let sorting_labels = ['Relevance', 'Popularity'];
export default {
    components: {
        MDBBtnClose,
        MDBBtn,
        MDBIcon,
        MDBDropdown,
        MDBDropdownToggle,
        MDBDropdownMenu,
        MDBDropdownItem,
        SimpleBar,
    },
    data() {
        return {
            is_visible: false,
            subreddit_name: '',
            is_nsfw: false,
            suggestions: [],
            full_suggestions: [],
            selected_sorting_label: sorting_labels[SELECTED_SORTING_ORDER],
            multi_query: '',
        }
    },
    setup() {
        const sort_dropdown = ref(false);
        return {
            sort_dropdown
        }
    },
    methods: {
        hide() {
            this.is_visible = false;
        },
        show() {
            this.is_visible = true;
        },
        onSubredditSelected(subreddit_name) {
            if (subreddit_name == null) {
                this.hide();
                return;
            }
            this.subreddit_name = subreddit_name;
            this.is_nsfw = name_data_associations[subreddit_name].nsfw == 1;
            let temp_suggestions = [];
            full_graph.forEachLinkedNode(subreddit_name, function (linkedNode, link) {
                let nsfw = name_data_associations[linkedNode.id].nsfw;
                let popularity = name_data_associations[linkedNode.id].popularity;
                temp_suggestions.push({ name: linkedNode.id, weight: link.data.weight, popularity: popularity, nsfw: nsfw });
            });
            this.full_suggestions = temp_suggestions;
            this.processSuggestions();
            this.show();
        },
        processSuggestions() {
            if (SELECTED_SORTING_ORDER == SORTING_ORDER.RELEVANCE) {
                this.full_suggestions.sort((a, b) => b.weight - a.weight);
            } else {
                this.full_suggestions.sort((a, b) => b.popularity - a.popularity);
            }
            this.suggestions = this.full_suggestions.slice(0, 40);
            this.multi_query = this.suggestions.map(x => x.name).join('+');
        },
        onSortingOrderChanged() {
            this.selected_sorting_label = sorting_labels[SELECTED_SORTING_ORDER];
            this.processSuggestions();
        },
        changeSortingOrder(sorting_order) {
            this.sort_dropdown = false;
            updateSortingOrder(sorting_order);
        },
        onNsfwChanged () {
            if (!SHOW_NSFW && this.is_visible && this.is_nsfw) {
                this.onSubredditSelected(null);
            }
        }

    },
    mounted() {
        bus.on('node-query', this.onSubredditSelected);
        bus.on('sorting-update', this.onSortingOrderChanged);
        bus.on('nsfw-update', this.onNsfwChanged);
    },
    beforeUnmount() {
        bus.off('node-query', this.onSubredditSelected);
        bus.off('sorting-update', this.onSortingOrderChanged);
        bus.off('nsfw-update', this.onNsfwChanged);
    }
};
</script>

<template>
    <Transition name="sidebar">
        <div class="sidebar" v-if="is_visible">
            <MDBBtnClose white class="x-btn" @click="hide" />
            <div class="sidebar-header">
                <a class="subreddit-name" v-bind:href="'https://www.reddit.com/r/' + subreddit_name"
                    target="_blank">{{subreddit_name}}</a>
                <br />
                <span class="is-nsfw" v-if="is_nsfw">NSFW</span>
                <MDBDropdown v-model="sort_dropdown">
                    <MDBDropdownToggle @click="sort_dropdown = !sort_dropdown" class="mdb-component">
                        Sort by: {{selected_sorting_label}}
                    </MDBDropdownToggle>
                    <MDBDropdownMenu aria-labelledby="dropdownMenuButton">
                        <MDBDropdownItem href="#" @click="changeSortingOrder(0)">Relevance</MDBDropdownItem>
                        <MDBDropdownItem href="#" @click="changeSortingOrder(1)">Popularity</MDBDropdownItem>
                    </MDBDropdownMenu>
                </MDBDropdown>
            </div>
            <SimpleBar class="scroll-container">
                <ul class="suggestions-list">
                    <template v-for="item in suggestions" style="display:inline-block !important;">
                        <a class="suggestion-item" v-bind:href="'https://www.reddit.com/r/' + item.name"
                            target="_blank">
                            <span class="suggestion-subreddit-title">{{item.name}}</span>
                        </a>
                        <br />
                    </template>
                </ul>
            </SimpleBar>
            <a class="a-multireddit" v-bind:href="'https://reddit.com/r/' + multi_query" target="_blank"
                title="Generate multireddit">
                <MDBBtn class="mdb-fab" color="secondary" size="lg" floating>
                    <MDBIcon>
                        <i class="fab fa-reddit-alien"></i>
                    </MDBIcon>
                </MDBBtn>
            </a>
        </div>
    </Transition>
</template>


<style>
.sidebar {
    text-transform: capitalize;
    position: absolute;
    background-color: #1d1d1d;
    top: 0;
    bottom: 0;
    margin: auto 1vw;
    width: 25vw;
    min-width: 350px;
    height: 75vh;
    padding: 2vh 1vw 0 1vw;
    text-align: center;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
}

.sidebar-header {
    display: inline-block;
}

.subreddit-name {
    color: white;
    font-weight: 400;
    font-size: 32px;
    vertical-align: middle;
    transition: 0.1s;
    display: inline-block;
    padding-top: 1vh;
}

.x-btn {
    margin-left: auto;
}

.is-nsfw {
    font-weight: bold;
    color: #FF575B;
    font-size: 12px;
    border: solid;
    padding: 0.4vh 0.5vw;
    margin-bottom: 0.5vh;
    border-radius: 3px;
    vertical-align: middle;
    display: inline-block;
}

.suggestions-list {
    list-style: none;
    padding-left: 0;
    height: 100%;
}

.suggestion-item {
    font-weight: 400;
    padding: 0.5vh 1vw;
    width: 95%;
    margin: 0.7vh 0 0vh 0;
    background-color: #2C2C2C;
    transition: 0.1s;
    border-radius: 4px;
    display: inline-block;
}

.subreddit-name:hover {
    color: #02A676;
}

.suggestion-item:hover {
    background-color: #02A676;
}



.scroll-container {
    width: 100%;
    height: 82%;
    margin-top: 1vh;
    padding: 0;
    overflow-x: hidden;
}

.simplebar-track.simplebar-vertical .simplebar-scrollbar:before {
    background-color: #02A676;
    opacity: 0.75;
    margin-left: 2px;
}

.suggestion-subreddit-title {
    color: white;
    font-size: 20px;
    vertical-align: middle;
}

.dropdown-menu {
    background-color: #2C2C2C !important;
}

.dropdown-item {
    color: white !important;
    border-radius: 4px !important;
}

.dropdown-item:hover {
    background-color: #02A676 !important;
    border-radius: 4px !important;
}

.a-multireddit {
    position: absolute;
    justify-self: center;
    align-self: center;
    bottom: -2.5vh;
}

.mdb-fab {
    background-color: #02A676 !important;
}


.sidebar-enter-active,
.sidebar-leave-active {
    transition: all 0.3s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
    transform: translateX(-50vw);
}

@media only screen and (max-width: 600px) {
    .sidebar {
        position: relative;
        float: left;
        left: 50%;
        top: 50%;
        right: 0;
        transform: translate(-50%, 17%);
        width: 80vw;
        margin: 0 auto;
    }

    .sidebar-enter-active,
    .sidebar-leave-active {
        transition: all 0.3s ease;
    }

    .sidebar-enter-from,
    .sidebar-leave-to {
        transform: translate(-200%, 17%);
    }
}
</style>
