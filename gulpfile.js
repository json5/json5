var gulp = require('gulp');
var jshint = require('gulp-jshint');
var browserify = require('gulp-browserify');

gulp.task('lint', function() {
    return gulp.src('./lib/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('browserify', function() {
    return gulp.src('./lib/json5.js')
        .pipe(browserify())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['lint', 'browserify']);
