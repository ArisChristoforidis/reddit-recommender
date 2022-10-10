import { createApp } from 'vue';
import App from './App.vue';
import SimpleTypeahead from 'vue3-simple-typeahead';
import 'mdb-vue-ui-kit/css/mdb.min.css';
import 'simplebar/dist/simplebar.min.css';

const app = createApp(App);
app.use(SimpleTypeahead);
app.mount('#app');