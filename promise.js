class myPromise {
    constructor(fn) {
        // 添加状态
        this._status = 'PENDING'
        // 添加状态
        this._value = undefined

        this.succallbacks = []
        this.failcallbacks = [];

        fn(this._resolve.bind(this), this._reject.bind(this))
    }

    // 添加resovle时执行的函数
    _resolve (val) {
        if (this._status !== 'PENDING') return
        this._status = 'FULFILLED'
        this._value = val

        setTimeout(()=>{
            this.succallbacks.forEach((callback)=>{
                callback(val)
            })
        },0)
        
    }

    // 添加reject时执行的函数
    _reject (err) { 
        if (this._status !== 'PENDING') return
        this._status = 'REJECTED'
        this._value = err

        setTimeout(()=>{
            this.failcallbacks.forEach((callback)=>{
                callback(err)
            })
        },0)
        
    }

    then(onFulfilled,onRejected){
        const { _value, _status } = this

        return new myPromise((onFulfilledNext,onRejectedNext)=>{
            let fulfilled = val => {
                if(typeof onFulfilled !=='function') { // 如不是function，直接执行该返回的promise1的resolve，值为上一级promise的resolve的值
                    onFulfilledNext(val)
                    return
                }

                const res = onFulfilled(val)
                // 返回的还是promise
                // 返回的promise2的then加入两个执行的函数，分别为promise1的resolve和reject，这样就把promise2 resolve执行时候的val带到promise1 resolve执行时候的参数，保证链式调用的参数
                if(res instanceof myPromise) { 
                    res.then(onFulfilledNext,onRejectedNext)
                }
                // 普通的函数，则把返回值作为promise1的resolve执行参数
                else {
                    onFulfilledNext(res)
                }
            }

            let rejected = err => {
                if(typeof onFulfilled !=='function') {
                    onRejectedNext(err)
                    return
                }

                const res = onRejected(err)

                // 返回的还是promise
                if(res instanceof myPromise) {
                    res.then(onFulfilledNext,onRejectedNext)
                }
                else {
                    onRejectedNext(res)
                }
            }

            switch (_status) {
                // 当状态为pending时，将then方法回调函数加入执行队列等待执行
                case 'PENDING':
                  this.succallbacks.push(fulfilled)
                  this.failcallbacks.push(rejected)
                  break
                // 当状态已经改变时，立即执行对应的回调函数
                case 'FULFILLED':
                  fulfilled(_value)
                  break
                case 'REJECTED':
                  rejected(_value)
                  break
            }
        })
    }

}