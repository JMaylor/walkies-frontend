import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

// fontawesome
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faDog,
  faKey,
  faUserSecret,
  faDatabase,
  faServer
} from "@fortawesome/free-solid-svg-icons";
import {
  faPython,
  faVuejs,
  faGithub
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// boostrap-vue
import { BootstrapVue } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

// fontawesome
library.add(
  faDog,
  faKey,
  faUserSecret,
  faDatabase,
  faPython,
  faVuejs,
  faServer,
  faGithub
);
Vue.component("font-awesome-icon", FontAwesomeIcon);

Vue.config.productionTip = false;
Vue.use(BootstrapVue);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
