var loadFiles = (function () {
  "use strict";

  function get(url, done, progress) {
    var req = new XMLHttpRequest();
    req.onload = function () {
      if (req.status < 400) {
        done(req.response);
      }
      else {
        done(new Error(req.status))
      }
    };

    req.open("GET", url);
    req.onprogress = progress;
    req.send();
  }

  function _loadFiles(files, done, progress, index, total, loaded) {
    if (index < files.length) {
      var file = files[index][0],
        size = files[index][1],
        shortExt = file.match(/\.\w+$/)[0] || "none",
        longExt = file.match(/(\.\w+)+$/)[0] || "none",
        lastLoaded = loaded;
      get(file, (content) => {
        if (content instanceof Error) {
          console.error("Failed to load " + file + ": " + content.message);
        }
        else if (shortExt === ".js" && longExt !== ".typeface.js") {
          var s = document.createElement("script");
          s.type = "text/javascript";
          s.src = file;
          s.defer = false;
          s.async = false;
          document.head.appendChild(s);
        }

        _loadFiles(files, done, progress, index + 1, total, loaded);
      }, (evt) => progress(loaded = lastLoaded + evt.loaded, total));
    }
    else {
      done();
    }
  }



  /* syntax:
  loadFiles([
      // filename,  size
      ["script1.js", 456],
      ["script3.js", 8762],
      ["script2.js", 12368]
  ], function(objects){
      // the thing to do when done.
      console.assert(objects.name1 !== undefined);
      console.assert(objects.name2 !== undefined);
  }, function(n, m, size, total){
      // track progress
      console.log("loaded file %d of %d, loaded %d bytes of %d bytes total.", n, m, size, total);
  });
  */
  return function loadFiles(manifestSpec, progress, done) {
    function readManifest(manifest) {
      var total = 0;
      for (var i = 0; i < manifest.length; ++i) {
        total += manifest[i][1];
      }
      progress = progress || console.log.bind(console, "File load progress");
      _loadFiles(manifest, done, progress, 0, total, 0);
    }

    if (manifestSpec instanceof String || typeof manifestSpec === "string") {
      get(manifestSpec, (manifestText) => {
        readManifest(JSON.parse(manifestText));
      });
    }
    else if (manifestSpec instanceof Array) {
      readManifest(manifestSpec);
    }
  }
})();