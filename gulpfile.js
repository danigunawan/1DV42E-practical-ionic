var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var babel = require("gulp-babel");
var plumber = require("gulp-plumber");
var eslint = require("gulp-eslint");
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var clean = require('gulp-clean');
var Server = require('karma').Server;

var paths = {
  es6: ['./src/js/**/*.js'],
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['lint', 'sass', 'clean', 'compile']);

/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});


gulp.task('compile-build', ['lint', 'compile'], function(){
  return gulp.src('www/index.html')
    .pipe(useref())
    .pipe(plumber())
    .pipe(gulpIf('*.bundle.js', babel({presets: ['es2015']})))
    .pipe(gulpIf('*.bundle.js', uglify()))
    .pipe(clean())
    .pipe(gulp.dest('www'));
});

gulp.task('build', ['lint', 'compile', 'compile-build'], function(){
  return gulp.src(['www/js/app.js', 'www/js/shared', 'www/js/controllers'])
    .pipe(clean());
});

gulp.task('compile', ['lint'], function(){
  return gulp.src(['src/index.html', 'src/*.js', 'src/**/*.js'])
    .pipe(gulpIf('*.js', babel({presets: ['es2015']})))
    .pipe(gulp.dest('www'));
});

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('clean', ['sass'], function () {
  return gulp.src('./www/css/ionic.app.css', {read: false})
    .pipe(clean());
});

gulp.task('lint', function () {
  // ESLint ignores files with "node_modules" paths.
  // So, it's best to have gulp ignore the directory as well.
  // Also, Be sure to return the stream from the task;
  // Otherwise, the task may end before the stream has finished.
  return gulp.src(['src/**/*.js','!node_modules/**'])
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    .pipe(eslint.failAfterError());
});

gulp.task('watch', function() {
  gulp.watch(paths.es6, ['lint', 'compile']);
  gulp.watch(paths.sass, ['sass', 'clean']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
