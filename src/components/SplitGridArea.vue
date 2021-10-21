<template>
  <div
    v-show="show"
    class="vsg_area"
  >
    <expand-panel 
      v-if="expandPanelMode" 
      ref="expandPanel"
      @OnExpandChange="expandChange"
    >
      <template v-slot:expand-icon>
        <slot name="expand-icon" />
      </template>
      <template v-slot:title>
        <slot name="title"> 
          {{ title }} 
        </slot>
      </template>
      <template v-slot:header-append>
        <slot name="header-append" />
      </template>
      <template v-slot:content>
        <slot name="content" />
      </template>
    </expand-panel>
    <slot v-else />
  </div>
</template>
<script>
import UuidMixin from '@/mixins/uuid.js';
import ExpandPanel from './ExpandPanel.vue'
export default {
  name: 'SplitGridArea',
  components:{ExpandPanel},
  mixins: [UuidMixin],

  props: {
    expandAreaHeadHeight:{
      type:Number,
      default:32
    },
    minExpandBodyHeight:{
      type:Number,
      default:100
    },
    sizeUnit: {
      type: String,
      default: 'fr'
    },
    initSizeValue: {
      type: Number,
      default: 1
    },
    initMinSize:{
      type:Number,
      default:0,
    },
    initMaxSize:{
      type:Number,
      default:0
    },
    isExpand:{
      type:Boolean,
      default:false
    },
    priority:{
      type:Number,
      default:0
    },
    title:{
      type:String,
      default:undefined
    },
  },
  data:()=>({
    show:true,
    expandSize:null,
    sizeValue:null,
    inner_expand:false,
    content_height:null
  }),
  computed:{
    resizeable(){
      return  !this.expandPanelMode || this.inner_expand
    },
    expandPanelMode(){
       let expandPanelSlotsname=[
         'expand-icon',
         'title',
         'header-append',
         'content'
       ];
       return !!this.title || expandPanelSlotsname.reduce((res,val)=>(res || (val in this.$scopedSlots)),false)
    },
    minSize(){
      if(!this.expandPanelMode){
        return this.initMinSize
      }
      else if(this.inner_expand){
        return this.expandAreaHeadHeight + Math.min(this.content_height/3,this.minExpandBodyHeight)
      }
      else{
        return this.expandAreaHeadHeight;
      }
    },
    maxSize(){
      if(this.isLastNode){
        return Number.POSITIVE_INFINITY
      }
      if(!this.expandPanelMode){
        return this.initMaxSize
      }
      else if(this.inner_expand){
          if(this.initMaxSize > this.expandAreaHeadHeight){
            return this.initMaxSize
          }
          else{
            return this.expandAreaHeadHeight + this.content_height
          }
      }
      else{
        return this.expandAreaHeadHeight
      }
    },
    isLastNode() {
      let splitArea_childs = this.$parent.$children.filter(n=>n.$vnode.tag.endsWith('SplitGridArea'))
      return splitArea_childs.indexOf(this) === splitArea_childs.length - 1
    }
  },
  watch: {
    isExpand:{
      immediate:true,
      handler:async function(val){
        if(val){
          await this.$nextTick()
          this.$refs.expandPanel.expand();
        }
      }
    },
    inner_expand(val){
      this.emitInParentGrid('vsg:child.viewOnChange',{
        type:'grid-area',
        size:val ? this.expandSize : null,
        uuid:this.uuid,
        isExpand:val
      })
    }

  },
  mounted() {
    if(!this.expandPanelMode){
        this.sizeValue = this.initSizeValue
    }
    else if(this.isExpand){
        this.sizeValue = (this.initSizeValue > this.expandAreaHeadHeight) ? this.initSizeValue : this.expandAreaHeadHeight
    }
    else{
        this.sizeValue = this.expandAreaHeadHeight
    }
  },
  methods: {
    expandChange(event){
      let {expand,bodyHeight} = event
      this.inner_expand = expand;
      this.content_height = bodyHeight;
      this.$emit('OnExpandChange',{expand})
      this.$emit('update:is-expand', event.expand)
    },
    updateSize(val){
      this.sizeValue = val
      this.storeExpandSize()
    },
    storeExpandSize(){
      if(this.inner_expand){
        this.expandSize = this.sizeValue
      }
    },
    emitInParentGrid(event, data) {
      const $parent = (() => {
        if (this.$parent.$vnode.tag.endsWith('SplitGrid')) {
          return this.$parent;
        } else if (this.$parent.$parent.$vnode.tag.endsWith('SplitGrid')) {
          return this.$parent.$parent;
        } else {
          throw new Error(
            "[Vue Split Grid]: Either the parent or grandparent of a 'SplitGridArea' component should be a 'SplitGridComponent'."
          );
        }
      })();
      $parent.$emit(event, data);
    }
  }
};
</script>
<style scoped>
.vsg_area{
  position: relative;
  overflow: auto;
}
</style>
