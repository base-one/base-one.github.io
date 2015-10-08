var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');

gulp.task('default', [
    'scripts',
    'styles'
]);

gulp.task('scripts', function() {
    return gulp.src([
        'bower_components/jquery/dist/jquery.js',
        'bower_components/three.js/build/three.js',
        'bower_components/three.js/examples/js/controls/OrbitControls.js',
        'src/js/cube.js'
    ])
    .pipe(concat('cube.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('styles', function() {
    return gulp.src([
        'src/css/cube.css'
    ])
    .pipe(concat('cube.min.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest('dist/css'));
});

