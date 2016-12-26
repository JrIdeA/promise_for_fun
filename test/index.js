var Promise = require('../drafts');

module.exports = {
  resolved: Promise.resolve,
  rejected: Promise.reject,
  deferred: function () {
    // var p = new Promise(function () {});
    //
    // return {
    //   promise: p,
    //   resolve: p._resolve.bind(p),
    //   reject: p._reject.bind(p)
    // };

    var _resolve, _reject;
    var p = new Promise(function (resolve, reject) {
      _resolve = resolve;
      _reject = reject;
    });

    return {
      promise: p,
      resolve: _resolve,
      reject: _reject,
    };
  }
};
