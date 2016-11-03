var Promise = require('../drafts');

module.exports = {
  resolved: Promise.resolve,
  rejected: Promise.reject,
  deferred: function () {
    var p = new Promise(function () {});

    return {
      promise: p,
      resolve: p._resolve.bind(p),
      reject: p._reject.bind(p)
    };
  }
};
