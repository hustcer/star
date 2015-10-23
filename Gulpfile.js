'use strict';

/**
 * Gulp file for front-end js check and etc.
 * Date      : 2015/10/21
 * copyright : (c) hustcer
 */

var gulp     = require('gulp'),
    eslint   = require('gulp-eslint'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant');

gulp.task('check', function () {

    let src = ['Gruntfile.js', 'Gulpfile.js', 'star.js', 'lib/**/*.js'];

    return gulp .src(src)
                .pipe(eslint({ configFile: 'eslint.json' }))
                .pipe(eslint.format('stylish'));
});

gulp.task('opt', function () {

    let imgPath = ['snapshot/*'];

    return gulp .src(imgPath)
                .pipe(imagemin({
                        progressive : true,
                        use         : [pngquant()]
                    }))
                .pipe(gulp.dest('snapshot/'));
});

let defaultTasks = ['check', 'opt'];

gulp.task('default', defaultTasks, function() {
    console.log(`---------> All gulp task has been done! Task List: ${defaultTasks}`);
});
