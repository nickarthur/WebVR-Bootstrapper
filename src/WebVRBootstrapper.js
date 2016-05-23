const WebVRBootstrapper = (function () {
  const V = (function () {
    if (navigator.getVRDisplays) {
      return 1.0;
    }
    else if (navigator.getVRDevices) {
      return 0.5;
    }
    else if (navigator.mozGetVRDevices) {
      return 0.4;
    }
    else if (isMobile) {
      return 0.1;
    }
    else {
      return 0;
    }
  })();

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
        }
        else if (V === 0.5) {
          navigator.getVRDisplays = function () {
            return navigator.getVRDevices()
              .then(function (devices) {
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
                  }
                  else if (devices[i] instanceof PositionSensorVRDevice) {
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
        }
        else if (V === 0.4) {
          navigator.getVRDisplays = Promise.reject.bind(Promise, "You're using an extremely old version of Firefox Nightly. Please update your browser. https://webvr.info/get-chrome/");
        }
        else if (V === 0.1) {
          navigator.getVRDisplays = Promise.resolve.bind(Promise, [new CardboardVRDisplayPolyfill()]);
        }
        else {
          navigator.getVRDisplays = Promise.resolve.bind(Promise, []);
        }

        var oldGetVRDisplays = navigator.getVRDisplays;
        navigator.getVRDisplays = function () {
          return oldGetVRDisplays.call(navigator).then((displays) => {
            if (displays.length === 0 || !(displays[0] instanceof StandardMonitorPolyfill)) {
              displays.unshift(new StandardMonitorPolyfill());
            }
            return displays;
          });
        };

        document.removeEventListener("readystatechange", setup);
        preLoad(function (progress, done) {
          loadFiles(manifest, progress, function () {
            navigator.getVRDisplays().then(done)
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
  return WebVRBootstrapper;
})();