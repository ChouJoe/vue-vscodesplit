<template>
  <div class="wrapper">
    <div 
      ref="gutters" 
      class="gutter-container">
      <template v-for="(gutter,index) in splitGridGutters">
        <split-grid-gutter 
          :key="index" 
          :disabled="!gutter.resizeable" />
      </template>
    </div>
    <div
      v-show="show"
      ref="grid"
      class="vsg_split-grid"
      :style="gutterStyle"
    >
      <slot />
    </div>
  </div>
</template>
<script>
import SplitGrid from '@/split-grid/index.js';
import SplitGridGutter from './SplitGridGutter.vue'
import UuidMixin from '@/mixins/uuid.js';

const VALID_CHILD_COMPONENTS = [
  'SplitGrid',
  'SplitGridArea',
  'SplitGridGutter'
];
const VALID_CHILD_COMPONENTS_REGEX = new RegExp(
  `(${VALID_CHILD_COMPONENTS.join('|')})$`
);

export default {
  name: 'SplitGrid',
  components:{SplitGridGutter},
  mixins: [UuidMixin],
  props: {
    /**
     * Custom properties
     */
    direction: {
      type: String,
      default: 'column',
      validator: val => ['column', 'row'].includes(val)
    },
    gutterSize: {
      type: Number,
      default: 5
    },
    sizeUnit: {
      type: String,
      default: 'px'
    },
    initSizeValue: {
      type: Number,
      default: 1
    },
    strictMode: {
      type: Boolean,
      default: true
    },
    transition: {
      type: Object,
      default: null,
      validator: val => Object.keys(val).indexOf('name') > -1
    },
    /**
     * Split Grid properties
     */
    initMinSize: {
      type: Number,
      default: 0
    },
    initMaxSize: {
      type: Number,
      default: Number.POSITIVE_INFINITY
    },
    cursor: {
      type: String,
      default: null
    },
    writeStyle: {
      type: Function,
      default: (grid, gridTemplateProp, gridTemplateStyle) => {
        grid.style[gridTemplateProp] = gridTemplateStyle;
      }
    },
    proportionalLayout:{
      type:Boolean,
      default:true
    },
    priority:{
      type:Number,
      default:0
    },
    gutterCellSize:{
      type:Number,
      default:1
    },
    resizeable:{
      type:Boolean,
      default:true
    }
  },
  data() {
    return {
      gridTemplateProp:
        this.direction === 'column'
          ? 'grid-template-columns'
          : 'grid-template-rows',
      /**
       * Determine if a grid is a subgrid by checking the parents vNode tag for now, provide / inject
       * could be used but then we would need the default inject value functionality which is only
       * supported by >= Vue 2.5
       */
      isSubGrid:
        this.$parent.$vnode.tag.endsWith('SplitGrid') ||
        (this.$parent.$parent.$vnode &&
          this.$parent.$parent.$vnode.tag.endsWith('SplitGrid')),
      show:true,
      previousChildComponentSizes: {},
      splitGrid: null,
      gutterItems:null,
      viewItems:null,
      sizeValue:null,
      splitGridGutters:[]
    };
  },
  computed:{
    gutterStyle(){
      return {
                '--SplitColor':'rgba(0, 0, 0, 0.25)',         
            }
    },
    minSize(){
      return this.initMinSize
    },
    maxSize(){
      return this.initMaxSize
    }
  },
  watch: {
    show(value) {
      if (this.isSubGrid) {
        this.$parent.$emit('vsg:child.show', {
          type: 'grid',
          value,
          uuid: this.uuid,
          waitForTransition: this.transition != null
        });
      }
    },
  },
  provide: function() {
    return {
      gridData: {
        direction: this.direction,
        gutterSize: this.gutterSize,
        cursor:this.direction=='row' ? 'row-resize':'col-resize'
      }
    };
  },
  mounted(){
    let _this = this
    _this.sizeValue = _this.initSizeValue
    _this.validateChildComponents();
    let childComponents = this.getRenderedChildComponents()
    for(let i=0; i<childComponents.length-1;i++){
      this.splitGridGutters.push(childComponents[i]&&childComponents[i].componentInstance)
    }
    this.$nextTick(()=>{
          _this.initializeSplitGrid();
          _this.$on('vsg:child.add', _this.onChildAdded);
          _this.$on('vsg:child.remove', _this.onChildRemoved);
          _this.$on('vsg:child.resize', _this.onChildResize);
          _this.$on('vsg:child.show', _this.onChildShow);
          _this.$on('vsg:child.viewOnChange',_this.onViewChanged)
          if (_this.isSubGrid) {
            _this.$parent.$emit('vsg:child.add', {
              type: 'grid',
              uuid: _this.uuid,
              size: {
                unit: _this.sizeUnit,
                value: _this.sizeValue
              }
            });
          }
          else{
            //add window resize listener for root SplitGrid 
            window.addEventListener('resize',function(){
              _this.splitGrid.parentResize()
            })
          }
    })

  },
  beforeDestroy() {
    this.splitGrid.destroy(true);

    if (this.isSubGrid) {
      this.$parent.$emit('vsg:child.remove', {
        type: 'grid',
        uuid: this.uuid,
        waitForTransition: this.transition != null
      });
    }
  },
  methods: {
    updateSize(val){
      this.sizeValue = val
    },
    getGuttersandViews() {
      const gutters = [];
      const views = []
      this.$children.forEach((childVNode,index)=>{
        let {uuid} = childVNode;
        if (childVNode.$vnode.tag.endsWith('SplitGridGutter')) {
          gutters.push({
            componentInstance:childVNode,
            element: childVNode.$el,
            track:index,
            uuid
          });
        }
      })
      this.getVisibleChildComponents().forEach((childVNode, index) => {
       let {uuid} = childVNode.componentInstance;
       if(childVNode.tag.endsWith('SplitGrid')||childVNode.tag.endsWith('SplitGridArea')){
          views.push({
            componentInstance:childVNode.componentInstance,
            element: childVNode.elm,
            track:index,
            uuid
          })
        }
      });
      this.viewItems = views;
      this.gutterItems = gutters;
      return gutters;
    },
    getRenderedChildComponents() {
      const { default: childComponents} = this.$slots;
      const filterRenderedComponents = childVNode =>
        childVNode && childVNode.tag;
      if (this.strictMode) {
        return (
          childComponents
            // Filter components that have been hidden by using v-if in the parent component
            .filter(filterRenderedComponents)
        );
      } else {
        return childComponents
          .filter(filterRenderedComponents)
          .map(childVNode => {
            if (VALID_CHILD_COMPONENTS_REGEX.test(childVNode.tag)) {
              return childVNode;
            }
            const [nonSplitGridRootComponent] =
              childVNode.children || childVNode.componentInstance.$children;
            const nonSplitGridRootVNode =
              nonSplitGridRootComponent.$vnode || nonSplitGridRootComponent;
            if (!VALID_CHILD_COMPONENTS_REGEX.test(nonSplitGridRootVNode.tag)) {
              throw new Error(
                `[Vue Split Grid]: Expected root element of custom SplitGrid child component to be one of: '${VALID_CHILD_COMPONENTS.join(
                  "', '"
                )}'`
              );
            }
            return nonSplitGridRootVNode;
          });
      }
    },
    getVisibleChildComponents() {
      const renderedChildComponents = this.getRenderedChildComponents();
      return (
        renderedChildComponents
          // Filter components that have been hidden by using :show or :render
          .filter(childVNode => {
            return childVNode.componentInstance.show
          })
      );
    },
    getVisibleChildComponentStyles() {
      return this.getVisibleChildComponents().map(vNode => {
        const {
          componentInstance: { uuid }
        } = vNode;
        const size = this.previousChildComponentSizes[uuid];
        // When a sub grid has been removed it's size may have been removed already.
        if (size) {
          const { unit, value } = size;
          return `${value}${unit}`;
        }
        return;
      });
    },
    initializeSplitGrid() {
      const columnGutters = [];
      const rowGutters = [];
      this.createGridGutterCells();
      const gutters = this.getGuttersandViews();
      if (this.direction === 'column') {
        columnGutters.push(...gutters);
      } else {
        rowGutters.push(...gutters);
      }


      this.getRenderedChildComponents().forEach(vNode => {
        const {
          componentInstance: { size, sizeUnit, sizeValue, uuid }
        } = vNode;
        if (vNode.tag.endsWith('SplitGridGutter')) {
          this.previousChildComponentSizes = {
            ...this.previousChildComponentSizes,
            [uuid]: {
              unit: 'px',
              value: size
            }
          };
        } else {
          this.previousChildComponentSizes = {
            ...this.previousChildComponentSizes,
            [uuid]: {
              unit: sizeUnit,
              value: sizeValue
            }
          };
        }
      });

      const visibleChildComponentStyles = this.getVisibleChildComponentStyles();
      // force last viewItem to '1fr'
      visibleChildComponentStyles[visibleChildComponentStyles.length-1] = '1fr'

      const styleString = visibleChildComponentStyles.join( ` ${this.gutterCellSize}px `);

      // eslint-disable-next-line
      const {
        // animation,
        // direction,
        // gutterSize,
        // show,
        // sizeUnit,
        // sizeValue,
        // transition,
        ...splitGridProperties
      } = this.$props;
      this.$refs.grid.style[this.gridTemplateProp] = styleString;
      this.splitGrid = SplitGrid({
        ...splitGridProperties,
        gutterCellSize:this.gutterCellSize,
        direction:this.direction,
        columnGutters:this.direction === 'column'?this.gutterItems:[],
        rowGutters:this.direction === 'row'?this.gutterItems:[],
        viewItems:this.viewItems,
        uuid:this.uuid,
        element:this.$refs.grid,
        onDrag: this.onDrag,
        onDragStart: this.onDragStart,
        onDragEnd: this.onDragEnd
      });
      if(!this.isSubGrid){
        this.layout();
        this.splitGrid.parentResize()
      }
      
    },
    createGridGutterCells(){
        let childs = this.getRenderedChildComponents()
        // insert gutterCells between gridAreas
        for(let i =1; i<childs.length;i++){
            let vnode = childs[i]
            let gutter = document.createElement('div')
            gutter.classList.add('guttercell')
            this.$refs.grid.insertBefore(gutter,vnode.elm)
        }
    },
    layout(){
        this.splitGrid.layout();
        this.viewItems.forEach(v=>{
          if(v.componentInstance.$vnode.tag.endsWith('SplitGrid')){
                v.componentInstance.layout()
          }
        })
    },
    onViewChanged(view){
        this.splitGrid.viewChanged(view);
    },
    updateGridCSS() {
      // const visibleChildComponentStyles = this.getVisibleChildComponentStyles();
      // const styleString = visibleChildComponentStyles.join(' ');
      // this.$el.style[this.gridTemplateProp] = styleString;
    },
    updateGutters() {
      // const newGutters = this.getGuttersandViews();
      // const existingColumnGutters = Object.values(this.splitGrid.columnGutters);
      // const existingRowGutters = Object.values(this.splitGrid.rowGutters);

      // existingColumnGutters.forEach(({ track }) => {
      //   this.splitGrid.removeColumnGutter(track, true);
      // });
      // existingRowGutters.forEach(({ track }) => {
      //   this.splitGrid.removeRowGutter(track, true);
      // });

      // if (this.direction === 'column') {
      //   newGutters.forEach(({ element, track }) => {
      //     this.splitGrid.addColumnGutter(element, track);
      //   });
      // } else {
      //   newGutters.forEach(({ element, track }) => {
      //     this.splitGrid.addRowGutter(element, track);
      //   });
      // }
    },
    validateChildComponents() {
      if (!this.strictMode) {
        return;
      }
      const { default: childComponents } = this.$slots;
      const hasValidChildComponents = childComponents.every(
        ({ componentInstance, tag }) =>
          // vNode instances with an undefined componentInstance might be hidden using 'v-if', assume it is a valid tag.
          typeof componentInstance === 'undefined' ||
          VALID_CHILD_COMPONENTS_REGEX.test(tag)
      );
      if (!hasValidChildComponents) {
        throw new Error(
          `Invalid child components. SplitGrid only allows ${VALID_CHILD_COMPONENTS.join(
            ', '
          )} as children.`
        );
      }
    },
    /**
     * Split Grid events
     */
    onDrag(event) {
      const newChildComponentSizes = {};
      this.viewItems.forEach(v=>{
          newChildComponentSizes[v.componentInstance.uuid]={
            value:v.componentInstance.sizeValue,
            unit:v.componentInstance.sizeUnit
          }
      })
      this.previousChildComponentSizes = {
        ...this.previousChildComponentSizes,
        ...newChildComponentSizes
      };
      this.$emit('drag', event);
    },
    onDragStart(event) {
      let {uuid} = event
      this.$emit('drag-start', event);
      let gutter = this.gutterItems.find((e)=>(e.uuid == uuid))
      gutter && (gutter.componentInstance.setActive(true))
    },
    onDragEnd(event) {
      let {uuid} = event
      this.$emit('drag-end', event);
      let gutter = this.gutterItems.find((e)=>(e.uuid == uuid))
       gutter && (gutter.componentInstance.setActive(false))
    },
    /**
     * Child events
     */
    // onChildAdded({ uuid, size }) {
    //  // to be implement
    // },
    // onChildRemoved({ uuid, waitForTransition }) {
    //   //to be implement
    // },
    // onChildResize({ size: { value, unit }, uuid }) {
    //   //to be implement
    // },
    // onChildShow({ type, value, uuid, waitForTransition }) {
    //   //to be implement
    // }
  }
};
</script>
<style scoped >
.vsg_split-grid{
  display: grid;
  box-sizing: border-box;
  height:100%;
  position: relative;
}
.gutter-container{
  position: absolute;
	width: 100%;
	height: 100%;
	pointer-events: none;
}
.wrapper{
  position: relative;
  height:100%;
  width:100%;
}
.vsg_split-grid >>> .guttercell{
  background-color:var(--SplitColor);
}
</style>
