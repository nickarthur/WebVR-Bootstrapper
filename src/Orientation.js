var Orientation = (function () {
  "use strict";


  function lockOrientation() {
    var type = screen.orientation && screen.orientation.type || screen.mozOrientation || "";
    if (type.indexOf("landscape") === -1) {
      type = "landscape-primary";
    }
    if (screen.orientation && screen.orientation.lock) {
      return screen.orientation.lock(type);
    }
    else if (screen.mozLockOrientation) {
      var locked = screen.mozLockOrientation(type);
      if (locked) {
        return Promise.resolve();
      }
    }
    return Promise.reject();
  }

  function unlockOrientation() {
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock();
    }
    else if (screen.mozUnlockOrientation) {
      screen.mozUnlockOrientation();
    }
  }

  return {
    lock: lockOrientation,
    unlock: unlockOrientation
  }
})();