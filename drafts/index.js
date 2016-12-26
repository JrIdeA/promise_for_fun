// completed1
// all pass!

const PENDING = 0;
const FULFILLED = 1;
const REJECTED = 2;

function isObject(value) {
  return typeof value === 'object' && value !== null;
}
function isFunction(value) {
  return typeof value === 'function';
}
function isPromiseInstance(promise) {
  return promise instanceof Promise;
}
function defaultOnFulfilled(value) {
  return value;
}
function defaultOnRejected(e) {
  throw e;
}


function createRunHandle(self, isRejected) {
  return (upstreamValue) => {
    if (self._status === PENDING) {
      const runner = self._executors[isRejected ? 1 : 0];
      let value;
      // 2.3.2
      if (!isRejected) {
        if (upstreamValue instanceof Promise) {
          chainPromise(upstreamValue, self);
          return;
        }
      }
      try {
        // 2.2.5
        value = runner.call(undefined, upstreamValue);
      } catch (e) {
        self._reject(e);
      }
      // 2.3
      self._resolveValue(value);
    }
  };
}

function createResolveValue(self) {
  return (value) => {
    try {
      // 2.3.1
      if (value === self) {
        throw new TypeError('`promise` and `resolveValue` cannot refer to the same object');
      }
      // 2.3.3
      // thenable
      if (!isPromiseInstance(value) && (isObject(value) || isFunction(value))) {
        const then = value.then;
        if (isFunction(then)) {
          const resolvePromise = new Promise(then.bind(value));
          self._resolve(resolvePromise);
          return;
        }
      }
      // 2.3.4
      self._resolve(value);
    } catch (e) {
      self._reject(e);
    }
  }
}

function createResolvePromise(self, isRejected) {
  return (resolveValue) => {;
    if (self._status === PENDING) {
      self._value = resolveValue;
      self._status = isRejected ? REJECTED : FULFILLED;
      self._runNext(self._nexts);
    }
  };
}

function createRunNext(self) {
  return (nextPromises) => {
    let execFuncName;
    if (self._status === FULFILLED) {
      execFuncName = '_doResolve';
    } else if (self._status === REJECTED) {
      execFuncName = '_doReject';
    }
    if (!execFuncName) {
      return;
    }
    nextPromises.forEach(nextPromise => {
      // 2.2.4
      setTimeout(() => {
        nextPromise[execFuncName](self._value);
      }, 0);
    });
  };
}

function chainPromise(self, next) {
  if (self._status === PENDING) {
    self._nexts.push(next);
  } else {
    self._runNext([next]);
  }
}

class Promise {
  constructor(executor) {
    this._status = PENDING;
    this._value = undefined;
    this._executors = [];
    this._nexts = [];
    this._doResolve = createRunHandle(this);
    this._doReject = createRunHandle(this, true);
    this._resolveValue = createResolveValue(this);
    this._resolve = createResolvePromise(this);
    this._reject = createResolvePromise(this, true);
    this._runNext = createRunNext(this);

    if (isFunction(executor)) {
      try {
        executor(this._resolveValue, this._reject);
      } catch (e) {
        this._reject(e);
      }
    }
  }
  then(onFulfilled, onRejected) {
    const nextPromise = new Promise();
    // 2.2.1
    nextPromise._executors = [
      isFunction(onFulfilled) ? onFulfilled : defaultOnFulfilled,
      isFunction(onRejected) ? onRejected : defaultOnRejected
    ];
    chainPromise(this, nextPromise);
    return nextPromise;
  }
}
Promise.resolve = function(value) {
  return new Promise(function(resolve) {
    resolve(value);
  });
};
Promise.reject = function(e) {
  return new Promise(function(resolve, reject) {
    reject(e);
  });
};

module.exports = Promise;
