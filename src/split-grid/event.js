
let _events={
    'dragStart':[],
    'drag':[],
    'dragEnd':[]
}
export function registerEvent(event,cb){
    if(Object.prototype.hasOwnProperty.call(_events,event)){
        _events[event].push(cb)
    }
    else{
        throw new Error(
            `_events has no event called ${event}`
        )
    }
}
export function fireEvent(event,args){
    if(Object.prototype.hasOwnProperty.call(_events,event)){
        _events[event].forEach((cb)=>{
            cb(args)
        })
    }
    else{
        throw new Error(
            `_events has no event called ${event} to fire`
        )
    }
}