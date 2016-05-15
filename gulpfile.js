var gulp = require("gulp"),
    babel = require("gulp-babel"),
    concat = require("gulp-concat"),
    jshint = require("gulp-jshint"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify");

gulp.task("default", function () {
    return gulp.src("src/*.js")
        .pipe(jshint({
            multistr: true,
            esnext: true
        }))
        .pipe(babel({
            sourceMap: false,
            presets: ["es2015"]
        }))
        .pipe(concat("WebVRBootstrapper.js", { newLine: "\n" }))
        .pipe(gulp.dest("./"))
        .pipe(rename({ suffix: ".min" }))
        .pipe(uglify())
        .pipe(gulp.dest("./"));
});