const PENDING = 0;
const FULFILLED = 1;
const REJECTED = 2;

function isFunction(value) {
  return typeof value === 'function';
}
function isPromiseLike(o) {
  return o && isFunction(o.then);
}

function defaultOnFulfilled(value) {
  return value;
}
function defaultOnRejected(e) {
  throw e;
}

class Promise {
  constructor(callback) {
    this._status = PENDING;
    // 对上游成功的处理方法
    this._onFulfilled = defaultOnFulfilled;
    // 对上游失败的处理方法
    this._onRejected = defaultOnRejected;
    // 完成自身任务后需要启动的任务
    this._nexts = [];
    // 绑定this作用域
    this._resolve = this._resolve.bind(this);
    this._reject = this._reject.bind(this);
    this._flowControl = this._flowControl.bind(this);
    return this;
  }
  then(onFulfilled, onRejected) {
    const nextPromise = new Promise();
    if (isFunction(onFulfilled)) {
      nextPromise._onFulfilled = onFulfilled;
    }
    if (isFunction(onRejected)) {
      nextPromise._onRejected = onRejected;
    }
    this._nexts.push(nextPromise);
    setTimeout(() => {
      this._flowControl();
    }, 0);
    return nextPromise;
  }
  // 使用成功处理方式
  _resolve(upstreamFulfilledValue) {
    // 2.3.3.2
    if (
      upstreamFulfilledValue instanceof Promise ||
      isPromiseLike(upstreamFulfilledValue)
    ) {
      upstreamFulfilledValue.then(this._resolve, this._reject);
      return this;
    }

    this._inputValue = upstreamFulfilledValue;
    this._exec(this._onFulfilled, this._flowControl);
    return this;
  }
  // 使用失败处理方式
  _reject(upstreamRejecteValue) {
    this._inputValue = upstreamRejecteValue;
    this._exec(this._onRejected, this._flowControl);
    return this;
  }
  // 执行任务抽象方法
  _exec(execFunc, onFinish) {
    setTimeout(() => {
      if (this._status === PENDING) {
        const inputValue = this._inputValue;
        let outputValue;
        try {
          outputValue = execFunc(inputValue);
          // 2.3.3.1
          if (outputValue === this) {
            throw new TypeError('error');
          }

          if (typeof outputValue === 'object' || typeof outputValue === 'function') {
            try {
              const then = outputValue.then;
              // if (typeof then === 'function') {
                // const resolvePromise = function() {
                //
                // };
                // const rejectPromise = function() {
                //
                // };
                // then.call(outputValue, resolvePromise, rejectPromise);
                // outputValue = Promise.resolve(outputValue);

              // }
            } catch (e) {
              throw e;
            }
          }

          this._status = FULFILLED;
        } catch (e) {
          outputValue = e;
          this._status = REJECTED;
        }
        this._resolveValue = outputValue;
        onFinish();
      }
    });
  }
  // 流程控制
  _flowControl() {
    if (this._status === FULFILLED) {
      this._nexts.forEach((promise) => {
        promise._resolve(this._resolveValue);
      });
      this._nexts = [];
    }
    if (this._status === REJECTED) {
      this._nexts.forEach((promise) => {
        promise._reject(this._resolveValue);
      });
      this._nexts = [];
    }
  }
}

Promise.resolve = function(resolveValue) {
  const promise = new Promise();
  promise._resolve(resolveValue);
  return promise;
}
Promise.reject = function(rejectValue) {
  const promise = new Promise();
  promise._reject(rejectValue);
  return promise;
}

module.exports = Promise;
