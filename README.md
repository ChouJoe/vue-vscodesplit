# **vue-vscodesplit**
## *Description*
vue-vscodesplit is a  Vue Wrapper reconstruction baseed on [Vue Split Grid](https://github.com/stijlbreuk/vue-split-grid),  vue-vscodesplit implements split function similar to VsCode editor, it uses three components `<SplitGrid>`, `<SplitGridArea>` and `<SplitGridGutter>`, same as [Vue Split Grid](https://github.com/stijlbreuk/vue-split-grid),and there is a component `<ExpandPanel>` used to implement the same shrink&expand functionality  as vscode's explorer panel
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
            <ExpandPanel></ExpandPanel>
        </SplitGridArea>
        <SplitGridArea 
         v-bind="splitGridOptions.leftGridOptions.splitAreaOptions[1]">
            <ExpandPanel></ExpandPanel>
        </SplitGridArea>
        <SplitGridArea 
         v-bind="splitGridOptions.leftGridOptions.splitAreaOptions[2]">
            <ExpandPanel></ExpandPanel>
        </SplitGridArea>
        <template v-slot:gutter>
          <SplitGridGutter />
          <SplitGridGutter />
        </template>
      </SplitGrid>
      <template v-slot:gutter>
          <SplitGridGutter />
      </template>
      <SplitGridArea 
        v-bind="splitGridOptions.rightGridOptions.rootGridOptions">
      </SplitGridArea>
    </SplitGrid>
  </div>
</template>
<script>
import { SplitGrid, SplitGridArea, SplitGridGutter ,ExpandPanel} from 'vue-vscodesplit';

export default {
  name: 'App',
  components: {
    SplitGrid,
    SplitGridArea,
    SplitGridGutter,
    ExpandPanel
  },
  data:()=>({
      splitGridOptions:{
          rootGridOptions:{
                gutterSize:5,
                proportionalLayout:false
          },
          leftGridOptions:{
                splitAreaOptions:[
                    {'id':1,'initSizeValue':100,'isExpand':false,'minSize':50,'maxSize':120},
                    {'id':2,'initSizeValue':100,'isExpand':false,'minSize':50,'maxSize':150},
                    {'id':3,'isExpand':false,'minSize':50,'maxSize':Number.POSITIVE_INFINITY}
                ],
                rootGridOptions:{
                    initSizeValue:250,
                    minSize:100,
                    maxSize:500,
                    gutterSize:5,
                    sizeUnit:'px',
                    direction:'row'
                }
            },
            rightGridOptions:{
                minSize:400,
                maxSize:Number.POSITIVE_INFINITY,
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
- props about sizevalue(maxSize,minSize,initSizeValue,etc) only support 'px' for now
## Components
### * SplitGrid
The `<SplitGrid>` component is the main component for creating Split Grids. `<SplitGrid>` components may be nested.
#### *Props*
| name   | type  |  default| description| 
|:----:   |:----:|  :----: |    :----:   |
| direction |String|"cloumn"|direction of splitgrid |
|gutterSize|Number|5|define default size of component `<SplitGridGutter>` in this split grid when `<SplitGridGutter>` is hovered or dragged by mouse, unit 'px'|
|gutterCellSize|Number|1|define default size of component `<SplitGridGutter>` in this split grid when `<SplitGridGutter>` is deactive, unit 'px' |
|sizeUnit|String|'px'|only support 'px' for now|
|initSizeValue|Number| |inital size(px) of splitgrid,only used when splitgrid is nested|
|minSize|Number||minSize(px) of splitgrid,only used when splitgrid is nested|
|maxSize|Number||maxSize(px) of splitgrid,only used when splitgrid is nested|
|cursor|String| |define cursor when mouse on `<SplitGridGutter>`, default value:'row-resize' for direction of 'row','col-resize' for direction of 'cloumn  |
|proportionalLayout|Boolean|true|Determines whether the view resize is based on the percentage occupied by each subviewArea|
|priority|Number||0:lowPriority 1:highPriority, Determines this `<SplitGrid>` go to resize first or last when window resize event happened|

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
- gutter
     ```js
    //desc: slots for <SplitGridGutter>
    ```

### * SplitGridArea
The `<SplitGridArea>` component should be used inside `<SplitGrid>` components, these are your columns or rows, depending on the `direction` you specified on the `<SplitGrid>`.

`<SplitGridArea>` components shouldn't be used on their own.
#### *Props*
| name   | type  |  default| description| 
|:----:   |:----:|  :----: |    :----:   |
|isExpand |Boolean|false|Indicates whether the content in `<SplitGridArea>` is expanded. Only used when the content supports expansion,similar to what the explorer panel implements in VsCode |
|sizeUnit|String|'px'|only support 'px' for now|
|initSizeValue|Number| |inital size(px) of splitgrid|
|minSize|Number||minSize(px) of splitgrid|
|maxSize|Number||maxSize(px) of splitgrid|
|priority|Number||0:lowPriority 1:highPriority, Determines this `<SplitGridArea>`  go to resize first or last when window resize event happened|

### * SplitGridGutter
`<SplitGridGutter>` should be used inside `<SplitGrid>` components, these are your column or row gutters, depending on the `direction` you specified on the `<SplitGrid>`.

`<SplitGridGutter>` components shouldn't be used on their own.
#### *Props*
| name   | type  |  default| description| 
|:----:   |:----:|  :----: |    :----:   |
|disabled |Boolean|false|disabled drag|
|size|Number||size of `<SplitGridGutter>`,default value based on prop "gutterSize" in `<SplitGrid>` |
### * ExpandPanel
`<ExpandPanel>` implement a 'shrink&expand' panel,which is similar to explorer panel of VSCODE,This component is separated from vue-vscodesplit , allowing vue-vscodesplit to implement pure layout functions, and the component can be used independently without vue-vscodesplit
#### *Props*
| name   | type  |  default| description| 
|:----:   |:----:|  :----: |    :----:   |
|id |[Number,Stirng]||must be gived and unqiue|
|title|String|| define title in header-panel |
#### *events*
- OnExpandChange
    ```js
    //param
    event:{
        id// id,
        expand//boolean,
        bodyHeight//height of content-panel when panel is expaned,which is used to determine the minSize&maxSize props in `<SplitGrid>` and `<SplitGridArea>`
        }
    ```
#### *Slots*
- expand-icon
    ```js
    //desc: slots for expand icon in header-panel
    ```
- expand-title
     ```js
    //desc: slots for title  in header-panel
    ```
- header-append
    ```js
    //desc: slots for append icon in header-panel
    ```
- content
    ```js
    //desc: slots for content body when panel expaned
    ```