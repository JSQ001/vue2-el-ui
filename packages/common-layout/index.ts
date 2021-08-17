import Vue, { PluginFunction } from "vue";
import Table from "./index.vue";

const install: PluginFunction<undefined> = (vue: typeof Vue) => {
  vue.component("cel-table", Table);
};

export default install;
