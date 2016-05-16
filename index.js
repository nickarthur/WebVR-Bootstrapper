var fs = require("fs"),
  path = require("path"),
  args = process.argv.slice(2),
  options = {};

function recurseDirectory(root) {
  var directoryQueue = [root],
    files = [];
  while (directoryQueue.length > 0) {
    var directory = directoryQueue.shift(),
      subFiles = fs.readdirSync(directory);
    for (var j = 0; j < subFiles.length; ++j) {
      var subFile = path.join(directory, subFiles[j]),
        stats = fs.lstatSync(subFile);
      if (stats.isDirectory()) {
        directoryQueue.push(subFile);
      }
      else {
        files.push(subFile.replace(/\\/g, "/"));
      }
    }
  }
  return files;
}

options.files = [];
while(args.length > 0){
  var arg = args.shift();
  if (arg === "--directory") {
    options.files.splice.bind(options.files, options.files.length, 0)
      .apply(options.files, recurseDirectory(args.shift()));
  }
  else if (/^--\w/.test(arg)) {
    options[arg.substring(2)] = args.shift();
  }
  else {
    options.files.push(arg);
  }
}

if (!options.out) {
  options.out = "manifest.json";
}

options.files = options.files.filter(fs.existsSync);

var manifest = options.files.map(function (file) {
  return [file, fs.lstatSync(file).size];
});

fs.writeFileSync(options.out, JSON.stringify(manifest), { encoding: "utf-8" });
console.log("done");