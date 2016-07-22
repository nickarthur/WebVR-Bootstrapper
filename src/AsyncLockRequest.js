window.isChrome = !!window.chrome && !window.opera && navigator.userAgent.indexOf(' OPR/') === -1;

var AsyncLockRequest = (function () {
  "use strict";

  function findProperty(elem, arr) {
    for (var i = 0; i < arr.length; ++i) {
      if (elem[arr[i]] !== undefined) {
        return arr[i];
      }
    }
  }

  return function (name, elementOpts, changeEventOpts, errorEventOpts, requestMethodOpts, exitMethodOpts, testExtraParam) {
    var elementName = findProperty(document, elementOpts),
      changeEventName = findProperty(document, changeEventOpts),
      errorEventName = findProperty(document, errorEventOpts),
      requestMethodName = findProperty(document.documentElement, requestMethodOpts),
      exitMethodName = findProperty(document, exitMethodOpts),
      changeTimeout = null;

    changeEventName = changeEventName && changeEventName.substring(2);
    errorEventName = errorEventName && errorEventName.substring(2);

    var ns = {
      addChangeListener: (thunk, bubbles) => document.addEventListener(changeEventName, thunk, bubbles),
      removeChangeListener: (thunk) => document.removeEventListener(changeEventName, thunk),
      addErrorListener: (thunk, bubbles) => document.addEventListener(errorEventName, thunk, bubbles),
      removeErrorListener: (thunk) => document.removeEventListener(errorEventName, thunk),
      withChange: (act) => {
        return new Promise((resolve, reject) => {
          var onSuccess = () => {
              setTimeout(tearDown);
              resolve(ns.element);
            },
            onError = (evt) => {
              setTimeout(tearDown);
              reject(evt);
            },
            stop = () => {
              if (changeTimeout) {
                clearTimeout(changeTimeout);
                changeTimeout = null;
              }
            },
            tearDown = () => {
              stop();
              ns.removeChangeListener(onSuccess);
              ns.removeErrorListener(onError);
            };

          ns.addChangeListener(onSuccess, false);
          ns.addErrorListener(onError, false);

          if (act()) {
            // we've already gotten lock, so don't wait for it.
            tearDown();
            resolve(ns.element);
          }
          else {
            // Timeout waiting on the lock to happen, for systems like iOS that
            // don't properly support it, even though they say they do.
            stop();
            changeTimeout = setTimeout(() => {
              tearDown();
              reject(name + " state did not change in allotted time");
            }, 1000);
          }
        });
      },
      request: (elem, extraParam) => {
        if (testExtraParam) {
          extraParam = testExtraParam(extraParam);
        }
        return ns.withChange(() => {
          if (!requestMethodName) {
            throw new Error("No " + name + " API support.");
          }
          else if (ns.isActive) {
            return true;
          }
          else if (extraParam) {
            elem[requestMethodName](extraParam);
          }
          else if (isChrome) {
            elem[requestMethodName](window.Element.ALLOW_KEYBOARD_INPUT);
          }
          else {
            elem[requestMethodName]();
          }
        });
      },
      exit: () => {
        return ns.withChange(() => {
          if (!exitMethodName) {
            throw new Error("No Fullscreen API support.");
          }
          else if (!ns.isActive) {
            return true;
          }
          else {
            document[exitMethodName]();
          }
        });
      }
    };

    Object.defineProperties(ns, {
      element: {
        get: () => document[elementName]
      },
      isActive: {
        get: () => !!document[elementName]
      }
    });

    return ns;
  }
})();