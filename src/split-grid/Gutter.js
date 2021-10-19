import {
    getOption,
} from './util'
import {fireEvent } from './event'
const gridTemplatePropColumns = 'grid-template-columns'
const gridTemplatePropRows = 'grid-template-rows'

class Gutter {
    constructor(direction, options, parentOptions) {
        this.direction = direction
        this.element = options.element
        this.track = options.track
        this.uuid = options.uuid
        this.parent_uuid = parentOptions.uuid
        if (direction === 'column') {
            this.gridTemplateProp = gridTemplatePropColumns
            this.gridGapProp = 'grid-column-gap'
            this.cursor = getOption(
                parentOptions,
                'columnCursor',
                getOption(parentOptions, 'cursor', 'col-resize'),
            )
            // this.snapOffset = getOption(
            //     parentOptions,
            //     'columnSnapOffset',
            //     getOption(parentOptions, 'snapOffset', 30),
            // )
            // this.dragInterval = getOption(
            //     parentOptions,
            //     'columnDragInterval',
            //     getOption(parentOptions, 'dragInterval', 1),
            // )
            this.clientAxis = 'clientX'
            //this.optionStyle = getOption(parentOptions, 'gridTemplateColumns')
        } else if (direction === 'row') {
            this.gridTemplateProp = gridTemplatePropRows
            this.gridGapProp = 'grid-row-gap'
            this.cursor = getOption(
                parentOptions,
                'rowCursor',
                getOption(parentOptions, 'cursor', 'row-resize'),
            )
            // this.snapOffset = getOption(
            //     parentOptions,
            //     'rowSnapOffset',
            //     getOption(parentOptions, 'snapOffset', 30),
            // )
            // this.dragInterval = getOption(
            //     parentOptions,
            //     'rowDragInterval',
            //     getOption(parentOptions, 'dragInterval', 1),
            // )
            this.clientAxis = 'clientY'
            //this.optionStyle = getOption(parentOptions, 'gridTemplateRows')
        }

        // this.writeStyle = getOption(
        //     parentOptions,
        //     'writeStyle',
        //     defaultWriteStyle,
        // )

        this.startDragging = this.startDragging.bind(this)
        this.stopDragging = this.stopDragging.bind(this)
        this.drag = this.drag.bind(this)


        if (options.element) {
            this.element.addEventListener('mousedown', this.startDragging)
        }
    }
    getMousePosition(e) {
        return e[this.clientAxis]
    }
    startDragging(e){
        if ('button' in e && e.button !== 0) {
            return
        }
        e.preventDefault()
        this.dragging = true;
        // All the binding. `window` gets the stop events in case we drag out of the elements.
        window.addEventListener('mouseup', this.stopDragging)
        window.addEventListener('mousemove', this.drag)
        fireEvent('dragStart',{direction:this.direction,track:this.track,uuid:this.uuid,puuid:this.parent_uuid, start:this.getMousePosition(e)})
    }
    stopDragging() {
        this.dragging = false
        // Remove the stored event listeners. This is why we store them.
        this.cleanup()
        if (this.needsDestroy) {
            if (this.element) {
                this.element.removeEventListener(
                    'mousedown',
                    this.startDragging,
                )
            }
            this.destroyCb()
            this.needsDestroy = false
            this.destroyCb = null
        }
        fireEvent('dragEnd',{direction:this.direction,track:this.track,uuid:this.uuid,puuid:this.parent_uuid})
    }
    drag(e){
        fireEvent('drag',{direction:this.direction,track:this.track,uuid:this.uuid,puuid:this.parent_uuid, current:this.getMousePosition(e)})
    }
    cleanup() {
        window.removeEventListener('mouseup', this.stopDragging)
        window.removeEventListener('mousemove', this.drag)
    }

    destroy(immediate = true, cb) {
        if (immediate || this.dragging === false) {
            this.cleanup()
            if (this.element) {
                this.element.removeEventListener(
                    'mousedown',
                    this.startDragging,
                )      
            }

            if (cb) {
                cb()
            }
        } else {
            this.needsDestroy = true
            if (cb) {
                this.destroyCb = cb
            }
        }
    }
}

export default Gutter
