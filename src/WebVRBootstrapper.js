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

  if (V === 1) {
    if (isMobile) {
      // fix a defect in mobile Android with WebVR 1.0
      var oldRequestPresent = VRDisplay.prototype.requestPresent;
      VRDisplay.prototype.requestPresent = (layers) => oldRequestPresent.call(this, layers[0]);
    }
  }
  else if (V === 0.5) {
    navigator.getVRDisplays = () => navigator.getVRDevices()
      .then((devices) => {
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
  navigator.getVRDisplays = () => oldGetVRDisplays.call(navigator)
    .then((displays) => {
      const standardMonitorExists = displays
        .map((d) => d instanceof StandardMonitorPolyfill)
        .reduce((a, b) => a || b, false);

      if (!standardMonitorExists) {
        displays.unshift(new StandardMonitorPolyfill());
      }
      return displays;
    });

  function WebVRBootstrapper(manifest, preLoad) {
    "use strict";

    function setup() {
      if (document.readyState !== "complete") {
        return false;
      }
      else {
        document.removeEventListener("readystatechange", setup);
        preLoad((progress, done) => loadFiles(
          manifest,
          progress,
          () => navigator.getVRDisplays()
          .then(done)));
        return true;
      }
    }
    if (!setup()) {
      document.addEventListener("readystatechange", setup);
    }
  }

  WebVRBootstrapper.Version = V;

  var wasFullScreen = false;
  WebVRBootstrapper.dispalyPresentChangeCheck = function () {
    if (V === 1 && isMobile) {
      if (wasFullScreen !== FullScreen.isActive) {
        window.dispatchEvent(new Event("vrdisplaypresentchange"));
        wasFullScreen = FullScreen.isActive;
      }
    }
  };
  return WebVRBootstrapper;
})();