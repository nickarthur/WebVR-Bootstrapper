function StandardMonitorPolyfill() {
  AbstractDeviceMotionDisplayPolyfill.call(this);

  Object.defineProperty(this, "isPresenting", {
    get: function () { return true; },
    set: function () { }
  });

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
}