function AbstractVRDisplayPolyfill(canPresent, hasOrientation, hasPosition, displayId, displayName, requestPresent) {
  this.capabilities = {
    canPresent: canPresent,
    hasExternalDisplay: false,
    hasOrientation: hasOrientation,
    hasPosition: hasPosition
  };

  this.displayId = displayId;
  this.displayName = displayName;
  this.isConnected = true;
  this.isPresenting = false;
  this.stageParameters = null;

  var currentLayer = null;

  var onFullScreenRemoved = () => {
    FullScreen.removeChangeListener(onFullScreenRemoved);
    this.exitPresent()
      .then(() => window.dispatchEvent(new Event("vrdisplaypresentchange")));
  };

  this.requestPresent = (layers) => {
    if (!this.capabilities.canPresent) {
      return Promise.reject(new Error("This device cannot be used as a presentation display. DisplayID: " + this.displayId + ". Name: " + this.displayName));
    }
    else if (!layers) {
      return Promise.reject(new Error("No layers provided to requestPresent"));
    }
    else if (!(layers instanceof Array)) {
      return Promise.reject(new Error("Layers parameters must be an array"));
    }
    else if (layers.length !== 1) {
      return Promise.reject(new Error("Only one layer at a time is supported right now."));
    }
    else if (!layers[0].source) {
      return Promise.reject(new Error("No source on layer parameter."));
    }
    else {
      return requestPresent(layers)
        .then((elem) => {
          currentLayer = layers[0];
          this.isPresenting = elem === currentLayer.source;
          FullScreen.addChangeListener(onFullScreenRemoved, false);
          window.dispatchEvent(new Event("vrdisplaypresentchange"));
          return elem;
        });
    }
  };

  this.getLayers = () => {
    if (currentLayer) {
      return [currentLayer];
    }
    else {
      return [];
    }
  };

  this.exitPresent = () => {
    var clear = (obj) => {
      this.isPresenting = false;
      currentLayer = null;
      return obj;
    };
    return FullScreen.exit()
      .then(clear)
      .catch(function (err) {
        console.error(err.message || err);
        clear();
      });
  };

  this.requestAnimationFrame = (thunk) => window.requestAnimationFrame(thunk);
  this.cancelAnimationFrame = (handle) => window.cancelAnimationFrame(handle);
  this.submitFrame = () => {};
}