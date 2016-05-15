class MotionCorrector {
    constructor() {
        var q = [0, 0, 0, 0],
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

            for (var i = 0; i < listeners.length; ++i) {
                listeners[i](q);
            }
        }
        /*
         Add an event listener for motion/orientation events.
         
         Parameters:
         type: There is only one type of event, called "deviceorientation". Any other value for type will result
         in an error. It is included to maintain interface compatability with the regular DOM event handler
         syntax, and the standard device orientation events.
         
         callback: the function to call when an event occures
         
         [bubbles]: set to true if the events should be captured in the bubbling phase. Defaults to false. The
         non-default behavior is rarely needed, but it is included for completeness.
         */
        this.addEventListener = function (type, callback, bubbles) {
            if (type !== "deviceorientation") {
                throw new Error("The only event type that is supported is \"deviceorientation\". Type parameter was: " + type);
            }
            if (typeof (callback) !== "function") {
                throw new Error("A function must be provided as a callback parameter. Callback parameter was: " + callback);
            }

            if (first) {
                window.addEventListener("deviceorientation", waitForOrientation, false);
                first = false;
            }

            listeners.push(callback);
        };

        this.zeroAxes = function () {
            zeroAlpha = alpha;
        };
    }
}