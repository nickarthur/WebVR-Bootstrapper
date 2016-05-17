function CardboardVRDisplayPolyfill (){
  AbstractVRDisplayPolyfill.call(this, true, isMobile, false, "B4CEAE28-1A89-4314-872E-9C223DDABD02", "Device Motion API", (layers) => {
    return FullScreen.request(layers[0].source);
  });

  var currentPose = null,
    frameID = 0,
    q = [0, 0, 0, 0],
    c = Math.sqrt(0.5),
    zeroAlpha = 0,
    first = true,
    listeners = [],
    beta,
    alpha,
    gamma,
    cosBeta,
    cosAlpha,
    cosGamma,
    sinBeta,
    sinAlpha,
    sinGamma,
    ax,
    ay,
    az,
    aw,
    bx,
    by,
    bz,
    bw,
    orient,
    sinOrient,
    cosOrient;

  function waitForOrientation(event) {
    if (event.alpha) {
      window.removeEventListener("deviceorientation", waitForOrientation);
      checkDeviceOrientation(event);
      window.addEventListener("deviceorientation", checkDeviceOrientation, false);
    }
  }

  function checkDeviceOrientation(event) {

    var t = performance.now();
    if (!currentPose || t > currentPose.timestamp) {

      beta = event.beta * Math.PI / 180;
      alpha = event.alpha * Math.PI / 180;
      gamma = -event.gamma * Math.PI / 180;
      orient = Math.PI * -window.orientation / 360;

      cosBeta = Math.cos(beta / 2);
      cosAlpha = Math.cos(alpha / 2);
      cosGamma = Math.cos(gamma / 2);
      cosOrient = Math.cos(orient);

      sinBeta = Math.sin(beta / 2);
      sinAlpha = Math.sin(alpha / 2);
      sinGamma = Math.sin(gamma / 2);
      sinOrient = Math.sin(orient);

      ax = sinBeta * cosAlpha * cosGamma + cosBeta * sinAlpha * sinGamma;
      ay = cosBeta * sinAlpha * cosGamma - sinBeta * cosAlpha * sinGamma;
      az = cosBeta * cosAlpha * sinGamma - sinBeta * sinAlpha * cosGamma;
      aw = cosBeta * cosAlpha * cosGamma + sinBeta * sinAlpha * sinGamma;

      q[0] = ax + zeroAlpha * az;
      q[1] = zeroAlpha * aw + ay;
      q[2] = az - zeroAlpha * ax;
      q[3] = aw - zeroAlpha * ay;

      bx = q[0] * cosOrient - q[2] * sinOrient;
      by = q[1] * cosOrient + q[3] * sinOrient;
      bz = q[2] * cosOrient + q[0] * sinOrient;
      bw = q[3] * cosOrient - q[1] * sinOrient;

      q[0] = bx * c - bw * c;
      q[1] = by * c - bz * c;
      q[2] = bz * c + by * c;
      q[3] = bw * c + bx * c;

      currentPose = {
        timestamp: t,
        frameID: ++frameID,
        orientation: q,
        position: p
      };
    }
  }

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

  this.getImmediatePose = function () {
    return currentPose;
  };

  this.getPose = function () {
    return currentPose;
  };

  this.resetPose = function () {
    zeroAlpha = alpha;
  };
}