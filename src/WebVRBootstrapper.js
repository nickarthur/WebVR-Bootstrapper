const WebVRBootstrapper = (function () {
  "use strict";

  WebVRConfig.BUFFER_SCALE = 1;

  var oldGetVRDisplays = navigator.getVRDisplays;
  navigator.getVRDisplays = () => oldGetVRDisplays.call(navigator)
    .then((displays) => {
      for (var i = 0; i < displays.length; ++i) {
        var display = displays[i];
        if (display.displayName === "Mouse and Keyboard VRDisplay (webvr-polyfill)") {
          displays[i] = makeStandardMonitor(displays[i]);
        }
      }
      return displays;
    });

  function WebVRBootstrapper(manifest, preLoad, root = "") {
    function setup() {
      const ready = document.readyState === "complete";
      if (ready) {
        document.removeEventListener("readystatechange", setup);
        preLoad((progress, done) => loadFiles(
          manifest,
          progress,
          () => navigator.getVRDisplays()
          .then(done)));
      }
      return ready;
    }

    if (!setup()) {
      document.addEventListener("readystatechange", setup);
    }
  }

  return WebVRBootstrapper;
})();