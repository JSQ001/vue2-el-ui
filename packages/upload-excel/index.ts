import Vue from "vue";
import Component from "./index.vue";

export default (vue: typeof Vue) => vue.component(Component.name, Component);



