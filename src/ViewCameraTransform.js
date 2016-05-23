class ViewCameraTransform {
  static makeTransform(eye, near, far) {
    var t = eye.offset;
    return {
      translation: new THREE.Matrix4().makeTranslation(t[0], t[1], t[2]),
      projection: ViewCameraTransform.fieldOfViewToProjectionMatrix(eye.fieldOfView, near, far),
      viewport: {
        left: 0,
        right: 0,
        width: eye.renderWidth,
        height: eye.renderHeight
      }
    };
  }

  static fieldOfViewToProjectionMatrix(fov, zNear, zFar) {
    var upTan = Math.tan(fov.upDegrees * Math.PI / 180.0),
      downTan = Math.tan(fov.downDegrees * Math.PI / 180.0),
      leftTan = Math.tan(fov.leftDegrees * Math.PI / 180.0),
      rightTan = Math.tan(fov.rightDegrees * Math.PI / 180.0),
      xScale = 2.0 / (leftTan + rightTan),
      yScale = 2.0 / (upTan + downTan),
      matrix = new THREE.Matrix4();

    matrix.elements[0] = xScale;
    matrix.elements[1] = 0.0;
    matrix.elements[2] = 0.0;
    matrix.elements[3] = 0.0;
    matrix.elements[4] = 0.0;
    matrix.elements[5] = yScale;
    matrix.elements[6] = 0.0;
    matrix.elements[7] = 0.0;
    matrix.elements[8] = -((leftTan - rightTan) * xScale * 0.5);
    matrix.elements[9] = ((upTan - downTan) * yScale * 0.5);
    matrix.elements[10] = -(zNear + zFar) / (zFar - zNear);
    matrix.elements[11] = -1.0;
    matrix.elements[12] = 0.0;
    matrix.elements[13] = 0.0;
    matrix.elements[14] = -(2.0 * zFar * zNear) / (zFar - zNear);
    matrix.elements[15] = 0.0;

    return matrix;
  }

  constructor(display) {
    this._params = [
      display.getEyeParameters("left"),
      display.getEyeParameters("right")
    ];
  }

  getTransforms(near, far) {
    var params = this._params
      .filter((t) => t)
      .map((p) => ViewCameraTransform.makeTransform(p, near, far));
    for (var i = 1; i < params.length; ++i) {
      params[i].viewport.left = params[i - 1].viewport.left + params[i - 1].viewport.width;
    }
    return params;
  }
}