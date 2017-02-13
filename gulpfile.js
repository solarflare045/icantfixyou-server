const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

const tsProject = $.typescript.createProject('tsconfig.json');

gulp.task('compile', function() {
  return tsProject.src()
    .pipe(tsProject())
    .js
    .pipe($.babel({ presets: ['es2015'] }))
    .pipe(gulp.dest('build'));
});

gulp.task('default', ['compile'], function() {
  return $.nodemon({
    script: 'build/app.js'
  , ext: 'ts'
  , watch: 'src'
  , tasks: ['compile']
  });
});
