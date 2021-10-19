import Gutter from './Gutter'
import { getOption,NOOP,range,clamp,pushToStart,pushToEnd,isUndefined } from './util'
import {  registerEvent} from './event'
const gridTemplatePropColumns = 'grid-template-columns'
const gridTemplatePropRows = 'grid-template-rows'
const createGutter = (direction, options) => gutterOptions => {
    return new Gutter(
        direction,
        { ...gutterOptions,},
        options,
    )
}

class Grid {
    constructor(options) {
        this.columnGutters = {}
        this.rowGutters = {}
        this.uuid = options.uuid
        this.gutterCellSize = options.gutterCellSize,
        this.element = options.element
        this.viewItems = options.viewItems
        this.direction = options.direction
        this.gridTemplateProp = options.direction === 'column' ? gridTemplatePropColumns:gridTemplatePropRows
        this.gutterItems = options.direction === 'column' ? options.columnGutters:options.rowGutters
        this.emitDragStart = getOption(options, 'onDragStart', NOOP)
        this.emitDragEnd = getOption(options, 'onDragEnd', NOOP)
        this.emitDrag = getOption(options, 'onDrag', NOOP)
        this.size = null
        this.proportionalLayout = isUndefined(options.proportionalLayout) ? true : !!options.proportionalLayout;
        this.proportions = []
        this.viewsize = []
        this.dragStartState = null
        this.options = {
            columnGutters: options.columnGutters || [],
            rowGutters: options.rowGutters || [],
            // columnMinSizes: options.columnMinSizes || {},
            // rowMinSizes: options.rowMinSizes || {},
            // columnMaxSizes: options.columnMaxSizes || {},
            // rowMaxSizes: options.rowMaxSizes || {},
            ...options,
        }

        this.options.columnGutters.forEach(gutterOptions => {
            this.columnGutters[gutterOptions.track] = createGutter(
                'column',
                this.options,
            )(gutterOptions)
        })

        this.options.rowGutters.forEach(gutterOptions => {
            this.rowGutters[gutterOptions.track] = createGutter(
                'row',
                this.options,
            )(gutterOptions)
        })
        registerEvent('dragStart',this.onDragStart.bind(this))
        registerEvent('drag',this.onDragChange.bind(this))
        registerEvent('dragEnd',this.onDragEnd.bind(this))
        this.getSize()
    }
    getParentSize(){
        const {height,width} = this.element.parentElement.parentElement.getBoundingClientRect()
        return {height,width}
    }
    getSize(){
        const {height,width} = this.element.getBoundingClientRect()
        if(this.direction === 'row'){
            this.size = height
        }
        else{
            this.size = width
        }
        return this.size
    }
    // to be implement
    // addColumnGutter(element, track) {

    // }

    // addRowGutter(element, track) {

    // }

    // removeColumnGutter(track, immediate = true) {

    // }

    // removeRowGutter(track, immediate = true) {

    // }


