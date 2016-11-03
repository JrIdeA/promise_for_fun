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
    this._nexts = [] // [promise, onFulfilled, onRejected];
    /**
     * 每一个 Promise 相当于处理一件事件，上游传过来的成功或者失败有不同的处理方式，有且只有一种
     * TODO 类比？ 带钱去买麦当劳，有钱或没钱？
     */
    // 对上游成功的处理方法
    this._onFulfilled = defaultOnFulfilled;
    // 对上游失败的处理方法
    this._onRejected = defaultOnRejected;
    if (isFunction(callback)) {
      this._execStart(callback);
    }
    return this;
  }
  _execStart(callback) {
    const resolve = (resolveValue) => {
      this._status = FULFILLED;
      this._resolveValue = resolveValue;
      this._flowControl();
    };
    const reject = (rejectValue) => {
      this._status = REJECTED;
      this._resolveValue = rejectValue;
      this._flowControl();
    };

    try {
      callback(resolve, reject);
      // TODO isPromise
    } catch (e) {
      reject(e);
      console.error(e);
    }
  }
  catch(onRejected) {
    return this.then(null, onRejected);
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
    this._flowControl();
    return nextPromise;
  }
  // TODO 上游任务中间插入了一个新的任务
  // 上游任务是成功的
  _resolve(resolveValue) {
    this._inputValue = resolveValue;
    this._exec(this._onFulfilled, this._flowControl.bind(this));
    return this;
  }
  // 上游任务是失败的
  _reject(rejectValue) {
    this._inputValue = rejectValue;
    this._exec(this._onRejected, this._flowControl.bind(this));
    return this;
  }
  // 执行任务
  _exec(execFunc, callback) {
    setTimeout(() => {
      const inputValue = this._inputValue;
      let outputValue;
      try {
        outputValue = execFunc(inputValue);
        this._status = FULFILLED;
        // TODO isPromise
      } catch (e) {
        outputValue = e;
        this._status = REJECTED;
      }
      this._resolveValue = outputValue;
      callback()
    }, 0)
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
  // 执行关键动作
  // start(inputValue) {
  //   let outputValue;
  //   try {
  //     outputValue = this.execFunc();
  //     if (isPromiseLike(outputValue)) {
  //       outputValue = Promise.resolve(outputValue);
  //     } else {
  //       this._status = FULFILLED;
  //     }
  //   } catch (e) {
  //     outputValue = e;
  //     this._status = REJECTED;
  //   }
  //   this._resolveValue = outputValue;
  // }
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
