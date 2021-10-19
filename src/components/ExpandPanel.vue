<template>
  <div class="collapse">
    <div 
      :style="headStyle"  
      class="collapse-item-tab" 
      @click.prevent="expandChange">
      <slot name="expand-icon">
        <svg 
          v-if="!isExpand" 
          style="width:24px;height:24px" 
          viewBox="0 0 24 24">
          <path 
            fill="currentColor" 
            d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
        </svg>
        <svg 
          v-else 
          style="width:24px;height:24px"
          viewBox="0 0 24 24">
          <path 
            fill="currentColor" 
            d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" />
        </svg>
      </slot>
      <slot name="title">
        {{ title }}
      </slot>
      <div class="flex-grow" />
      <slot name="header-append" />
    </div>
    <transition 
      name="my" 
      @enter="enter"  
      @after-leave="afterLeave">
      <div 
        v-show="isExpand"
        class="collapse-item-wrap">
        <slot name="content" />
      </div>
    </transition>
  </div>
</template>
<script>
export default {
    props:{
        title:{
            type:String,
            default:''
        },
        id:{
            type:[Number,String],
            require:true,
            default:()=>(Math.random()*100)
        },
    },
    data:()=>({
        isExpand:false
    }),
    computed:{
        headStyle(){
             return {
                '--borderColor':'rgba(0, 0, 0, 0.14)',
                '--bkgColor':'rgb(255,255,255)'
            }
        }
    },
    methods: {
       expandChange(){
           this.isExpand = !this.isExpand;
       },
       enter(el){
           this.$emit('OnExpandChange',{id:this.id, expand:true, bodyHeight:el.scrollHeight})
       },
       afterLeave(el){
           this.$emit('OnExpandChange',{id:this.id, expand:false, bodyHeight:el.scrollHeight})
       }
    },
}
</script>
<style scoped>
.collapse{
    overflow: auto;
    display: flex;  
    height: 100%;
    flex-direction:column;
}

.collapse-item.is-active{
     border-bottom-color: transparent;
}
.collapse-item-tab {
    height:32px;
    width:100%;
    background-color:var(--bkgColor);
    flex-shrink: 0;
    display:flex;
    flex-direction: row;
    align-items: center;
    overflow: hidden;
}
.collapse-item-tab .flex-grow{
    flex-grow: 1;
}
.collapse-item-tab:hover{
    cursor: pointer;
}
.collapse-item-wrap{
    will-change: height;
    box-sizing: border-box;
    flex-grow: 1;
    overflow: auto;
    user-select: none;
}
</style>