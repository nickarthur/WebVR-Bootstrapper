function CardboardVRDisplayPolyfill (){
  AbstractDeviceMotionDisplayPolyfill.call(this);

  this.getEyeParameters = function (side) {
    if (side === "left" || side === "right") {
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
    }
  };
}