<template>
  <div
    :class="{'vsg_gutter':true, 
             'vsg_gutter-horizontal': gridData.direction === 'row', 
             'vsg_gutter-vertical': gridData.direction === 'column',
             'vsg_gutter_active':active_drag,
             'vsg_gutter_disabled':disabled }"
    :style="{ cursor: gridData.cursor,...SplitStyle }"
  />
</template>
<script>
import UuidMixin from '@/mixins/uuid.js';

export default {
  name: 'SplitGridGutter',
  mixins: [UuidMixin],
  props: {
    disabled:{
      type:Boolean,
      default:false
    },
    size: {
      type: Number,
      default() {
        return this.gridData.gutterSize;
      }
    },
    transition: {
      type: Object,
      default: null,
      validator: (val) => Object.keys(val).indexOf('name') > -1
    }
  },
  data:()=>({
    active_drag:false,
    show:true,
    offset:undefined
  }),
  inject: ['gridData'],
  computed:{
        SplitStyle(){
            return {
                '--SplitColor':'rgba(0, 0, 0, 0)',
                '--ActiveColor':'rgba(0, 195, 255, 0.994)',
                '--size':`${this.size}px`,
                '--offset':`${this.offset}px`
            
            }
        },
  },
  methods: {
    setActive(flag){
      this.active_drag = flag
    },
    setOffset(val){
      this.offset = val
    }
  }
};
</script>
<style  >

.vsg_gutter {
  position: absolute;
  pointer-events: initial;
	z-index: 35;
  background-color:  var(--SplitColor);
}
.vsg_gutter-horizontal{
  height: var(--size);
  left:0;
  top:var(--offset);
  width:100%;
}
.vsg_gutter-vertical{
  height: 100%;
  left:var(--offset);
  top:0;
  width:var(--size);
}
.vsg_gutter_active{
  background-color: var(--ActiveColor);
}
.vsg_gutter:hover {
  background-color: var(--ActiveColor);
}
.vsg_gutter_disabled{
  cursor: default !important;
	pointer-events: none !important;
}


</style>
