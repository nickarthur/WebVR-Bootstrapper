var makeStandardMonitor = (function () {
  "use strict";

  function defaultFOV(side) {
    if (side === "left") {
      var width = this.DOMElement && this.DOMElement.offsetWidth || screen.width,
        height = this.DOMElement && this.DOMElement.offsetHeight || screen.height,
        aspect = width / height,
        vFOV = 25,
        hFOV = vFOV * aspect;
      return {
        renderWidth: width * devicePixelRatio,
        renderHeight: height * devicePixelRatio,
        offset: new Float32Array([0, 0, 0]),
        fieldOfView: {
          upDegrees: vFOV,
          downDegrees: vFOV,
          leftDegrees: hFOV,
          rightDegrees: hFOV
        }
      };
    }
  }

  function defaultPose() {
    return {
      position: [0, 0, 0],
      orientation: [0, 0, 0, 1],
      linearVelocity: null,
      linearAcceleration: null,
      angularVelocity: null,
      angularAcceleration: null
    };
  }

  function goFullScreen(layers) {
    const fireDisplayPresentChange = (evt) => {
      this.isPresenting = FullScreen.isActive;
      if (!this.isPresenting) {
        FullScreen.removeChangeListener(fireDisplayPresentChange);
      }
      window.dispatchEvent(new Event("vrdisplaypresentchange"));
    };
    FullScreen.addChangeListener(fireDisplayPresentChange);
    return FullScreen.request(layers[0].source);
  }

  function makeStandardMonitor(display) {
    display.displayName = "Standard Monitor";
    display.getEyeParameters = defaultFOV;
    display.getImmediatePose = defaultPose;
    display.requestPresent = goFullScreen;
    display.capabilities.hasOrientation = false;
    return display;
  }

  return makeStandardMonitor;
})();