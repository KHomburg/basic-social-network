// Gulp.js configuration

const gulp = require('gulp');
const uglify = require("gulp-uglify")
const sass = require("gulp-sass");
const concat = require("gulp-concat");

//concat and minify javascript files
gulp.task("compile-js", () => {
    gulp.src("public/source/javascript/*js")
        .pipe(concat("main.js"))
        .pipe(uglify())
        .pipe(gulp.dest("public"))
})

//concat and compile style files
gulp.task("compile-style", () => {
    gulp.src("public/source/styles/*scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(concat("main.css"))
        .pipe(gulp.dest("public"))
})

//minify
gulp.task("minify", () => {
    gulp.src("public/source/main.js")
        .pipe(uglify())
        .pipe(gulp.dest("public"))
})

//compile sass
gulp.task("sass", () => {
    gulp.src("public/source/styles/*.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(gulp.dest("public/source"))
})




gulp.task('default', ["compile-js", "compile-style"]);


gulp.task("watch", () => {
    gulp.watch("public/source/javascript/*js", ["compile-js"]);
    gulp.watch("public/source/styles/*scss", ["compile-style"]);
});