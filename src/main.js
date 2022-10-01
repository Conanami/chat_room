import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import store from "./store";
import i18n from "@/locales/";

createApp(App).use(ElementPlus).use(store).use(router).use(i18n).mount("#app");
