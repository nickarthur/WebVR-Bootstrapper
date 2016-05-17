"use strict";

window.isMobile = /(android|iP(hone|od|ad))/.test(navigator.userAgent);

function AbstractVRDisplayPolyfill(canPresent, hasOrientation, hasPosition, displayID, displayName, requestPresent) {
  var _this = this;

  this.capabilities = {
    canPresent: canPresent,
    hasExternalDisplay: false,
    hasOrientation: hasOrientation,
    hasPosition: hasPosition
  };

  this.displayID = displayID;
  this.displayName = displayName;
  this.isConnected = true;
  this.isPresenting = false;
  this.stageParameters = null;

  var currentLayer = null;

  var onFullScreenRemoved = function onFullScreenRemoved() {
    FullScreen.removeChangeListener(onFullScreenRemoved);
    _this.exitPresent();
    window.dispatchEvent(new Event("vrdisplaypresentchange"));
  };

  this.requestPresent = function (layers) {
    if (!_this.capabilities.canPresent) {
      return Promrise.reject(new Error("This device cannot be used as a presentation display. DisplayID: " + _this.displayId + ". Name: " + _this.displayName));
    } else if (!layers) {
      return Promise.reject(new Error("No layers provided to requestPresent"));
    } else if (!(layers instanceof Array)) {
      return Promise.reject(new Error("Layers parameters must be an array"));
    } else if (layers.length !== 1) {
      return Promise.reject(new Error("Only one layer at a time is supported right now."));
    } else if (!layers[0].source) {
      return Promise.reject(new Error("No source on layer parameter."));
    } else {
      return requestPresent(layers).then(function (elem) {
        currentLayer = layers[0];
        _this.isPresenting = elem === currentLayer.source;
        FullScreen.addChangeListener(onFullScreenRemoved, false);
        window.dispatchEvent(new Event("vrdisplaypresentchange"));
        return elem;
      });
    }
  };

  this.getLayers = function () {
    if (currentLayer) {
      return [currentLayer];
    } else {
      return [];
    }
  };

  this.exitPresent = function () {
    var clear = function clear(obj) {
      _this.isPresenting = false;
      currentLayer = null;
      return obj;
    };
    return FullScreen.exit().then(clear).catch(function (err) {
      console.error(err.message || err);
      clear();
    });
  };

  this.requestAnimationFrame = function (thunk) {
    window.requestAnimationFrame(thunk);
  };

  this.cancelAnimationFrame = function (handle) {
    window.cancelAnimationFrame(handle);
  };

  this.submitFrame = function () {};
}
"use strict";

