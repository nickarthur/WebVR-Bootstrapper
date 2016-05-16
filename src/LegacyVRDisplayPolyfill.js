function LegacyVRDisplayPolyfill(legacyDisplay, legacySensor) {
  function makeDisplayName(legacyDisplay, legacySensor) {
    var displayName = "";
    var a = legacyDisplay.deviceName,
      b = legacySensor.deviceName;
    for (var i = 0; i < a.length && i < b.length && a[i] === b[i]; ++i) {
      displayName += a[i];
    }
    while (displayName.length > 0 && !/\w/.test(displayName[displayName.length - 1])) {
      displayName = displayName.substring(0, displayName.length - 1);
    }
    return displayName;
  }

  var frameID = 0,
    fields = ["position", "linearVelocity", "linearAcceleration", "orientation", "angularVelocity", "angularAcceleration"];
  function createPoseFromState(state) {
    var pose = {
      timestamp: state.timestamp,
      frameID: ++frameID,
      position: null,
      linearVelocity: null,
      linearAcceleration: null,
      orientation: null,
      angularVelocity: null,
      angularAcceleration: null
    };

    fields.forEach((f) => {
      if (state[f]) {
        var arr = [
          state[f].x,
          state[f].y,
          state[f].z
        ];
        if (f === "orientation") {
          arr.push(state[f].w);
        }
        pose[f] = new Float32Array(arr);
      }
    });

    return pose;
  }

  AbstractVRDisplayPolyfill.call(this, !!legacyDisplay, !!legacySensor, !!legacySensor, legacyDisplay.hardwareUnitId, makeDisplayName(legacyDisplay, legacySensor), (layers) => {
    return FullScreen.request(layers[0].source, {
      vrDisplay: legacyDisplay,
      vrDistortion: true
    });
  });


  this.getEyeParameters = function (side) {
    var oldFormat = null;
    if (legacyDisplay.getEyeParameters) {
      oldFormat = legacyDisplay.getEyeParameters(side);
    }
    else {
      oldFormat = {
        renderRect: legacyDisplay.getRecommendedEyeRenderRect(side),
        eyeTranslation: legacyDisplay.getEyeTranslation(side),
        recommendedFieldOfView: legacyDisplay.getRecommendedEyeFieldOfView(side)
      };
    }

    var newFormat = {
      renderWidth: oldFormat.renderRect.width,
      renderHeight: oldFormat.renderRect.height,
      offset: new Float32Array([
        oldFormat.eyeTranslation.x,
        oldFormat.eyeTranslation.y,
        oldFormat.eyeTranslation.z
      ]),
      fieldOfView: oldFormat.recommendedFieldOfView
    };

    return newFormat;
  };

  this.getImmediatePose = function () {
    return createPoseFromState(legacySensor.getImmediateState());
  };

  this.getPose = function () {
    return createPoseFromState(legacySensor.getState());
  };

  this.resetPose = legacySensor.resetSensor.bind(legacySensor);
}