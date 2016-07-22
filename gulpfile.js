var gulp = require("gulp"),
  nt = require("notiontheory-basic-build").setup(gulp),
  tasks = nt.js(
    "webvr-bootstrapper",
    ["src/**/*.js"],
    ["node_modules/webvr-polyfill/build/webvr-polyfill.js"]);

gulp.task("default", [tasks.dev]);
gulp.task("debug", [tasks.debug]);
gulp.task("release", [tasks.release]);