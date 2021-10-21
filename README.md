# **vue-vscodesplit**
<p align="center">
    <img src="https://github.com/ChouJoe/vue-vscodesplit/blob/master/images/vue-vscodeSplit.gif" alt="vue-vscodeSplit.gif"/>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/vue-vscodesplit">
    <img src="https://img.shields.io/npm/v/vue-vscodesplit.svg" alt="Version"/>
  </a>
  <a href="https://www.npmjs.com/package/vue-vscodesplit">
    <img src="https://img.shields.io/npm/dt/vue-vscodesplit.svg" alt="Downloads"/>
  </a>
  <a href="https://www.npmjs.com/package/vue-vscodesplit">
    <img src="https://img.shields.io/npm/l/vue-vscodesplit.svg" alt="License"/>
  </a>
</p>

## *Description*
vue-vscodesplit is a  Vue Wrapper reconstruction baseed on [Vue Split Grid](https://github.com/stijlbreuk/vue-split-grid), there  three main components `<SplitGrid>`, `<SplitGridArea>`, `<SplitGridGutter>`, same as [Vue Split Grid](https://github.com/stijlbreuk/vue-split-grid), the difference is that `<SplitGridGutter>` will be created automatically in `<SplitGrid>` in this library, so users only need to use `<SplitGrid>`, `<SplitGridArea>` when using  vue-vscodesplit.  and vue-vscodesplit implements split function similar to VsCode editor, include  support for viewarea expandsion, spliter highlight when hovered and window resize.
## Installation
```Shell
npm install --save vue-vscodesplit
```
## Usage

ES6 modules, import components manually.

```HTML
<template>
  <div id="app">
    <SplitGrid  v-bind="splitGridOptions.rootGridOptions">
      <SplitGrid v-bind="splitGridOptions.leftGridOptions.rootGridOptions" >
        <SplitGridArea 
         v-bind="splitGridOptions.leftGridOptions.splitAreaOptions[0]">
           <template v-slot:content>
               <!-- <content> -->
           </template>
        </SplitGridArea>
        <SplitGridArea 
         v-bind="splitGridOptions.leftGridOptions.splitAreaOptions[1]">
            <template v-slot:content>
               <!-- <content> -->
           </template>
        </SplitGridArea>
        <SplitGridArea 
         v-bind="splitGridOptions.leftGridOptions.splitAreaOptions[2]">
            <template v-slot:content>
               <!-- <content> -->
           </template>
        </SplitGridArea>
      </SplitGrid>
      <SplitGridArea 
        v-bind="splitGridOptions.rightGridOptions.rootGridOptions">
      </SplitGridArea>
    </SplitGrid>
  </div>
</template>
<script>
import { SplitGrid, SplitGridArea} from 'vue-vscodesplit';

export default {
  name: 'App',
  components: {
    SplitGrid,
    SplitGridArea
  },
  data:()=>({
      splitGridOptions:{
          rootGridOptions:{
                gutterSize:5,
                proportionalLayout:false
          },
          leftGridOptions:{
                splitAreaOptions:[
                    {'isExpand':false,'initSizeValue':100,'initMinSize':100,'initMaxSize':Number.POSITIVE_INFINITY},
                    {'isExpand':false,'initSizeValue':100,'initMinSize':100,'initMaxSize':Number.POSITIVE_INFINITY},
                    {'isExpand':false,'initSizeValue':100,'initMinSize':100,'initMaxSize':Number.POSITIVE_INFINITY}
                ],
                rootGridOptions:{
                    initSizeValue:250,
                    initMinSize:100,
                    initMaxSize:500,
                    gutterSize:5,
                    direction:'row'
                }
            },
            rightGridOptions:{
                initMinSize:400,
                initMaxSize:Number.POSITIVE_INFINITY,
                gutterSize:5,
                direction:'row'
            }
      }
  })
};
</script>
<style>
body {
  margin: 0;
}
</style>

```
- Pay attention to the option of last child element in a `<SplitGrid>`,since vue-vscodesplit is based on CSS grid, the last child element we fill with the remaining size by default('1fr'),so it doesnt need to indicate the 'initSizeValue',and also , you had better to indicate the 'maxSize' to be 'Number.POSITIVE_INFINITY' of last child element.
- props about sizevalue(initMaxSize,initMinSize,initSizeValue,etc) only support 'px' for now
## Components
### * SplitGrid
The `<SplitGrid>` component is the main component for creating Split Grids. `<SplitGrid>` components may be nested.
#### *Props*
| name   | type  |  default| description| 
|:----:   |:----:|  :----: |    :----:   |
| direction |String|"cloumn"|"cloumn" or "row",direction of splitgrid |
|gutterSize|Number|5|define default size of  `<SplitGridGutter>` when `<SplitGridGutter>` is hovered or dragged by mouse, unit 'px'|
|gutterCellSize|Number|1|define default size of  `<SplitGridGutter>` in this split grid when `<SplitGridGutter>` is deactive, unit 'px' |
|sizeUnit|String|'px'|only support 'px' for now|
|initSizeValue|Number| |inital size(px) of splitgrid,only used when splitgrid is nested|
|initMinSize|Number||minSize(px) of splitgrid,only used when splitgrid is nested|
|initMaxSize|Number||maxSize(px) of splitgrid,only used when splitgrid is nested|
|cursor|String| |define cursor when mouse on `<SplitGridGutter>`, default value:'row-resize' for direction of 'row','col-resize' for direction of 'cloumn  |
|proportionalLayout|Boolean|true|Determines whether the view resize is based on the percentage occupied by each subviewArea|
|priority|Number||0:lowPriority 1:highPriority, Determines this `<SplitGrid>` go to resize first or last when window resize event happened|
|resizeable|Boolean|true|indicate the viewarea can be resized by dragging `<SplitGridGutter>`|

#### *events*
- dragStart
    ```js
    //param
    event:{
        direction// grid direction,
        uuid://uuid of component,
        puuid://uuid of parent component, 
        start//start position of mouse when drag the <SplitGridGutter>
        }
    ```
- drag
    ```js
    //param
    {
        direction// grid direction,
        uuid://uuid of component,
        puuid://uuid of parent component, 
        current//current position of mouse when drag the <SplitGridGutter>
        }
    ```
- dragEnd
    ```js
    //param
    {
        direction// grid direction,
        uuid://uuid of component,
        puuid://uuid of parent component, 
        }
    ```
#### *Slots*
- default
    ```js
    //desc: slots for <SplitGrid> <SplitGridArea>
    ```

### * SplitGridArea
- The `<SplitGridArea>` component should be used inside `<SplitGrid>` components, these are your columns or rows, depending on the `direction` you specified on the `<SplitGrid>` 
- `<SplitGridArea>` performance depend on props and slots user uesd.it perfom like a expandPanel when `title` props is used or one of the follow slots `slot<expand-icon>``slot<title>``slot<header-append>``slot<content>` are used, otherwise it perform like a common container
- `<SplitGridArea>` components shouldn't be used on their own.
#### *Props*
| name   | type  |  default| description| 
|:----:   |:----:|  :----: |    :----:   |
|title|String||title of header,only used when `<SplitGridArea>` perform as expandPanel|
|expandAreaHeadHeight|Number|32|indicate header height when `<SplitGridArea>` perform as expandPanel|
|minExpandBodyHeight|Number|100|minimum height of body when `<SplitGridArea>` is expand as a expandPanel|
|isExpand |Boolean|false|Indicates whether the  `<SplitGridArea>` is expanded. Only used when the `<SplitGridArea>` perform as expandPanel,similar to what the explorer panel implements in VsCode |
|sizeUnit|String|'px'|only support 'px' for now|
|initSizeValue|Number| |inital size(px) of splitgrid,only meaningful when `<SplitGridArea>`  perform as common container|
|initMinSize|Number||init minSize(px) of `<SplitGridArea>`|
|initMaxSize|Number||init maxSize(px) of `<SplitGridArea>`|
|priority|Number||0:lowPriority 1:highPriority, Determines this `<SplitGridArea>`  go to resize first or last when window resize event happened|
#### *slots*
##### `<SplitGridArea>`  perform as common container
- default
    ```js
    //desc:when default slot is used, `<SplitGridArea>` perform as common container
    ```
##### `<SplitGridArea>`  perform as expandPanel
- title
    ```js
    //desc: header title
    ```
- header-append
    ```js
    //desc: slot for apeend icons for header
    ```
- expand-icon
    ```js
    //desc:slot for expansion icon for header
    ```
- content
    ```js
    //desc: slot for expand body content
    ```
### *events*
- OnExpandChange
    ```js
    //desc: expand change event
    //props:
    {
        expand:boolean
    }
    ```
