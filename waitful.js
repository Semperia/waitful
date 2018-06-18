function waitful() {
    let id = 0
    function eventListener(target, event, resolve, reject) {
        this.id = id
        id++
        this.abort = msg => {
            target.removeEventListener(event, this.finish)
            if(msg) reject(msg)
        }
        this.finish = ret => {
            target.removeEventListener(event, this.finish)
            resolve(ret)
        }
        return this
    }

    function waitFor(target, event, options) {
        let listener
        let promise = new Promise((resolve, reject) => {
            listener = new eventListener(target, event, resolve, reject)
            target.addEventListener(event, listener.finish)
            if (options && options.timeout ) {
                setTimeout(listener.abort, parseInt(options.timeout, 10), 'Timeout')
            }
        })
        promise.eventListener = listener
        return promise
    }

    function waitCallback(context, func, pos) {
        pos = parseInt(pos, 10)
        let args = Array.prototype.slice.call(arguments, 3);
        if(isNaN(pos)) return Promise.reject('Position of callback is not a Number')
        else if(pos > args.length + 1) return Promise.reject('Position of callback out of index')
        else return new Promise(resolve => {
            console.log(resolve)
            args.splice(pos - 1, 0, resolve)
            func.apply(context, args)
        })
    }

    function toPromises(targets, events, options) {
        let promises
        if (targets instanceof NodeList) {
            targets = Array.prototype.slice.call(targets)
        }
        if (typeof events === 'string') {
            promises = targets.map(t => waitFor(t, events, options))
        } else if (Array.isArray(events) && targets.length === events.length) {
            promises = targets.map((t, i) => waitFor(t, events[i], options))
        }
        return promises
    }

    function clearListeners(promises) {
        for(let promise of promises) {
            if(promise.eventListener) {
                promise.eventListener.abort()
                delete promise.eventListener
            }
        }
    }

    function waitFirst(targets, events, options) {
        let promises = toPromises(targets, events, options)
        if (promises) {
            return Promise.race(promises).finally(ret => {
                clearListeners(promises)
                return ret
            })
        } else {
            return Promise.reject('Invalid events')
        }
    }

    function waitAll(targets, events, options) {
        let promises = toPromises(targets, events, options)
        if (promises) {
            return Promise.all(promises)
        } else {
            return Promise.reject('Invalid events')
        }
    }
    
    function mountPrototype () {
        EventTarget.prototype.waitFor = function (event, options) {
            return waitFor(this, event, options)
        }
        NodeList.prototype.waitFirst = function(events, options) {
            return waitFirst(this, events, options)
        }
        NodeList.prototype.waitAll = function(events, options) {
            return waitAll(this, events, options)
        }
    }

    return { waitFor, waitFirst, waitAll, waitCallback, mountPrototype }
}

export default waitful()
