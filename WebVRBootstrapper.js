"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

window.isMobile = function (a) {
    return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substring(0, 4))
    );
}(navigator.userAgent || navigator.vendor || window.opera);

var AbstractVRDisplayPolyfill = function () {
    function AbstractVRDisplayPolyfill(canPresent, hasOrientation, hasPosition, displayID, displayName) {
        var _this = this;

        _classCallCheck(this, AbstractVRDisplayPolyfill);

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

        this._currentLayer = null;

        this._onFullScreenRemoved = function () {
            FullScreen.removeChangeListener(_this._onFullScreenRemoved);
            _this.exitPresent();
            window.dispatchEvent(new Event("vrdisplaypresentchange"));
        };
    }

    _createClass(AbstractVRDisplayPolyfill, [{
        key: "getLayers",
        value: function getLayers() {
            if (this._currentLayer) {
                return [this._currentLayer];
            } else {
                return [];
            }
        }
    }, {
        key: "exitPresent",
        value: function exitPresent() {
            var _this2 = this;

            var clear = function clear(obj) {
                _this2.isPresenting = false;
                _this2._currentLayer = null;
                return obj;
            };
            return FullScreen.exit().then(clear).catch(function (err) {
                console.error(err.message || err);
                clear();
            });
        }
    }, {
        key: "requestPresent",
        value: function requestPresent(layers) {
            var _this3 = this;

            if (!this.capabilities.canPresent) {
                return Promrise.reject(new Error("This device cannot be used as a presentation display. DisplayID: " + this.displayId + ". Name: " + this.displayName));
            } else if (!layers) {
                return Promise.reject(new Error("No layers provided to requestPresent"));
            } else if (!(layers instanceof Array)) {
                return Promise.reject(new Error("Layers parameters must be an array"));
            } else if (layers.length !== 1) {
                return Promise.reject(new Error("Only one layer at a time is supported right now."));
            } else if (!layers[0].source) {
                return Promise.reject(new Error("No source on layer parameter."));
            } else {
                return this._requestPresent(layers).then(function (elem) {
                    _this3._currentLayer = layers[0];
                    _this3.isPresenting = elem === _this3._currentLayer.source;
                    FullScreen.addChangeListener(_this3._onFullScreenRemoved, false);
                    window.dispatchEvent(new Event("vrdisplaypresentchange"));
                    return elem;
                });
            }
        }
    }, {
        key: "requestAnimationFrame",
        value: function requestAnimationFrame(thunk) {
            window.requestAnimationFrame(thunk);
        }
    }, {
        key: "cancelAnimationFrame",
        value: function cancelAnimationFrame(handle) {
            window.cancelAnimationFrame(handle);
        }
    }, {
        key: "submitFrame",
        value: function submitFrame() {}
    }]);

    return AbstractVRDisplayPolyfill;
}();
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CardboardVRDisplayPolyfill = function (_AbstractVRDisplayPol) {
    _inherits(CardboardVRDisplayPolyfill, _AbstractVRDisplayPol);

    function CardboardVRDisplayPolyfill() {
        _classCallCheck(this, CardboardVRDisplayPolyfill);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(CardboardVRDisplayPolyfill).call(this, true, isMobile, false, "B4CEAE28-1A89-4314-872E-9C223DDABD02", "Device Motion API"));

        var corrector = new Primrose.Input.VR.MotionCorrector(),
            currentPose = null,
            frameID = 0;

        _this.getEyeParameters = function (side) {
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
        };

        corrector.addEventListener("deviceorientation", function (evt) {
            currentPose = {
                timestamp: performance.now(),
                frameID: ++frameID,
                orientation: new Float32Array(evt)
            };
        });

        _this.getImmediatePose = function () {
            return currentPose;
        };

        _this.getPose = function () {
            return currentPose;
        };

        _this.resetPose = corrector.zeroAxes.bind(corrector);

        _this._requestPresent = function (layers) {
            return FullScreen.request(layers[0].source);
        };
        return _this;
    }

    return CardboardVRDisplayPolyfill;
}(AbstractVRDisplayPolyfill);
"use strict";