function CardboardVRDisplayPolyfill() {
  AbstractVRDisplayPolyfill.call(this, true, isMobile, false, "B4CEAE28-1A89-4314-872E-9C223DDABD02", "Device Motion API", function (layers) {
    return FullScreen.request(layers[0].source);
  });

  var currentPose = null,
      frameID = 0,
      q = [0, 0, 0, 0],
      c = Math.sqrt(0.5),
      zeroAlpha = 0,
      first = true,
      listeners = [],
      beta,
      alpha,
      gamma,
      cosBeta,
      cosAlpha,
      cosGamma,
      sinBeta,
      sinAlpha,
      sinGamma,
      ax,
      ay,
      az,
      aw,
      bx,
      by,
      bz,
      bw,
      orient,
      sinOrient,
      cosOrient;

  function waitForOrientation(event) {
    if (event.alpha) {
      window.removeEventListener("deviceorientation", waitForOrientation);
      checkDeviceOrientation(event);
      window.addEventListener("deviceorientation", checkDeviceOrientation, false);
    }
  }

  function checkDeviceOrientation(event) {

    var t = performance.now();
    if (!currentPose || t > currentPose.timestamp) {

      beta = event.beta * Math.PI / 180;
      alpha = event.alpha * Math.PI / 180;
      gamma = -event.gamma * Math.PI / 180;
      orient = Math.PI * -window.orientation / 360;

      cosBeta = Math.cos(beta / 2);
      cosAlpha = Math.cos(alpha / 2);
      cosGamma = Math.cos(gamma / 2);
      cosOrient = Math.cos(orient);

      sinBeta = Math.sin(beta / 2);
      sinAlpha = Math.sin(alpha / 2);
      sinGamma = Math.sin(gamma / 2);
      sinOrient = Math.sin(orient);

      ax = sinBeta * cosAlpha * cosGamma + cosBeta * sinAlpha * sinGamma;
      ay = cosBeta * sinAlpha * cosGamma - sinBeta * cosAlpha * sinGamma;
      az = cosBeta * cosAlpha * sinGamma - sinBeta * sinAlpha * cosGamma;
      aw = cosBeta * cosAlpha * cosGamma + sinBeta * sinAlpha * sinGamma;

      q[0] = ax + zeroAlpha * az;
      q[1] = zeroAlpha * aw + ay;
      q[2] = az - zeroAlpha * ax;
      q[3] = aw - zeroAlpha * ay;

      bx = q[0] * cosOrient - q[2] * sinOrient;
      by = q[1] * cosOrient + q[3] * sinOrient;
      bz = q[2] * cosOrient + q[0] * sinOrient;
      bw = q[3] * cosOrient - q[1] * sinOrient;

      q[0] = bx * c - bw * c;
      q[1] = by * c - bz * c;
      q[2] = bz * c + by * c;
      q[3] = bw * c + bx * c;

      currentPose = {
        timestamp: t,
        frameID: ++frameID,
        orientation: new Float32Array(q)
      };
    }
  }

  this.getEyeParameters = function (side) {
    if (side === "left" || side === "right") {
      var dEye = side === "left" ? -1 : 1;

      return {
        renderWidth: Math.floor(screen.width * devicePixelRatio / 2),
        renderHeight: screen.height * devicePixelRatio,
        offset: new Float32Array([dEye * 0.03, 0, 0]),
        fieldOfView: {
          upDegrees: 40,
          downDegrees: 40,
          leftDegrees: 40,
          rightDegrees: 40
        }
      };
    }
  };

  this.getImmediatePose = function () {
    return currentPose;
  };

  this.getPose = function () {
    return currentPose;
  };

  this.resetPose = function () {
    zeroAlpha = alpha;
  };
}
"use strict";

var FullScreen = function () {
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
    addChangeListener: function addChangeListener(thunk, bubbles) {
      return document.addEventListener(changeEventName, thunk, bubbles);
    },
    removeChangeListener: function removeChangeListener(thunk) {
      return document.removeEventListener(changeEventName, thunk);
    },
    addErrorListener: function addErrorListener(thunk, bubbles) {
      return document.addEventListener(errorEventName, thunk, bubbles);
    },
    removeErrorListener: function removeErrorListener(thunk) {
      return document.removeEventListener(errorEventName, thunk);
    },
    withChange: function withChange(act) {
      return new Promise(function (resolve, reject) {
        var onFullScreen,
            onFullScreenError,
            timeout,
            tearDown = function tearDown() {
          if (timeout) {
            clearTimeout(timeout);
          }
          FullScreen.removeChangeListener(onFullScreen);
          FullScreen.removeErrorListener(onFullScreenError);
        };

        onFullScreen = function onFullScreen() {
          setTimeout(tearDown);
          resolve(FullScreen.element);
        };

        onFullScreenError = function onFullScreenError(evt) {
          setTimeout(tearDown);
          reject(evt);
        };

        FullScreen.addChangeListener(onFullScreen, false);
        FullScreen.addErrorListener(onFullScreenError, false);

        if (act()) {
          // we've already gotten fullscreen, so don't wait for it.
          tearDown();
          resolve(FullScreen.element);
        } else {
          // Timeout waiting on the fullscreen to happen, for systems like iOS that
          // don't properly support it, even though they say they do.
          timeout = setTimeout(function () {
            tearDown();
            reject("Fullscreen state did not change in allotted time");
          }, 1000);
        }
      });
    },
    request: function request(elem, fullScreenParam) {
      return FullScreen.withChange(function () {
        if (!requestMethodName) {
          throw new Error("No Fullscreen API support.");
        } else if (FullScreen.isActive) {
          return true;
        } else if (fullScreenParam) {
          elem[requestMethodName](fullScreenParam);
        } else if (isChrome) {
          elem[requestMethodName](window.Element.ALLOW_KEYBOARD_INPUT);
        } else {
          elem[requestMethodName]();
        }
      });
    },
    exit: function exit() {
      return FullScreen.withChange(function () {
        if (!exitMethodName) {
          throw new Error("No Fullscreen API support.");
        } else if (!FullScreen.isActive) {
          return true;
        } else {
          document[exitMethodName]();
        }
      });
    }
  };

  Object.defineProperties(ns, {
    element: {
      get: function get() {
        return document[elementName];
      }
    },
    isActive: {
      get: function get() {
        return !!FullScreen.element;
      }
    }
  });

  return ns;
}();
"use strict";

