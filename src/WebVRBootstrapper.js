﻿function WebVRBootstrapper(manifest, done, progress) {
  "use strict";
  function setup() {
    let ready = false;
    if (document.readyState === "complete") {
      const V = WebVRBootstrapper.Version
      if (V === 1) {
        ready = true;
        if (isMobile) {
          // fix a defect in mobile Android with WebVR 1.0
          var oldRequestPresent = VRDisplay.prototype.requestPresent;
          VRDisplay.prototype.requestPresent = function (layers) {
            return oldRequestPresent.call(this, layers[0]);
          };
        }
      }
      else if (V === 0.5) {
        ready = true;
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
        ready = false;
        navigator.getVRDisplays = Promise.reject.bind(Promise, "You're using an extremely old version of Firefox Nightly. Please update your browser.");
      }
      else if (V === 0.1) {
        ready = true;
        navigator.getVRDisplays = Promise.resolve.bind(Promise, [new CardboardVRDisplayPolyfill()]);
      }
      else {
        ready = false;
        navigator.getVRDisplays = Promise.reject.bind(Promise, "Your browser does not support WebVR.");
      }

      document.removeEventListener("readystatechange", setup);

      loadFiles(manifest, done, progress);
    }
    return ready;
  }
  if (!setup()) {
    document.addEventListener("readystatechange", setup);
  }
}

WebVRBootstrapper.Version = (function () {
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

WebVRBootstrapper();