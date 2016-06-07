function StandardMonitorPolyfill() {
  AbstractDeviceMotionDisplayPolyfill.call(this, "39025D3C-3B12-4F92-9FF5-85DC887CB545", "Standard Monitor");

  this.DOMElement = null;

  this.getEyeParameters = function (side) {
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
  };
}