    viewChanged(view){
        const index = this.viewItems.findIndex(v=>v.uuid == view.uuid)
        if(index < 0 || index >= this.viewItems.length){
            throw Error('index out of range')
        }
        let maxSize = this.viewItems[index].componentInstance.maxSize
        let size = view.size ? view.size : maxSize
        size = (size <= maxSize ? size : maxSize)
        if(index == this.viewItems.length-1){
            if(view.isExpand){
                size = this.getSize()
            }
            else{
                size = this.viewItems[index].componentInstance.minSize
            }
        }
        let v_size = this.getViewItemsSize()
        v_size[index] = size
        this.viewItems[index].componentInstance.sizeValue = size
        let delta = this.size - v_size.reduce((r,i)=>r+i,0) - this.getGuttersSize().reduce((r,i)=>r+i,0)
        this.resize(this.viewItems.length-1,delta,v_size,[index],undefined,undefined,undefined,)
        this.distributeEmptySpace()
        this.layoutViews()
        this.updateViewItemSize()
        this.layoutGutters()
        this.saveProportions()
    }
    parentResize(){
        let {height,width} = this.getParentSize()
        if(this.direction == 'row'){
            this.relayout(height)
        }
        else{
            this.relayout(width)
        }
        this.viewItems.forEach(v=>{
            if(v.componentInstance.$vnode.tag.endsWith('SplitGrid')){
                v.componentInstance.splitGrid.parentResize()
            }
        })
    }
    relayout(size){
        const previousSize = this.size
        this.size = size
        // if(size - previousSize == 0){
        //     return
        // }
        if(!this.proportionalLayout || !this.proportions){
            // for priority
            const indexes = range(this.viewItems.length)
            const lowPriorityIndexes = indexes.filter(i => this.viewItems[i].priority === 0);
			const highPriorityIndexes = indexes.filter(i => this.viewItems[i].priority === 1);
            this.resize(this.viewItems.length-1,size-previousSize,this.viewsize,lowPriorityIndexes,highPriorityIndexes)
        }
        else{
            for(let i=0;i<this.viewsize.length;i++){
                this.viewsize[i] = clamp(this.proportions[i]*size, this.viewItems[i].componentInstance.minSize,this.viewItems[i].componentInstance.maxSize)
            }
        }
        this.distributeEmptySpace()
        this.layoutViews()
        this.updateViewItemSize()
        this.layoutGutters()
        this.size = this.getSize()
    }
    getGuttersSize(){
       // return this.gutterItems.map(v=>v.componentInstance.size)
       let _this=this
       return this.gutterItems.map(()=>_this.gutterCellSize)
    }
    layout(){
        this.viewsize = this.getViewItemsSize()
        this.saveProportions()
    }
    saveProportions(){
        if(this.proportionalLayout){
            let contentsize = this.getSize()
            this.proportions = this.viewsize.map(s=>s/contentsize)
        }
    }
    getViewItemsSize(){
        this.getSize();
        let g_size = this.getGuttersSize()
        let v_size =  this.viewItems.map(v=>v.componentInstance.sizeValue)
        v_size[v_size.length-1] = this.size - g_size.reduce((r,i)=>r+i,0) - v_size.slice(0,v_size.length-1).reduce((r,i)=>r+i,0)
        return v_size
    }
    updateViewItemSize(){
        for(let i=0; i<this.viewsize.length; i++){
            this.viewItems[i].componentInstance.updateSize(this.viewsize[i])
        }
    }
    onDragStart(event){
        if(event.puuid === this.uuid){
            const index = this.gutterItems.findIndex(e=>e.uuid == event.uuid)
            this.viewsize = this.getViewItemsSize()
            let v_size = this.viewsize
            let minDelta = Number.NEGATIVE_INFINITY;
			let maxDelta = Number.POSITIVE_INFINITY;
            const upIndexs = range(index,-1)
            const downIndexs = range(index+1,this.viewItems.length)
            const minDeltaUp = upIndexs.reduce((r,i)=>r+(this.viewItems[i].componentInstance.minSize - v_size[i]),0)
            const maxDeltaUp = upIndexs.reduce((r,i)=>r+(this.viewItems[i].componentInstance.maxSize - v_size[i]),0)
            const maxDeltaDown = downIndexs.length === 0 ? Number.POSITIVE_INFINITY : downIndexs.reduce((r, i) => r + (v_size[i] - this.viewItems[i].componentInstance.minSize), 0);
            const minDeltaDown = downIndexs.length === 0 ? Number.NEGATIVE_INFINITY : downIndexs.reduce((r, i) => r + (v_size[i] - this.viewItems[i].componentInstance.maxSize), 0);
            minDelta = Math.max(minDeltaUp, minDeltaDown);
			maxDelta = Math.min(maxDeltaDown, maxDeltaUp);
            this.dragStartState ={start:event.start,current:event.start,index,sizes:v_size,minDelta,maxDelta}
            
            this.element.addEventListener('selectstart', NOOP)
            this.element.addEventListener('dragstart', NOOP)
            this.element.style.userSelect = 'none'
            this.element.style.webkitUserSelect = 'none'
            this.element.style.MozUserSelect = 'none'
            this.element.style.pointerEvents = 'none'
            // Set the cursor at multiple levels
            this.element.style.cursor = this.cursor
            window.document.body.style.cursor = this.cursor
            this.emitDragStart(event)
        }
    }
    onDragChange(event){
        if(event.puuid === this.uuid){
            const {index,start,sizes,minDelta,maxDelta} = this.dragStartState;
            this.dragStartState.current = event.current
            const delta = event.current - start
            this.resize(index,delta,sizes,undefined,undefined,minDelta,maxDelta)
            this.distributeEmptySpace()
            this.layoutViews()
            this.updateViewItemSize()
            this.layoutGutters()
            this.emitDrag(event)
        }
    }
    resize(index,delta,sizes,lowPriorityIndexes,highPriorityIndexes,overloadMinDelta=Number.NEGATIVE_INFINITY,overloadMaxDelta = Number.POSITIVE_INFINITY){
        if(index < 0 || index >= this.viewItems.length){
            return 0
        }
        const upIndexes = range(index, -1);
        const downIndexes = range(index + 1, this.viewItems.length);
        if (highPriorityIndexes) {
			for (const index of highPriorityIndexes) {
				pushToStart(upIndexes, index);
				pushToStart(downIndexes, index);
			}
		}

		if (lowPriorityIndexes) {
			for (const index of lowPriorityIndexes) {
				pushToEnd(upIndexes, index);
				pushToEnd(downIndexes, index);
			}
		}
        const upItems = upIndexes.map(i => this.viewItems[i]);
		const upSizes = upIndexes.map(i => sizes[i]);
        const newUpsizes = []
        const newDownsizes = []
		const downItems = downIndexes.map(i => this.viewItems[i]);
		const downSizes = downIndexes.map(i => sizes[i]);
        const minDeltaUp = upIndexes.reduce((r, i) => r + (this.viewItems[i].componentInstance.minSize - sizes[i]), 0);
		const maxDeltaUp = upIndexes.reduce((r, i) => r + (this.viewItems[i].componentInstance.maxSize- sizes[i]), 0);
		const maxDeltaDown = downIndexes.length === 0 ? Number.POSITIVE_INFINITY : downIndexes.reduce((r, i) => r + (sizes[i] - this.viewItems[i].componentInstance.minSize), 0);
		const minDeltaDown = downIndexes.length === 0 ? Number.NEGATIVE_INFINITY : downIndexes.reduce((r, i) => r + (sizes[i] - this.viewItems[i].componentInstance.maxSize), 0);
		const minDelta = Math.max(minDeltaUp, minDeltaDown, overloadMinDelta);
		const maxDelta = Math.min(maxDeltaDown, maxDeltaUp, overloadMaxDelta);
        delta = clamp(delta,minDelta,maxDelta);
        for(let i=0,deltaUp = delta; i<upItems.length;i++){
            const item = upItems[i]
            const size = clamp(upSizes[i]+deltaUp, item.componentInstance.minSize, item.componentInstance.maxSize)
            const viewDelta = size - upSizes[i]
            deltaUp -= viewDelta
            newUpsizes[upIndexes[i]] = size
        }
        for(let i=0,deltaDown = delta; i<downItems.length;i++){
            const item = downItems[i]
            const size = clamp(downSizes[i] - deltaDown, item.componentInstance.minSize, item.componentInstance.maxSize)
            const viewDelta = size - downSizes[i]
            deltaDown += viewDelta;
            newDownsizes[downIndexes[i]-upIndexes.length] = size
        }
        this.viewsize = [...newUpsizes,...newDownsizes]
        return delta

    }
    distributeEmptySpace(){
        const contentSize = this.viewsize.reduce((r,i)=>r+i,0)+this.getGuttersSize().reduce((r,i)=>r+i,0);
        let emptyDelta = this.size - contentSize
        const indexes = range(this.viewItems.length - 1, -1);
		const lowPriorityIndexes = indexes.filter(i => this.viewItems[i].componentInstance.priority === 0);
		const highPriorityIndexes = indexes.filter(i => this.viewItems[i].componentInstance.priority === 1);

		for (const index of highPriorityIndexes) {
			pushToStart(indexes, index);
		}

		for (const index of lowPriorityIndexes) {
			pushToEnd(indexes, index);
		}

        for(let i=0; emptyDelta !==0 && i<indexes.length;i++){
            const item = this.viewItems[indexes[i]];
            const size = clamp(this.viewsize[indexes[i]]+emptyDelta, item.componentInstance.minSize, item.componentInstance.maxSize);
            const viewDelta = size - this.viewsize[indexes[i]]
            emptyDelta -= viewDelta
            this.viewsize[indexes[i]] = size
        }
    }
    layoutGutters(){
        let offset = 0;
        for(let i = 0; i<this.viewItems.length-1;i++){
                offset +=(this.viewItems[i].componentInstance.sizeValue + (i==0 ? 0 :this.gutterCellSize))
                this.gutterItems[i].componentInstance.setOffset(offset- this.gutterItems[i].componentInstance.size/2)
        }
    }
    layoutViews(){
        let gridsize=[]
        for(let i=0; i<this.viewsize.length;i++){
            gridsize.push(this.viewsize[i]+'px')
            if(i<this.gutterItems.length){
                gridsize.push(this.gutterCellSize+'px')
            }
        }
        gridsize[gridsize.length-1] = '1fr'
        const style = gridsize.join(' ')
        this.element.style[this.gridTemplateProp] = style
    }
    onDragEnd(event){
        if(event.puuid === this.uuid){
            this.element.removeEventListener('selectstart', NOOP)
            this.element.removeEventListener('dragstart', NOOP)

            this.element.style.userSelect = ''
            this.element.style.webkitUserSelect = ''
            this.element.style.MozUserSelect = ''
            this.element.style.pointerEvents = ''

            this.element.style.cursor = ''
            window.document.body.style.cursor = ''
            this.emitDragEnd(event)
            this.saveProportions()
        }

    }
    destroy(immediate = true) {
        Object.keys(this.columnGutters).forEach(track =>
            this.columnGutters[track].destroy(immediate, () => {
                delete this.columnGutters[track]
            }),
        )
        Object.keys(this.rowGutters).forEach(track =>
            this.rowGutters[track].destroy(immediate, () => {
                delete this.rowGutters[track]
            }),
        )
    }
}

export default options => new Grid(options)