function LegacyVRDisplayPolyfill(legacyDisplay, legacySensor) {
  function makeDisplayName(legacyDisplay, legacySensor) {
    var displayName = "";
    var a = legacyDisplay.deviceName,
        b = legacySensor.deviceName;
    for (var i = 0; i < a.length && i < b.length && a[i] === b[i]; ++i) {
      displayName += a[i];
    }
    while (displayName.length > 0 && !/\w/.test(displayName[displayName.length - 1])) {
      displayName = displayName.substring(0, displayName.length - 1);
    }
    return displayName;
  }

  var frameID = 0,
      fields = ["position", "linearVelocity", "linearAcceleration", "orientation", "angularVelocity", "angularAcceleration"];
  function createPoseFromState(state) {
    var pose = {
      timestamp: state.timestamp,
      frameID: ++frameID,
      position: null,
      linearVelocity: null,
      linearAcceleration: null,
      orientation: null,
      angularVelocity: null,
      angularAcceleration: null
    };

    fields.forEach(function (f) {
      if (state[f]) {
        var arr = [state[f].x, state[f].y, state[f].z];
        if (f === "orientation") {
          arr.push(state[f].w);
        }
        pose[f] = new Float32Array(arr);
      }
    });

    return pose;
  }

  AbstractVRDisplayPolyfill.call(this, !!legacyDisplay, !!legacySensor, !!legacySensor, legacyDisplay.hardwareUnitId, makeDisplayName(legacyDisplay, legacySensor), function (layers) {
    return FullScreen.request(layers[0].source, {
      vrDisplay: legacyDisplay,
      vrDistortion: true
    });
  });

  this.getEyeParameters = function (side) {
    var oldFormat = null;
    if (legacyDisplay.getEyeParameters) {
      oldFormat = legacyDisplay.getEyeParameters(side);
    } else {
      oldFormat = {
        renderRect: legacyDisplay.getRecommendedEyeRenderRect(side),
        eyeTranslation: legacyDisplay.getEyeTranslation(side),
        recommendedFieldOfView: legacyDisplay.getRecommendedEyeFieldOfView(side)
      };
    }

    var newFormat = {
      renderWidth: oldFormat.renderRect.width,
      renderHeight: oldFormat.renderRect.height,
      offset: new Float32Array([oldFormat.eyeTranslation.x, oldFormat.eyeTranslation.y, oldFormat.eyeTranslation.z]),
      fieldOfView: oldFormat.recommendedFieldOfView
    };

    return newFormat;
  };

  this.getImmediatePose = function () {
    return createPoseFromState(legacySensor.getImmediateState());
  };

  this.getPose = function () {
    return createPoseFromState(legacySensor.getState());
  };

  this.resetPose = legacySensor.resetSensor.bind(legacySensor);
}
"use strict";

var loadFiles = function () {
  "use strict";

  function get(url, done, progress) {
    var req = new XMLHttpRequest();
    req.onload = function () {
      if (req.status < 400) {
        done(req.response);
      }
    };

    req.open("GET", url);
    req.onprogress = progress;
    req.send();
  }

  function _loadFiles(files, done, progress, index, state, total, loaded) {
    if (index < files.length) {
      var file = files[index][0],
          size = files[index][1],
          ext = file.match(/\.\w+$/)[0] || "none",
          lastLoaded = loaded;
      get(file, function (content) {
        if (ext === ".js") {
          var s = document.createElement("script");
          s.type = "text/javascript";
          s.appendChild(document.createTextNode(content));
          document.head.appendChild(s);
        }

        _loadFiles(files, done, progress, index + 1, state, total, loaded);
      }, function (evt) {
        return progress(loaded = lastLoaded + evt.loaded, total);
      });
    } else {
      done(state);
    }
  }

  /* syntax:
  loadFiles([
      // filename,  size
      ["script1.js", 456],
      ["script3.js", 8762],
      ["script2.js", 12368]
  ], function(objects){
      // the thing to do when done.
      console.assert(objects.name1 !== undefined);
      console.assert(objects.name2 !== undefined);
  }, function(n, m, size, total){
      // track progress
      console.log("loaded file %d of %d, loaded %d bytes of %d bytes total.", n, m, size, total);
  });
  */
  return function loadFiles(manifestSpec, done, progress) {
    function readManifest(manifest) {
      var total = 0;
      for (var i = 0; i < manifest.length; ++i) {
        total += manifest[i][1];
      }
      progress = progress || console.log.bind(console, "File load progress");
      _loadFiles(manifest, done, progress, 0, {}, total, 0);
    }

    if (manifestSpec instanceof String || typeof manifestSpec === "string") {
      get(manifestSpec, function (manifestText) {
        readManifest(JSON.parse(manifestText));
      });
    } else if (manifestSpec instanceof Array) {
      readManifest(manifestSpec);
    }
  };
}();
"use strict";

