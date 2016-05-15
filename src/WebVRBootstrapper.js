class WebVRBootstrapper {

    static get Version() {
        if (navigator.getVRDisplays) {
            return 1.0;
        }
        else if (navigator.getVRDevices) {
            return 0.5;
        }
        else if (navigator.mozGetVRDevices) {
            return 0.4;
        }
        else if (isMobile) {
            return 0.1;
        }
        else {
            return 0;
        }
    }

    static install() {
        if (WebVRBootstrapper.Version === 1 && isMobile) {
            var oldRequestPresent = VRDisplay.prototype.requestPresent;
            VRDisplay.prototype.requestPresent = function (layers) {
                return oldRequestPresent.call(this, layers[0]);
            };
        }
        else if (WebVRBootstrapper.Version === 0.5) {
            navigator.getVRDisplays = function () {
                return navigator.getVRDevices()
                    .then(function (devices) {
                        var displays = {},
                            id = null;

                        for (var i = 0; i < devices.length; ++i) {
                            var device = devices[i];
                            id = device.hardwareUnitId;
                            if (!displays[id]) {
                                displays[id] = {};
                            }

                            var display = displays[id];
                            if (device instanceof HMDVRDevice) {
                                display.display = device;
                            }
                            else if (devices[i] instanceof PositionSensorVRDevice) {
                                display.sensor = device;
                            }
                        }

                        var mockedLegacyDisplays = [];
                        for (id in displays) {
                            mockedLegacyDisplays.push(new LegacyVRDisplayPolyfill(displays[id].display, displays[id].sensor));
                        }

                        return mockedLegacyDisplays;
                    });
            };
        }
        else if (WebVRBootstrapper.Version === 0.4) {
            navigator.getVRDisplays = Promise.reject.bind(Promise, "You're using an extremely old version of Firefox Nightly. Please update your browser.");
        }
        else if (WebVRBootstrapper.Version === 0.1) {
            navigator.getVRDisplays = Promise.resolve.bind(Promise, [new CardboardVRDisplayPolyfill()]);
        }
        else {
            navigator.getVRDisplays = Promise.reject.bind(Promise, "Your browser does not support WebVR.");
        }
    }
}