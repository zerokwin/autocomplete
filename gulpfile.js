'use strict';
const fs = require('fs'),
    gulp = require('gulp'),
    babel = require('gulp-babel'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    browserSync = require('browser-sync'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    config = require('./gulpconfig.js');

let changedPath_js = '',
    changedPath_css = '';

const filterPath = (e, type) => {
    let absolutePath = e.path;
    switch (type) {
        case 'scss':
            changedPath_css = absolutePath.substring(absolutePath.lastIndexOf('src')).replace(/\\/g, '/');
            break;
        case 'js':
            changedPath_js = absolutePath.substring(absolutePath.lastIndexOf('src')).replace(/\\/g, '/');
            break;
    }
};

gulp.task('styles', () => {

    let path = config.src.scss;

    for (let key in path) {

        if(changedPath_css && path[key].findIndex(x => x == changedPath_css) === -1) continue;

        if (fs.existsSync(path[key])) continue;

        gulp.src(path[key])
            .pipe(plumber())
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
            .pipe(gulp.dest(config.dist.css))
            .pipe(cleanCSS())
            .pipe(rename({ suffix: '.min' }))
            .pipe(gulp.dest(config.dist.css))
            .pipe(notify({
                message: `${key}.scss -> ${key}.css`
            }));

    }

    changedPath_css = '';

});

gulp.task('scripts', () => {

    let path = config.src.js;

    for (let key in path) {

        if(changedPath_js && path[key].findIndex(x => x == changedPath_js) === -1) continue;

        if (fs.existsSync(path[key])) continue;

        gulp.src(path[key])
            .pipe(plumber())
            .pipe(concat(`${key}.js`))
            .pipe(babel())
            .pipe(gulp.dest(config.dist.js))
            .pipe(uglify())
            .pipe(rename({ suffix: '.min' }))
            .pipe(gulp.dest(config.dist.js))
            .pipe(notify({
                message: `${key}.js compile completed`
            }));

    }

    changedPath_js = '';

});

gulp.task('watch', () => {

    gulp.watch(config.all.scss, (e) => {
        filterPath(e, 'scss');
        gulp.start('styles');
    });

    gulp.watch(config.all.js, (e) => {
        filterPath(e, 'js');
        gulp.start('scripts');
    });

    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch(config.all.dist).on('change', browserSync.reload);

});

gulp.task('default',['styles', 'scripts', 'watch']);
