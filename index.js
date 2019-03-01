/**
 * Created by fgh on 2018/10/23.
 */

// require('trace')
const sep = require('path').sep

class StackHandler{
    constructor(){
        this._handlerChain = []
        this.enableNodemoduleFilter = true
        this.enableNodecoreFilter = true
        this.traceLimit = 10
        this.formater = this._defalutFormater
        Error.prepareStackTrace = this._prepareStackTrace.bind(this)
    }


    /**
     * put handler to the end of handler chain
     * @param handler function（err, frames）
     * @returns {number}
     */
    appendHandler(handler){
        return this._addHandler(handler, false)
    }

    /**
     * put handler to the start of handler chain
     * @param handler function（err, frames）
     * @returns
     */
    prependHandler(handler){
        return this._addHandler(handler, true)
    }

    /**
     * @param handler function
     * @returns
     */
    removeHandler(handler){
        const index = this._handlerChain.indexOf(handler)
        if( index === -1 ){
            return 0
        }
        this._handlerChain.splice(index, 1)
        return 1
    }

    _prepareStackTrace(err, frames){
        let nextFames = frames
        for( let h of this._handlerChain ){
            nextFames = h(err, nextFames)
        }
        return this.formater(err, nextFames)
    }

    _addHandler(handler, position){
        if( typeof handler !== 'function' ){
            throw new TypeError('handler must be a function')
        }
        const index = this._handlerChain.indexOf(handler)
        if( index !== -1 ){
            return 0
        }
        if( position ){
            this._handlerChain.push(handler)
        }else{
            this._handlerChain.unshift(handler)
        }
        return 1
    }

    _defalutFormater(err, frames){
        return err.toString() + '\n' + frames.map(callSite => {
            return '    at ' + (callSite.getFunctionName() || '<anonymous>') + ' ('
              + callSite.getFileName() + ':'
              + callSite.getLineNumber() + ':'
              + callSite.getColumnNumber() + ')'
        }).join('\n')
    }

    _nodecoreFilter(err, frames){
        return frames.filter(function(callSite){
            const name = callSite && callSite.getFileName();
            return name && !name.startsWith('internal') && name.includes(sep)
        })
    }

    _nodemodulesFilter(err, frames){
        return frames.filter(function(callSite){
            const name = callSite && callSite.getFileName();
            return name && !name.includes('node_modules')
        })
    }

    set formater(value){
        if( typeof value !== 'function' ){
            throw new TypeError('formater must be a function')
        }
        this._formater = value
    }

    get formater(){
        return this._formater
    }

    set enableNodecoreFilter(value){
        if( value ){
            this._enableNodecoreFilter = true
            this.appendHandler(this._nodecoreFilter)
        }else{
            this._enableNodecoreFilter = false
            this.removeHandler(this._nodecoreFilter)
        }
    }

    get enableNodecoreFilter(){
        return this._enableNodecoreFilter
    }

    set enableNodemoduleFilter(value){
        if( value ){
            this._enableNodemoduleFilter = true
            this.appendHandler(this._nodemodulesFilter)
        }else{
            this._enableNodemoduleFilter = false
            this.removeHandler(this._nodemodulesFilter)
        }
    }

    get enableNodemoduleFilter(){
        return this._enableNodemoduleFilter
    }

    set traceLimit(value){
        this._traceLimit = value
        Error.stackTraceLimit = value
    }

    get traceLimit(){
        return this._traceLimit
    }
}

module.exports = new StackHandler()
