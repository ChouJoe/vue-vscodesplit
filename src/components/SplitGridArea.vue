<template>
  <div
    v-show="show"
    class="vsg_area"
  >
    <slot />
  </div>
</template>
<script>
import UuidMixin from '@/mixins/uuid.js';

export default {
  name: 'SplitGridArea',
  mixins: [UuidMixin],
  props: {
    sizeUnit: {
      type: String,
      default: 'fr'
    },
    initSizeValue: {
      type: Number,
      default: 1
    },
    minSize:{
      type:Number,
      default:0,
    },
    maxSize:{
      type:Number,
      default:Number.POSITIVE_INFINITY
    },
    isExpand:{
      type:Boolean,
      default:false
    },
    priority:{
      type:Number,
      default:0
    }
  },
  data:()=>({
    show:true,
    expandSize:null,
    sizeValue:null
  }),
  watch: {
    isExpand(val){
      this.emitInParentGrid('vsg:child.viewOnChange',{
        type:'grid-area',
        size:val ? this.expandSize : null,
        uuid:this.uuid,
        isExpand:val
      })
    }
  },
  mounted() {
    this.sizeValue = this.initSizeValue
    // this.emitInParentGrid('vsg:child.add', {
    //   type: 'grid-area',
    //   uuid: this.uuid,
    //   size: {
    //     unit: this.sizeUnit,
    //     value: this.sizeValue
    //   }
    // });
  },
  methods: {
    updateSize(val){
      this.sizeValue = val
      this.storeExpandSize()
    },
    storeExpandSize(){
      if(this.isExpand){
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
