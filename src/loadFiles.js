var loadFiles = (function () {
  "use strict";
  function appendScript(content) {
    if (/\.js$/.test(path)) {
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.appendChild(document.createTextNode(content));
      document.head.appendChild(s);
    }
  }

  function get(url, done, progress) {
    var req = new XMLHttpRequest();
    req.onload = function () {
      if (req.status < 400) {
        done(req.response);
      }
    };

    req.open("GET", url);
    req.onprogress = progres;
    req.send();
  }

  function _loadFiles(files, done, progress, index, state, total, loaded) {
    function copy(proc, content) {
      var obj = proc(content);
      if (obj !== null && obj !== undefined) {
        for (var key in obj) {
          state[key] = obj[key];
        }
      }
      _loadFiles(files, done, progress, index + 1, state);
    }
    if (index < files.length) {
      var file = files[index],
        path = file[0],
        size = file[1],
        hash = file[2],
        proc = file[3] || appendScript,
        src = localStorage.getItem(hash);
      if (src) {
        setTimeout(copy, 0, proc, src);
      }
      else {
        get(path, function (txt) {
          localStorage.setItem(hash, txt);
          copy(proc, txt);
        }, function (evt) {
          loaded += evt.loaded;
          progress(index, files.length, loaded, total);
        });
      }
    }
    else {
      done(state);
    }
  }



  /* syntax:
  loadFiles([
      // filename,  size,  hash,  [callback]
      ["script1.js", 456, "98asd070132"],
      ["script3.js", 8762, "1324gfs2134", function(content){
          // do something here
          return {name1: massage(content)};
      }],
      ["script2.js", 12368, "0986fg245a", function(content){
          // do something here
          return {name2: massage(content)};
      }]
  ], function(objects){
      // the thing to do when done.
      console.assert(objects.name1 !== undefined);
      console.assert(objects.name2 !== undefined);
  }, function(n, m, size, total){
      // track progress
      console.log("loaded file %d of %d, loaded %d bytes of %d bytes total.", n, m, size, total);
  });
  */
  return function loadFiles(manifestFile, done, progress) {
    get(manifestFile, (txt) => {
      var manifest = JSON.parse(txt);
      var total = 0,
        files = manifest.files;
      for (var i = 0; i < files.length; ++i) {
        total += files[i][1];
      }
      progress = progress || console.log.bind(console, "File load progress");
      _loadFiles(files, done, progress, 0, {}, total, 0);
    });
  }
})();