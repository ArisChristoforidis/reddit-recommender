// Based on https://github.com/anvaka/map-of-reddit/blob/main/src/lib/createStreamingSVGRenderer.js
// and on https://github.com/anvaka/map-of-reddit/blob/main/src/lib/createPointerEventsHandler.js
// The MIT License (MIT) Copyright (c) 2021-2022 Andrei Kashcha

import LineCollection from './LineCollection';
import PointCollection from './PointCollection';
import MSDFTextCollection from './MSDFTextCollection';
import { visualization_graph as graph, name_data_associations } from './loadData';
import createPointerEventsHandler from './createPointerEventsHandler';
import getClusterColor from './clusterColors'
import bus from './bus';
import { SELECTED_SORTING_ORDER, SORTING_ORDER, SHOW_NSFW } from './config';

export default function createGraphUI(scene) {
    bus.on('node-query', onNodeSelected);
    bus.on('sorting-update', onSortingOrderChanged);
    bus.on('nsfw-update', onNsfwChanged);

    let pointerEvents, sfw_nodes, sfw_labels, nsfw_nodes, nsfw_labels, highlighed_edges;
    let node_ui_map = {};
    let sorting_order = SELECTED_SORTING_ORDER;
    let selected_node_name = '';
    let api = {
        dispose,
    };

    createUI();

    /* This is responsible for creating the visual elements of the graph. */
    async function createUI() {
        // We separate SFW and NSFW data in order to filter out the latter easily.
        sfw_nodes = new PointCollection(scene.getGL());
        sfw_labels = new MSDFTextCollection(scene.getGL());
        nsfw_nodes = new PointCollection(scene.getGL());
        nsfw_labels = new MSDFTextCollection(scene.getGL());
        highlighed_edges = new LineCollection(scene.getGL(), {
            width: 40
        });
        
        // Detect clicks.
        pointerEvents = createPointerEventsHandler(scene, {
            getGraph: () => graph,
            getEdges: () => highlighed_edges,
        });

        // These adjust node appearance.
        const size_scale = 90;
        const pos_scale = 40;
        graph.forEachNode(node => {
            const data = node.data;
            const size = 5 * Math.sqrt(data.size) * size_scale;
            const cluster = data.cluster;
            const x = data.x * pos_scale;
            const y = data.y * pos_scale;
            const nsfw = name_data_associations[node.id].nsfw;
            node.ui = {
                name: node.id,
                size,
                position: [x, y, 0],
                color: getClusterColor(cluster)
            };
            // Labels.
            const label_params = {
                x: x,
                y: y - (size / 2),
                text: node.id,
                limit: 3.14 * (size / 2),
                cx: 0.5
            };
            if (!nsfw) {
                node.uiId = sfw_nodes.add(node.ui);
                sfw_labels.addText(label_params);
            } else {
                node.uiId = nsfw_nodes.add(node.ui);
                nsfw_labels.addText(label_params);
            }
            // Pointer event detection.
            pointerEvents.addNode(node.ui);
            node_ui_map[node.id] = node.ui;
        });

        // Add elements to scene.
        scene.appendChild(highlighed_edges);
        scene.appendChild(sfw_nodes);
        scene.appendChild(sfw_labels);
        onNsfwChanged();
        
        bus.fire('scene-loaded');
    }

    function onNsfwChanged() {
        if (!SHOW_NSFW && selected_node_name != '' && name_data_associations[selected_node_name].nsfw) {
            selected_node_name = '';
            clearHighlights();    
        }
        if (SHOW_NSFW) {
            scene.appendChild(nsfw_nodes);
            scene.appendChild(nsfw_labels);
        } else {
            scene.removeChild(nsfw_nodes);
            scene.removeChild(nsfw_labels);
        }
    }


    function onSortingOrderChanged() {
        sorting_order = SELECTED_SORTING_ORDER;
        if (selected_node_name.length > 0)
            updateHighlightedEdges();
    }

    function onNodeSelected(node_name, focus = false) {
        if (selected_node_name == node_name) return;
        if (node_name === null) {
            selected_node_name = '';
        }
        // Check if the given node is in the visualization graph.
        if (!(node_name in node_ui_map)) {
            clearHighlights();
            return;
        }
        selected_node_name = node_name;
        if (focus) focusOnNode(selected_node_name);
        updateHighlightedEdges();
    }

    /* Zoom on a node when queried via the search bar.*/
    function focusOnNode(node_name) {
        const ui = node_ui_map[node_name];
        const [x, y, z] = ui.position;
        let size = ui.size || 10;
        size *= 5;
        scene.setViewBox({
            left: x - size,
            top: y - size,
            right: x + size,
            bottom: y + size,
        });
    }

    function updateHighlightedEdges() {
        clearHighlights();
        let edge_list = getHighlightedEdges();
        highlightEdges(edge_list);
    }

    function getHighlightedEdges() {
        let edges = [];
        let src_pos = graph.getNode(selected_node_name).ui.position;
        graph.forEachLinkedNode(selected_node_name, function (linked_node, link) {
            let dst_pos = linked_node.ui.position;
            let sorting_criterion;
            if (sorting_order == SORTING_ORDER.RELEVANCE) {
                sorting_criterion = link.data.weight;
            } else {
                sorting_criterion = name_data_associations[linked_node.id].popularity;
            }
            edges.push({
                from: src_pos,
                to: dst_pos,
                color: 0xFFFFFFFF,
                criterion: sorting_criterion
            });
        });

        edges.sort((a, b) => a.criterion - b.criterion);
        return edges.slice(0, 10);
    }

    function highlightEdges(edge_list) {
        edge_list.forEach(edge => highlighed_edges.add(edge));
    }

    function clearHighlights() {
        highlighed_edges.clear();
    }

    function dispose() {
        pointerEvents.dispose();
        bus.off('node-query', onNodeSelected);
        bus.off('sorting-update', onSortingOrderChanged);
        bus.off('nsfw-update', onNsfwChanged);
    }

    // Return API.
    return api;
}