function StandardMonitorPolyfill() {
  AbstractDeviceMotionDisplayPolyfill.call(this, "39025D3C-3B12-4F92-9FF5-85DC887CB545", "Standard Monitor");

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