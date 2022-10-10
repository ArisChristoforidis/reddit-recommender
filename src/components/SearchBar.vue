<script>
import bus from '../lib/bus';
import fuzzysort from 'fuzzysort';
import SimpleTypeahead from 'vue3-simple-typeahead';
import { subreddit_names_list, name_data_associations } from '../lib/loadData';
import { SHOW_NSFW } from '../lib/config';

let active_suggestions, search_suggestions;
let sfw_search_suggestions = [];

function prepareSearchSuggestions() {
    search_suggestions = subreddit_names_list.map(x => fuzzysort.prepare(x));
    search_suggestions.forEach(
        (x) => {
            if (!name_data_associations[x.target].nsfw) sfw_search_suggestions.push(x);
        });
    changeSuggestionsList();
}

function changeSuggestionsList () {
    active_suggestions = SHOW_NSFW ? search_suggestions : sfw_search_suggestions;
}

async function searchOnBackground(search_text) {
    const fuzzy_results = fuzzysort.go(search_text, active_suggestions, { limit: 10 });
    const suggestions = [];
    for (const result of fuzzy_results) {
        suggestions.push(result['target']);
    }
    return suggestions;
}

export default {
    components: {
        SimpleTypeahead,
    },
    data() {
        return {
            search_text: "",
            results: [],
            data: {
                input: '',
                selection: null,
            },
        };
    },
    methods: {
        onInput(e) {
            this.search_text = e.target.value;
            this.search();
        },

        onSuggestionSelected(event) {
            this.data.selection = null;
            this.data.input = event.input;
            // Activate sidebar.
            bus.fire('node-query', event, true);
            this.$refs.typeahead.clearInput();
        },
        search(event) {
            this.data.selection = null;
            this.data.input = event.input;
            searchOnBackground(this.data.input).then((x) => {
                this.results = x;
            });
        },
        focus() {
            bus.fire("blur-show", 1200);
        },
        unfocus(event) {
            if (event) this.data.input = event.input;
            bus.fire("blur-hide");
        },
        onNsfwChanged() {
            changeSuggestionsList();
            if (!SHOW_NSFW) {
                this.$refs.typeahead.clearInput();
            }
        }
    },
    mounted() {
        bus.on('data-loaded', prepareSearchSuggestions);
        bus.on('nsfw-update', this.onNsfwChanged);
        bus.on('blur-click', this.unfocus);
    },
    beforeUnmount() {
        bus.off('data-loaded', prepareSearchSuggestions);
        bus.off('nsfw-update', this.onNsfwChanged);
        bus.off('blur-click', this.unfocus);
    }

}
</script>

<template>
    <div class="search-box">
        <vue3-simple-typeahead ref="typeahead" class="search-bar" placeholder="Enter a subreddit..." :items="results"
            :minInputLength="1" @selectItem="onSuggestionSelected" @onInput="search" @onFocus="focus" @onBlur="unfocus">
        </vue3-simple-typeahead>
    </div>
</template>

<style>
.search-box {
    position: absolute;
    left: 0;
    right: 0;
    margin: 5vh auto 0;
    width: 32vw;
    min-width: 250px;
    min-width: 300px;
    z-index: 1300;
}

.search-bar {
    padding: 1vw;
    height: 5vh;
    font-size: 18px;
    width: 32vw;
    min-width: 300px;
    appearance: none;
    border: none;
    outline: none;
    background: none;
    color: white;
    background-color: #1c1c1c;

    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
    border-radius: 8px;
    opacity: 0.9;
}

.search-bar:focus {
    opacity: 1;
    border-radius: 8px 8px 0 0;
}

.simple-typeahead-list {
    list-style-type: none;
    font-size: 20px;
    background-color: #1c1c1c;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.3);
    border-radius: 0 0 8px 8px;
}

.simple-typeahead-list-item {
    padding: 0 1vw;
    color: white;
}

.simple-typeahead-list-item-active {
    background-color: #02A676;
}
</style>
