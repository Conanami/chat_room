
class EventDispatcher{

    constructor(){
        this.listeners = {}
    }
    addListener = (eventKey, fun, context) => {
        let list = []
        this.listeners[eventKey] = list
        let listener = {
            func: fun,
            context: context
        }
        list.push(listener)
        return listener
    }

    containsListener = (eventKey) => {
        let list = this.listeners[eventKey]
        if(list == undefined){
            return false
        }
        return true
    }

    removeListener = (eventKey, fun, context) => {
        let list = this.listeners[eventKey]
        if (list !== undefined) {
            let size = list.length
            for (let i = 0; i < size; i++) {
                let listener = list[i]
                if (listener.func === fun && listener.context === context) {
                    list.splice(i, 1)
                    return
                }
            }
        }
    }

    dispatchEvent = (eventKey, event) => {
        let list = this.listeners[eventKey]
        // console.log('dis list', list)
        if (list !== undefined) {
            let size = list.length
            for (let i = 0; i < size; i++) {
                let listener = list[i]
                let fun = listener.func
                let context = listener.context
                if (context != null) {
                    fun.call(context, event)
                } else {
                    // console.log('fun exec', fun, eventKey, event)
                    fun(event)
                }
            }
        }
    }

}

export { EventDispatcher }