function StandardMonitorPolyfill() {
  AbstractVRDisplayPolyfill.call(this, true, false, false, "39025D3C-3B12-4F92-9FF5-85DC887CB545", "Standard Monitor", function (layers) {
    return FullScreen.request(layers[0].source);
  });

  Object.defineProperty(this, "isPresenting", {
    get: function get() {
      return true;
    },
    set: function set() {}
  });

  var currentPose = {
    timestamp: 0,
    frameID: 0,
    orientation: new Float32Array([0, 0, 0, 1])
  };

  this.getEyeParameters = function (side) {
    if (side === "left") {
      return {
        renderWidth: screen.width * devicePixelRatio,
        renderHeight: screen.height * devicePixelRatio,
        offset: new Float32Array([0, 0, 0]),
        fieldOfView: {
          upDegrees: 75,
          downDegrees: 75,
          leftDegrees: 75,
          rightDegrees: 75
        }
      };
    }
  };

  this.getImmediatePose = function () {
    return currentPose;
  };

  this.getPose = function () {
    return currentPose;
  };

  this.resetPose = function () {};
}
"use strict";

function WebVRBootstrapper(manifest, preLoad) {
  "use strict";

  function setup() {
    if (document.readyState === "complete") {
      var V = WebVRBootstrapper.Version;
      if (V === 1) {
        if (isMobile) {
          // fix a defect in mobile Android with WebVR 1.0
          var oldRequestPresent = VRDisplay.prototype.requestPresent;
          VRDisplay.prototype.requestPresent = function (layers) {
            return oldRequestPresent.call(this, layers[0]);
          };
        }
      } else if (V === 0.5) {
        navigator.getVRDisplays = function () {
          return navigator.getVRDevices().then(function (devices) {
            var displays = {},
                id = null;

            for (var i = 0; i < devices.length; ++i) {
              var device = devices[i];
              id = device.hardwareUnitId;
              if (!displays[id]) {
                displays[id] = {};
              }

              var display = displays[id];
              if (device instanceof HMDVRDevice) {
                display.display = device;
              } else if (devices[i] instanceof PositionSensorVRDevice) {
                display.sensor = device;
              }
            }

            var mockedLegacyDisplays = [];
            for (id in displays) {
              mockedLegacyDisplays.push(new LegacyVRDisplayPolyfill(displays[id].display, displays[id].sensor));
            }

            return mockedLegacyDisplays;
          });
        };
      } else if (V === 0.4) {
        navigator.getVRDisplays = Promise.reject.bind(Promise, "You're using an extremely old version of Firefox Nightly. Please update your browser. https://webvr.info/get-chrome/");
      } else if (V === 0.1) {
        navigator.getVRDisplays = Promise.resolve.bind(Promise, [new CardboardVRDisplayPolyfill()]);
      } else {
        navigator.getVRDisplays = Promise.resolve.bind(Promise, []);
      }

      var oldGetVRDisplays = navigator.getVRDisplays;
      navigator.getVRDisplays = function () {
        return oldGetVRDisplays.call(navigator).then(function (displays) {
          displays.unshift(new StandardMonitorPolyfill());
          return displays;
        });
      };

      document.removeEventListener("readystatechange", setup);
      preLoad(loadFiles.bind(null, manifest));
      return true;
    }
  }
  if (!setup()) {
    document.addEventListener("readystatechange", setup);
  }
}

WebVRBootstrapper.Version = function () {
  if (navigator.getVRDisplays) {
    return 1.0;
  } else if (navigator.getVRDevices) {
    return 0.5;
  } else if (navigator.mozGetVRDevices) {
    return 0.4;
  } else if (isMobile) {
    return 0.1;
  } else {
    return 0;
  }
}();