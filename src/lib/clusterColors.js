import { cluster_count } from "./loadData"

function createColor(r=0, g=0, b=0) {
    let red = r;
    let green = g;
    let blue = b;

    return {
        r: red,
        g: green,
        b: blue,
    }
}

/* Convert rgb to hex. There has to be a better way to do this. */
function rgbToHex(color) {
    let r = color.r.toString(16);  
    let g = color.g.toString(16);
    let b = color.b.toString(16);
    let hex_str = r + g + b + 'ff';
    return parseInt(hex_str, 16);
}

let color_map = [];
/* Generate a color for each cluster. */
export default function getClusterColor (cluster) {

    // Taken from https://stackoverflow.com/a/43235
    let mix = createColor(255, 255, 255);
    if (color_map.length == 0) {
        for (let i=0; i < cluster_count; i++) {
            let r = parseInt((Math.random() * 255 + mix.r) / 2);
            let g = parseInt((Math.random() * 255 + mix.g) / 2);
            let b = parseInt((Math.random() * 255 + mix.b) / 2);
            let rgb_color = createColor(r, g, b);
            const color =  rgbToHex(rgb_color);
            color_map.push(color);
        }
    }
    return color_map[cluster];
}