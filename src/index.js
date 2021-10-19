import SplitGridComponent from './components/SplitGrid.vue';
import SplitGridAreaComponent from './components/SplitGridArea.vue';
import SplitGridGutterComponent from './components/SplitGridGutter.vue';
import ExpandPanel from './components/ExpandPanel.vue'
const components = {
  SplitGrid: SplitGridComponent,
  SplitGridArea: SplitGridAreaComponent,
  SplitGridGutter: SplitGridGutterComponent,
  ExpandPanel: ExpandPanel
};

// Declare install function executed by Vue.use()
function install(Vue) {
  if (install.installed) {
    return;
  }
  install.installed = true;
  Object.entries(components).forEach(([key, component]) => {
    Vue.component(key, component);
  });
}

// Create module definition for Vue.use()
const plugin = {
  install
};

// Auto-install when vue is found (eg. in browser via <script> tag)
let GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

export default {
  install,
  SplitGrid: SplitGridComponent,
  SplitGridArea: SplitGridAreaComponent,
  SplitGridGutter: SplitGridGutterComponent,
  ExpandPanel: ExpandPanel
};
