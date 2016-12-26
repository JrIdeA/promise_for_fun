var Promise = require('../drafts');

module.exports = {
  resolved: Promise.resolve,
  rejected: Promise.reject,
  deferred: function () {
    var p = new Promise(function () {});

    return {
      promise: p,
      resolve: p._resolveValue.bind(p),
      reject: p._reject.bind(p)
    };

    // var _resolve, _reject;
    // var p = new Promise(function (resolve, reject) {
    //   _resolve = resolve;
    //   _reject = reject;
    // });
    //
    // return {
    //   promise: p,
    //   resolve: _resolve,
    //   reject: _reject,
    // };
  }
};

// 原生 Promise 实现
// module.exports = {
//   resolved: Promise.resolve.bind(Promise),
//   rejected: Promise.reject.bind(Promise),
//   deferred: function () {
//     var _resolve, _reject;
//     var p = new Promise(function (resolve, reject) {
//       _resolve = resolve;
//       _reject = reject;
//     });
//
//     return {
//       promise: p,
//       resolve: _resolve,
//       reject: _reject,
//     };
//   }
// };
