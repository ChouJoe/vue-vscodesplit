<template>
  <div style="height: calc(100vh)">
    <SplitGrid 
      v-bind="splitGridOptions.rootGridOptions"
      @drag="log('drag',$event)"
      @drag-start="log('drag-start', $event)"
      @drag-end="log('drag-end', $event)"
    >
      <SplitGrid  
        class="leftPanel"
        v-bind="splitGridOptions.leftGridOptions.rootGridOptions" 
        @drag="log('drag', $event)"
        @drag-start="log('drag-start', $event)"
        @drag-end="log('drag-end', $event)"
        
      >
        <SplitGridArea 
          v-bind="splitGridOptions.leftGridOptions.splitAreaOptions[0]" 
          title="panel">
          <template v-slot:header-append>
            <svg 
              style="width:16px;height:16px" 
              viewBox="0 0 24 24">
              <path 
                fill="currentColor" 
                d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z" />
            </svg>
          </template>
          <template v-slot:content>
            <template v-for="(i) in 15">
              <div :key="i">
                {{ `---${i}` }}
              </div>
            </template>
          </template>
        </SplitGridArea>
        <SplitGridArea 
          v-bind="splitGridOptions.leftGridOptions.splitAreaOptions[1]"  
          title="panel2">
          <template v-slot:content>
            <template v-for="(i) in 15">
              <div :key="i">
                {{ `---${i}` }}
              </div>
            </template>
          </template>
        </SplitGridArea>
        <SplitGridArea 
          v-bind="splitGridOptions.leftGridOptions.splitAreaOptions[2]"
          title="panel3">
          <template v-slot:content>
            <template v-for="(i) in 15">
              <div :key="i">
                {{ `---${i}` }}
              </div>
            </template>
          </template>
        </SplitGridArea>
        <SplitGridArea 
          v-bind="splitGridOptions.leftGridOptions.splitAreaOptions[3]"
          title="panel4">
          <template v-slot:content>
            <template v-for="(i) in 40">
              <div :key="i">
                {{ `---${i}` }}
              </div>
            </template>
          </template>
        </SplitGridArea>
      </SplitGrid>
      <SplitGrid 
        v-bind="splitGridOptions.rightGridOptions.rootGridOptions">
        <SplitGridArea v-bind="splitGridOptions.rightGridOptions.splitAreaOptions[0]">
          <div>{{ text }}</div>
        </SplitGridArea>
        <SplitGridArea v-bind="splitGridOptions.rightGridOptions.splitAreaOptions[1]">
          <p>
            defcdx
          </p>
        </SplitGridArea>
      </SplitGrid>
    </SplitGrid>
  </div>
</template>
<script>
export default {
    props:{
        expandAreaHeadHeight:{
            type:Number,
            default:32
        }
    },

    data(){return {
        minExpandBodyHeight:100,
        tab: null,
        items: [
          'web', 'shopping', 'videos', 'images', 'news',
        ],
        text: "vue-vscodeSplit is a  Vue Wrapper reconstruction baseed on [Vue Split Grid](https://github.com/stijlbreuk/vue-split-grid),  vue-vscodeSplit implements split function similar to VsCode editor, it uses three components `<SplitGrid>`, `<SplitGridArea>` and `<SplitGridGutter>`, same as [Vue Split Grid](https://github.com/stijlbreuk/vue-split-grid),and there is a component `<ExpandPanel>` used to implement the same shrink&expand functionality  as vscode's explorer panel",
        splitGridOptions: {
            rootGridOptions:{
                gutterSize:5,
                proportionalLayout:false,
            },
            leftGridOptions:{
                splitAreaOptions:[
                        {'sizeUnit':'px','isExpand':true,'initSizeValue':200},
                        {'sizeUnit':'px','isExpand':false,},
                        {'sizeUnit':'px','isExpand':false,},
                        {'isExpand':false,}
                ],
                rootGridOptions:{
                    initSizeValue:250,
                    initMinSize:100,
                    initMaxSize:500,
                    gutterSize:5,
                    priority:0,
                    sizeUnit:'px',
                    direction:'row'
                }

            },
            rightGridOptions:{
                splitAreaOptions:[
                    {'sizeUnit':'px','initSizeValue':500,'initMinSize':100,'initMaxSize':Number.POSITIVE_INFINITY},
                    {'sizeUnit':'fr','initSizeValue':1,'initMinSize':100,'initMaxSize':Number.POSITIVE_INFINITY},
                ],
                rootGridOptions:{
                    initMinSize:400,
                    initMaxSize:Number.POSITIVE_INFINITY,
                    gutterSize:5,
                    priority:1,
                    direction:'row'
                }

            },
        },
    }},
    computed:{
    },
    methods:{
        log() {
            console.log(...arguments);
        },
        /**dynamic change the size of panel based on the size of  child dom element when expand changed */
        expandChange(val){
            let targetIndex = this.splitGridOptions.leftGridOptions.splitAreaOptions.findIndex(e=>e.id === val.id)
            if(targetIndex>-1){
                let target = this.splitGridOptions.leftGridOptions.splitAreaOptions[targetIndex]
                target.isExpand = val.expand;
                target.minSize =target.isExpand? this.expandAreaHeadHeight + Math.min(val.bodyHeight/3,this.minExpandBodyHeight) : this.expandAreaHeadHeight
                if(targetIndex != this.splitGridOptions.leftGridOptions.splitAreaOptions.length-1){
                    target.maxSize = target.isExpand?  this.expandAreaHeadHeight + val.bodyHeight : this.expandAreaHeadHeight;
                }
            }
        }
    }
}
</script>
<style >

.leftPanel{
  overflow: auto;
}
*{
  margin: 0;
  padding: 0;
}
body,html{
    margin: 0;
    padding: 0;
}
/*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
    background-color: #CCCCCC;
    position: absolute;
    right: 0;
    bottom: 0;
}

/*定义滚动条轨道 内阴影+圆角*/
::-webkit-scrollbar-track {
    /* -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3); */
    border-radius: 10px;
    background-color: #fff;
}

/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb {
    border-radius: 10px;
    /* -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3); */
    background-color: #CCCCCC;
}
</style>