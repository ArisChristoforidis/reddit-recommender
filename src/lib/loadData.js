import initSqlJs from "sql.js/dist/sql-wasm.js";
import createGraph from "ngraph.graph";
import bus from "./bus";

var cluster_count = 0;
var visualization_graph, full_graph;
var id_name_associations, name_data_associations, subreddit_names_list;

export async function loadData() {
    // Basic setup for db connection.
    const sql_promise = initSqlJs();
    const data_promise = fetch("data.sqlite").then(res => res.arrayBuffer());
    const [SQL, buf] = await Promise.all([sql_promise, data_promise]);
    const db = new SQL.Database(new Uint8Array(buf));

    // These are used for pulling data from the different UI elements.
    id_name_associations = {};
    name_data_associations = {};
    subreddit_names_list = [];

    // Subreddit names.
    const subreddit_names = db.exec("SELECT * FROM subreddit_name")[0];
    for (const data of subreddit_names.values) {
        const [id, name, nsfw, popularity] = data;
        id_name_associations[id] = name;
        name_data_associations[name] = {
            popularity: popularity,
            nsfw: nsfw
        };
        subreddit_names_list.push(name);
    }

    // The visualization graph is used for showing the most popular nodes.
    visualization_graph = createGraph();
    // The full graph contains all nodes and edges in the database and is used for
    // generating suggestions.
    full_graph = createGraph();
    
    // Nodes.
    const graph_nodes = new Set();
    const nodes = db.exec("SELECT * FROM node")[0];
    for (const data of nodes.values) {
        const [id, size, cluster, x, y] = data;
        const name = id_name_associations[id];
        const node_data = {
            size: size,
            cluster: cluster,
            x: x,
            y: y
        }
        visualization_graph.addNode(name, node_data);
        graph_nodes.add(name);

        // Count the clusters.
        if (cluster > cluster_count) {
            cluster_count = cluster;
        }
    }

    // Edges.
    const edges = db.exec("SELECT * FROM edge")[0];
    for (const data of edges.values) {
        const [src_id, dst_id, weight] = data;
        const src = id_name_associations[src_id];
        const dst = id_name_associations[dst_id];
        if (graph_nodes.has(src) && graph_nodes.has(dst)) {
            // Check if the link should also be placed on the visualization graph.
            visualization_graph.addLink(src, dst, {
                weight: weight
            });
        }
        full_graph.addLink(src, dst, {
            weight: weight
        });
    }
    // Notify listeners.
    bus.fire('data-loaded');
}

export {
    full_graph,
    visualization_graph,
    name_data_associations,
    subreddit_names_list,
    cluster_count
};