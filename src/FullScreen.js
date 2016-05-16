var FullScreen = (function () {
  "use strict";
  function findProperty(elem, arr, pre, post) {
    for (var i = 0; i < arr.length; ++i) {
      var name = pre + arr[i] + post;
      if (elem[name] !== undefined) {
        return name;
      }
    }
  }
  var elementName = findProperty(document, ["fulls", "mozFullS", "webkitFulls", "msFulls"], "", "creenElement"),
    changeEventName = findProperty(document, ["", "moz", "webkit", "ms"], "on", "fullscreenchange"),
    errorEventName = findProperty(document, ["", "moz", "webkit", "ms"], "on", "fullscreenerror"),
    requestMethodName = findProperty(document.documentElement, ["requestFulls", "mozRequestFullS", "webkitRequestFulls", "webkitRequestFullS", "msRequestFulls"], "", "creen"),
    exitMethodName = findProperty(document, ["exitFulls", "mozExitFullS", "webkitExitFulls", "webkitExitFullS", "msExitFulls"], "", "creen");

  changeEventName = changeEventName && changeEventName.substring(2);
  errorEventName = errorEventName && errorEventName.substring(2);

  var ns = {
    addChangeListener: (thunk, bubbles) => document.addEventListener(changeEventName, thunk, bubbles),
    removeChangeListener: (thunk) => document.removeEventListener(changeEventName, thunk),
    addErrorListener: (thunk, bubbles) => document.addEventListener(errorEventName, thunk, bubbles),
    removeErrorListener: (thunk) => document.removeEventListener(errorEventName, thunk),
    withChange: (act) => {
      return new Promise((resolve, reject) => {
        var onFullScreen,
          onFullScreenError,
          timeout,
          tearDown = () => {
            if (timeout) {
              clearTimeout(timeout);
            }
            FullScreen.removeChangeListener(onFullScreen);
            FullScreen.removeErrorListener(onFullScreenError);
          };

        onFullScreen = () => {
          setTimeout(tearDown);
          resolve(FullScreen.element);
        };

        onFullScreenError = (evt) => {
          setTimeout(tearDown);
          reject(evt);
        };

        FullScreen.addChangeListener(onFullScreen, false);
        FullScreen.addErrorListener(onFullScreenError, false);

        if (act()) {
          // we've already gotten fullscreen, so don't wait for it.
          tearDown();
          resolve(FullScreen.element);
        }
        else {
          // Timeout waiting on the fullscreen to happen, for systems like iOS that
          // don't properly support it, even though they say they do.
          timeout = setTimeout(() => {
            tearDown();
            reject("Fullscreen state did not change in allotted time");
          }, 1000);
        }
      });
    },
    request: (elem, fullScreenParam) => {
      return FullScreen.withChange(() => {
        if (!requestMethodName) {
          throw new Error("No Fullscreen API support.");
        }
        else if (FullScreen.isActive) {
          return true;
        }
        else if (fullScreenParam) {
          elem[requestMethodName](fullScreenParam);
        }
        else if (isChrome) {
          elem[requestMethodName](window.Element.ALLOW_KEYBOARD_INPUT);
        } else {
          elem[requestMethodName]();
        }
      });
    },
    exit: () => {
      return FullScreen.withChange(() => {
        if (!exitMethodName) {
          throw new Error("No Fullscreen API support.");
        }
        else if (!FullScreen.isActive) {
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
      get: () => !!FullScreen.element
    }
  });

  return ns;
})();