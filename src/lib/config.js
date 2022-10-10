import bus from './bus';

let SORTING_ORDER = {
    RELEVANCE: 0,
    POPULARITY: 1,
}

let SELECTED_SORTING_ORDER = SORTING_ORDER.RELEVANCE;
let SHOW_NSFW = false;

function updateSortingOrder(new_sorting_order) {
    if (SELECTED_SORTING_ORDER == new_sorting_order) return;
    SELECTED_SORTING_ORDER = new_sorting_order;
    bus.fire('sorting-update');
}

function updateNSFW(is_nsfw_enabled) {
    if (SHOW_NSFW == is_nsfw_enabled) return;
    SHOW_NSFW = is_nsfw_enabled;
    bus.fire('nsfw-update');
}

export {
    SORTING_ORDER,
    SELECTED_SORTING_ORDER,
    SHOW_NSFW,
    updateSortingOrder,
    updateNSFW,
}