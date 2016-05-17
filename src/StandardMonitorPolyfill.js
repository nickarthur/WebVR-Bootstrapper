function StandardMonitorPolyfill() {
  AbstractVRDisplayPolyfill.call(this, true, false, false, "39025D3C-3B12-4F92-9FF5-85DC887CB545", "Standard Monitor", (layers) => {
    return FullScreen.request(layers[0].source);
  });

  Object.defineProperty(this, "isPresenting", {
    get: function () { return true; },
    set: function () { }
  });

  var currentPose = {
    timestamp: 0,
    frameID: 0,
    orientation: new Float32Array([0, 0, 0, 1]),
    position: new Float32Array([0, 0, 0]);
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

  this.resetPose = function () {
  };
}