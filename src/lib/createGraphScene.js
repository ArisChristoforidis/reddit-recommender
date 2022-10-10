// Based on https://github.com/anvaka/graph-start/blob/main/src/lib/createGraphScene.js

import { createScene } from 'w-gl';
import bus from './bus';
import createGraphUI from './graphUI';

export default function createGraphScene(canvas) {

    bus.on('data-loaded', onDataLoaded);

    let scene, rafHandle, graph_ui;
    let api = {
        dispose
    };

    initScene();

    function initScene() {
        if (scene) {
            scene.dispose();
            scene = null;
            cancelAnimationFrame(rafHandle);
        }

        scene = createScene(canvas);
        scene.setClearColor(18 / 255, 18 / 255, 18 / 255, 1);
        let initialSceneSize = 40000;
        scene.setViewBox({
            left: -initialSceneSize,
            top: -initialSceneSize,
            right: initialSceneSize,
            bottom: initialSceneSize,
        });
        rafHandle = requestAnimationFrame(frame);
    }

    function onDataLoaded() {
        graph_ui = createGraphUI(scene);
    }

    function frame() {
        rafHandle = requestAnimationFrame(frame);
        scene.renderFrame();
    }

    function dispose() {
        cancelAnimationFrame(rafHandle);
        scene.dispose();
        graph_ui.dispose();
        bus.off('data-loaded', onDataLoaded);
    }

    return api;
}