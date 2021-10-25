import Vue from 'vue';
import VueVscodeSplit from '../src';
import App from './App.vue';

Vue.config.productionTip = false;

Vue.use(VueVscodeSplit);

new Vue({
  render: h => h(App)
}).$mount('#app');
