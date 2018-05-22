const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const gulpif = require('gulp-if');
const connect = require('gulp-connect-php7');
const fs = require('fs');
const glob = require('glob');
const browserify = require('browserify');
const watchify = require('watchify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserSync = require('browser-sync').create();

const config = {
    production: false,
    proxy: 'http://dea.localhost',
    autoprefix: 'last 2 versions',
    scssDir: './src/assets/scss',
    cssDist: './public/assets/css',
    jsSrc: './src/assets/js',
    jsDist: './public/assets/js',
    htmlSrc: './src',
    htmlDist: './public',
    gfxSrc: './src/assets/gfx',
    gfxDist: './public/assets/',
    docSrc: './src/assets/doc',
    docDist: './public/assets/'
};

const bundler = browserify({
    entries: [config.jsSrc + '/app.js'],
    debug: ! config.production,
    paths: ['./node_modules', config.jsSrc],
    cache: {},
    packageCache: {},
    plugin: [watchify]
}).transform(babelify, {
    presets: ['es2015'],
    compact: false
});

const errorHandler = function() {
    let args = Array.prototype.slice.call(arguments);

    $.notify.onError({
        title: 'Gulp compile error',
        message: '<%= error.message %>'
    }).apply(this, args);

    this.emit('end');
};

const distTask = () => {
    return gulp.series(
        'clean', 'compile-css', 'compile-js', 'copy-js', 'copy-html', 'copy-gfx', 'copy-doc'
    )();
};

const serverTask = () => {
    return gulp.series('checkinstall', 'watch', 'compile-css', 'compile-js', 'copy-js', 'copy-html', 'copy-php', 'copy-gfx', 'copy-doc', 'browser-sync')();
};

gulp.task('browser-sync', () => {
    browserSync.init(['css/*.css', 'js/*.js', '**/*.html'], {
        proxy: config.proxy
    });
});

gulp.task('watch', (done) => {
    gulp.watch(config.scssDir + '/**/*.scss', gulp.series('compile-css'));
    gulp.watch(config.jsSrc + '/**/*.js', gulp.series('compile-js'));
    gulp.watch(config.jsSrc + '/vendor/**/*', gulp.series('copy-js'));
    gulp.watch(config.htmlSrc + '/**/*.html', gulp.series('copy-html'));
    gulp.watch(config.htmlSrc + '/**/*.php', gulp.series('copy-php'));
    gulp.watch(config.gfxsrc + '/**/*', gulp.series('copy-gfx'));

    done();
});

gulp.task('compile-css', () => {
    return gulp.src(config.scssDir + '/app.scss')
        .pipe($.plumber(errorHandler))
        .pipe(gulpif(! config.production, $.sourcemaps.init()))
        .pipe($.sass())
        .pipe($.autoprefixer(config.autoprefix))
        .pipe(gulpif(! config.production, $.sourcemaps.write()))
        .pipe(gulpif(config.production, $.cssnano()))
        .pipe(gulp.dest(config.cssDist))
        .pipe(browserSync.stream());
});

gulp.task('copy-gfx', () => {
    return gulp.src(config.gfxSrc + '**/*')
        .pipe($.plumber(errorHandler))
        .pipe(gulp.dest(config.gfxDist))
        .pipe(browserSync.stream());
});

gulp.task('copy-doc', () => {
    return gulp.src(config.docSrc + '**/*')
        .pipe($.plumber(errorHandler))
        .pipe(gulp.dest(config.docDist))
        .pipe(browserSync.stream());
});

gulp.task('copy-js', () => {
    return gulp.src(config.jsSrc + '/vendor/**/*')
        .pipe($.plumber(errorHandler))
        .pipe(gulpif(config.production, $.uglify({ preserveComments: 'license' })))
        .pipe(gulp.dest(config.jsDist + '/vendor'))
        .pipe(browserSync.stream());
});

gulp.task('compile-js', () => {
    return bundler.bundle()
        .on('error', errorHandler)
        .pipe(source('app.js'))
        .pipe($.plumber(errorHandler))
        .pipe(buffer())
        .pipe(gulpif(config.production, $.uglify({
            mangle: false,
            compress: {
                unused: false
            }
        })))
        .pipe(gulp.dest(config.jsDist))
        .pipe(browserSync.stream());
});

gulp.task('copy-html', () => {
    return gulp.src(config.htmlSrc + '/**/*.html', { dot: true })
        .pipe(gulp.dest(config.htmlDist))
        .pipe(browserSync.stream());
});

gulp.task('copy-php', () => {
    return gulp.src(config.htmlSrc + '/**/*.php', { dot: true })
        .pipe(gulp.dest(config.htmlDist))
        .pipe(browserSync.stream());
});

gulp.task('clean', () => {
    return gulp.src(config.htmlDist + '/*', { read: false })
        .pipe($.plumber(errorHandler))
        .pipe($.clean({ force: true }));
});

gulp.task('prod', () => {
    config.production = true;

    return distTask();
});

gulp.task('checkinstall', (done) => {
    if (! fs.existsSync(config.cssDist)) {
        distTask();
    }

    done();
});

/**
 * Compile and move all the stuff to dist
 */
gulp.task('dist', distTask);

/**
 * Default Gulp task is starting file watcher tasks
 */
gulp.task('default', serverTask);
