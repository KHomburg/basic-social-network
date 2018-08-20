// Gulp.js configuration

const gulp = require('gulp');
const uglify = require("gulp-uglify")
const sass = require("gulp-sass");
const concat = require("gulp-concat");
const refresh = require('gulp-refresh');
const livereload = require('gulp-livereload');
const browserSync = require('browser-sync').create();

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

//livereload
gulp.task("livereload", () => {
    livereload()
})

//livereload
gulp.task("browserSyncdo", () => {
    browserSync.reload();
})


gulp.task('default', ["compile-js", "compile-style"]);


//gulp.task("watch", () => {
//    gulp.watch("public/source/javascript/*js", ["compile-js"]);
//    gulp.watch("public/source/styles/*scss", ["compile-style"]);
//});

gulp.task("watch", () => {
    browserSync.init({

            proxy: "localhost:3000",  // local node app address
            port: 5000,  // use *different* port than above
            //notify: true
        
    })
    gulp.watch("public/source/javascript/*js", ["compile-js", "browserSyncdo"]);
    gulp.watch("public/source/styles/*scss", ["compile-style", "browserSyncdo"]);
    gulp.watch("views/**/*ejs", () => {
        browserSync.reload();
        
    })
    
//    //.on('change', browserSync.reload);
});