var FullScreen = function () {
  "use strict";

  var elementName = findProperty(document, ["fullscreenElement", "mozFullScreenElement", "webkitFullscreenElement", "msFullscreenElement"]),
      changeEventName = findProperty(document, ["onfullscreenchange", "onmozfullscreenchange", "onwebkitfullscreenchange", "onmsfullscreenchange"]),
      errorEventName = findProperty(document, ["onfullscreenerror", "onmozfullscreenerror", "onwebkitfullscreenerror", "onmsfullscreenerror"]),
      requestMethodName = findProperty(document.documentElement, ["requestFullscreen", "mozRequestFullScreen", "webkitRequestFullscreen", "webkitRequestFullScreen", "msRequestFullscreen"]),
      exitMethodName = findProperty(document, ["exitFullscreen", "mozExitFullScreen", "webkitExitFullscreen", "webkitExitFullScreen", "msExitFullscreen"]);

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
          // Timeout wating on the fullscreen to happen, for systems like iOS that
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
          console.error("No Fullscreen API support.");
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
          console.error("No Fullscreen API support.");
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LegacyVRDisplayPolyfill = function (_AbstractVRDisplayPol) {
    _inherits(LegacyVRDisplayPolyfill, _AbstractVRDisplayPol);

    function LegacyVRDisplayPolyfill(legacyDisplay, legacySensor) {
        _classCallCheck(this, LegacyVRDisplayPolyfill);

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

        var frameID = 0;
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

            if (state.position) {
                pose.position = new Float32Array([state.position.x, state.position.y, state.position.z]);
            }
            if (state.linearVelocity) {
                pose.linearVelocity = new Float32Array([state.linearVelocity.x, state.linearVelocity.y, state.linearVelocity.z]);
            }
            if (state.linearAcceleration) {
                pose.linearAcceleration = new Float32Array([state.linearAcceleration.x, state.linearAcceleration.y, state.linearAcceleration.z]);
            }
            if (state.orientation) {
                pose.orientation = new Float32Array([state.orientation.x, state.orientation.y, state.orientation.z, state.orientation.w]);
            }
            if (state.angularVelocity) {
                pose.angularVelocity = new Float32Array([state.angularVelocity.x, state.angularVelocity.y, state.angularVelocity.z]);
            }
            if (state.angularAcceleration) {
                pose.angularAcceleration = new Float32Array([state.angularAcceleration.x, state.angularAcceleration.y, state.angularAcceleration.z]);
            }
            return pose;
        }

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LegacyVRDisplayPolyfill).call(this, !!legacyDisplay, !!legacySensor, !!legacySensor, legacyDisplay.hardwareUnitId, makeDisplayName(legacyDisplay, legacySensor)));

        _this.getEyeParameters = function (side) {
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

        _this.getImmediatePose = function () {
            return createPoseFromState(legacySensor.getImmediateState());
        };

        _this.getPose = function () {
            return createPoseFromState(legacySensor.getState());
        };

        _this.resetPose = legacySensor.resetSensor.bind(legacySensor);

        _this._requestPresent = function (layers) {
            return FullScreen.request(layers[0].source, {
                vrDisplay: legacyDisplay,
                vrDistortion: true
            });
        };
        return _this;
    }

    return LegacyVRDisplayPolyfill;
}(AbstractVRDisplayPolyfill);
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MotionCorrector = function MotionCorrector() {
    _classCallCheck(this, MotionCorrector);

    var q = [0, 0, 0, 0],
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

        for (var i = 0; i < listeners.length; ++i) {
            listeners[i](q);
        }
    }
    /*
     Add an event listener for motion/orientation events.
     
     Parameters:
     type: There is only one type of event, called "deviceorientation". Any other value for type will result
     in an error. It is included to maintain interface compatability with the regular DOM event handler
     syntax, and the standard device orientation events.
     
     callback: the function to call when an event occures
     
     [bubbles]: set to true if the events should be captured in the bubbling phase. Defaults to false. The
     non-default behavior is rarely needed, but it is included for completeness.
     */
    this.addEventListener = function (type, callback, bubbles) {
        if (type !== "deviceorientation") {
            throw new Error("The only event type that is supported is \"deviceorientation\". Type parameter was: " + type);
        }
        if (typeof callback !== "function") {
            throw new Error("A function must be provided as a callback parameter. Callback parameter was: " + callback);
        }

        if (first) {
            window.addEventListener("deviceorientation", waitForOrientation, false);
            first = false;
        }

        listeners.push(callback);
    };

    this.zeroAxes = function () {
        zeroAlpha = alpha;
    };
};
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebVRBootstrapper = function () {
    function WebVRBootstrapper() {
        _classCallCheck(this, WebVRBootstrapper);
    }

    _createClass(WebVRBootstrapper, null, [{
        key: "install",
        value: function install() {
            if (WebVRBootstrapper.Version === 1 && isMobile) {
                var oldRequestPresent = VRDisplay.prototype.requestPresent;
                VRDisplay.prototype.requestPresent = function (layers) {
                    return oldRequestPresent.call(this, layers[0]);
                };
            } else if (WebVRBootstrapper.Version === 0.5) {
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
            } else if (WebVRBootstrapper.Version === 0.4) {
                navigator.getVRDisplays = Promise.reject.bind(Promise, "You're using an extremely old version of Firefox Nightly. Please update your browser.");
            } else if (WebVRBootstrapper.Version === 0.1) {
                navigator.getVRDisplays = Promise.resolve.bind(Promise, [new CardboardVRDisplayPolyfill()]);
            } else {
                navigator.getVRDisplays = Promise.reject.bind(Promise, "Your browser does not support WebVR.");
            }
        }
    }, {
        key: "Version",
        get: function get() {
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
        }
    }]);

    return WebVRBootstrapper;
}();