"use strict";

function AbstractDeviceMotionDisplayPolyfill(id, name) {
  AbstractVRDisplayPolyfill.call(this, true, isMobile, false, id, name, function (layers) {
    return FullScreen.request(layers[0].source);
  });

  var frameID = 0,
      q = new Float32Array([0, 0, 0, 1]),
      p = new Float32Array([0, 0, 0]),
      currentPose = {
    timestamp: 0,
    frameID: 0,
    orientation: q,
    position: p
  },
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
    if (t > currentPose.timestamp) {

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
        orientation: q,
        position: p
      };
    }
  }

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

// adapted from http://detectmobilebrowsers.com/

window.isMobile = function (a) {
  return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substring(0, 4))
  );
}(navigator.userAgent || navigator.vendor || window.opera);

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
  AbstractDeviceMotionDisplayPolyfill.call(this, "B4CEAE28-1A89-4314-872E-9C223DDABD02", "Device Motion API");

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

  function _loadFiles(files, done, progress, index, total, loaded) {
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

        _loadFiles(files, done, progress, index + 1, total, loaded);
      }, function (evt) {
        return progress(loaded = lastLoaded + evt.loaded, total);
      });
    } else {
      done();
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
  return function loadFiles(manifestSpec, progress, done) {
    function readManifest(manifest) {
      var total = 0;
      for (var i = 0; i < manifest.length; ++i) {
        total += manifest[i][1];
      }
      progress = progress || console.log.bind(console, "File load progress");
      _loadFiles(manifest, done, progress, 0, total, 0);
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
  AbstractDeviceMotionDisplayPolyfill.call(this, "39025D3C-3B12-4F92-9FF5-85DC887CB545", "Standard Monitor");

  this.getEyeParameters = function (side) {
    if (side === "left") {
      return {
        renderWidth: screen.width * devicePixelRatio,
        renderHeight: screen.height * devicePixelRatio,
        offset: new Float32Array([0, 0, 0]),
        fieldOfView: {
          upDegrees: 25,
          downDegrees: 25,
          leftDegrees: 25,
          rightDegrees: 25
        }
      };
    }
  };
}
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ViewCameraTransform = function () {
  _createClass(ViewCameraTransform, null, [{
    key: "makeTransform",
    value: function makeTransform(eye, near, far) {
      var t = eye.offset;
      return {
        translation: new THREE.Matrix4().makeTranslation(t[0], t[1], t[2]),
        projection: ViewCameraTransform.fieldOfViewToProjectionMatrix(eye.fieldOfView, near, far),
        viewport: {
          left: 0,
          right: 0,
          width: eye.renderWidth,
          height: eye.renderHeight
        }
      };
    }
  }, {
    key: "fieldOfViewToProjectionMatrix",
    value: function fieldOfViewToProjectionMatrix(fov, zNear, zFar) {
      var upTan = Math.tan(fov.upDegrees * Math.PI / 180.0),
          downTan = Math.tan(fov.downDegrees * Math.PI / 180.0),
          leftTan = Math.tan(fov.leftDegrees * Math.PI / 180.0),
          rightTan = Math.tan(fov.rightDegrees * Math.PI / 180.0),
          xScale = 2.0 / (leftTan + rightTan),
          yScale = 2.0 / (upTan + downTan),
          matrix = new THREE.Matrix4();

      matrix.elements[0] = xScale;
      matrix.elements[1] = 0.0;
      matrix.elements[2] = 0.0;
      matrix.elements[3] = 0.0;
      matrix.elements[4] = 0.0;
      matrix.elements[5] = yScale;
      matrix.elements[6] = 0.0;
      matrix.elements[7] = 0.0;
      matrix.elements[8] = -((leftTan - rightTan) * xScale * 0.5);
      matrix.elements[9] = (upTan - downTan) * yScale * 0.5;
      matrix.elements[10] = -(zNear + zFar) / (zFar - zNear);
      matrix.elements[11] = -1.0;
      matrix.elements[12] = 0.0;
      matrix.elements[13] = 0.0;
      matrix.elements[14] = -(2.0 * zFar * zNear) / (zFar - zNear);
      matrix.elements[15] = 0.0;

      return matrix;
    }
  }]);

  function ViewCameraTransform(display) {
    _classCallCheck(this, ViewCameraTransform);

    this._params = [display.getEyeParameters("left"), display.getEyeParameters("right")];
  }

  _createClass(ViewCameraTransform, [{
    key: "getTransforms",
    value: function getTransforms(near, far) {
      var params = this._params.filter(function (t) {
        return t;
      }).map(function (p) {
        return ViewCameraTransform.makeTransform(p, near, far);
      });
      for (var i = 1; i < params.length; ++i) {
        params[i].viewport.left = params[i - 1].viewport.left + params[i - 1].viewport.width;
      }
      return params;
    }
  }]);

  return ViewCameraTransform;
}();
"use strict";

var WebVRBootstrapper = function () {
  var V = function () {
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

  function WebVRBootstrapper(manifest, preLoad) {
    "use strict";

    function setup() {
      if (document.readyState === "complete") {
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
            if (displays.length === 0 || !(displays[0] instanceof StandardMonitorPolyfill)) {
              displays.unshift(new StandardMonitorPolyfill());
            }
            return displays;
          });
        };

        document.removeEventListener("readystatechange", setup);
        preLoad(function (progress, done) {
          loadFiles(manifest, progress, function () {
            navigator.getVRDisplays().then(done);
          });
        });
        return true;
      }
    }
    if (!setup()) {
      document.addEventListener("readystatechange", setup);
    }
  }

  WebVRBootstrapper.Version = V;

  var wasFullScreen;
  WebVRBootstrapper.dispalyPresentChangeCheck = function () {
    if (V === 1 && isMobile) {
      if (wasFullscreen !== FullScreen.isActive) {
        window.dispatchEvent(new Event("vrdisplaypresentchange"));
        wasFullscreen = FullScreen.isActive;
      }
    }
  };
  return WebVRBootstrapper;
}();