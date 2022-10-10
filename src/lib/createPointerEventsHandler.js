// Based on https://github.com/anvaka/map-of-reddit/blob/main/src/lib/createPointerEventsHandler.js
// The MIT License (MIT) Copyright (c) 2021-2022 Andrei Kashcha

/**
 * This class is responsible for finding nodes under cursor
 */
import RBush from 'rbush';
import knn from 'rbush-knn';
import bus from './bus';
import { name_data_associations } from './loadData';
import { SHOW_NSFW } from './config';

export default function createPointerEventsHandler(scene_ref, options) {
    let scene = scene_ref;
    scene.on('click', handleClick);
    scene.on('transform', handleTransform);

    const spatialIndex = new RBush();
    let moved = false;
    let edges = options.getEdges();
    let last_z = 0;

    let api = {
        addNode,
        dispose,
        getIndex() {
            return spatialIndex;
        }
    }

    function handleTransform(e) {
        let cameraZPosition = e.drawContext.view.position[2];
        let z = Math.min(cameraZPosition, 8000);
        edges.width = Math.max(1, 40 * z / 8000);
        moved = true;
    }

    function addNode(ui) {
        let position = ui.position;
        let r = ui.size / 2;

        spatialIndex.insert({
            minX: position[0] - r,
            minY: position[1] - r,
            maxX: position[0] + r,
            maxY: position[1] + r,
            ui,
        });
    }

    function dispose() {
        scene.off('click', handleClick);
        scene.off('transform', handleTransform);
    }

    function handleClick(e) {
        let ui = findNearest(e.x, e.y);
        if (ui !== undefined && (SHOW_NSFW || !name_data_associations[ui.name].nsfw)) {
            bus.fire('node-query', ui.name);
        } else if (!ui && !moved) {
            bus.fire('node-query', null);
            scene.renderFrame();
        }
        moved = false;
    }

    function findNearest(x, y) {
        const neighborIds = knn(spatialIndex, x, y, 1);
        let neighbor = neighborIds[0];
        if (neighbor === undefined) return;
        let ui = neighbor.ui;

        let [uiX, uiY] = ui.position;
        let dist = Math.hypot(x - uiX, y - uiY);
        if (dist < ui.size / 2) return ui;
    }

    return api;
}