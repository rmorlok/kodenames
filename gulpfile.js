'use strict';

let gulp = require('gulp'),
  awspublish = require('gulp-awspublish'),
  parallelize = require('concurrent-transform'),
  cloudfront = require('gulp-cloudfront-invalidate'),
  gulp_clean = require('gulp-clean'),
  argv = require('yargs').argv,
  spawn = require('child_process').spawn;

const AWS_ENV = require('./awsconfig.json');

function get_env() {
  let env = argv.env;
  let possible_envs = Object.keys(AWS_ENV);

  if (!env) {
    console.error(
      `Must specify environment using --env ENV. Possible environments: ${possible_envs.join(
        ', ',
      )}`,
    );
    process.exit(1);
  }

  if (possible_envs.indexOf(env) === -1) {
    console.error(
      `Invalid environment "${env}". Possible environments: ${possible_envs.join(
        ', ',
      )}`,
    );
    process.exit(1);
  }

  return env;
}

function get_cloudfront_invalidator() {
  return cloudfront({
    distribution: AWS_ENV[get_env()].cloudfront_id,
    paths: ['/*'],
  });
}

function get_aws_publisher() {
  return awspublish.create({
    params: {
      Bucket: AWS_ENV[get_env()].bucket,
    },
  });
}

function clean() {
  return gulp
    .src('dist', {read: false, allowEmpty: true})
    .pipe(gulp_clean());
}


function build(done) {
  let args = ['build'].concat([
    `--configuration=${get_env()}`,
    '--aot',
    '--build-optimizer',
    '--progress',
    '--output-path',
    'dist',
  ]);

  let ngbuild = spawn('ng', args, {shell: true});

  ngbuild.stdout.pipe(process.stdout);
  ngbuild.stderr.pipe(process.stderr);

  ngbuild.on('close', function () {
    console.log('Build complete!');
    done();
  });
}
gulp.task('build', build);

function push() {
  let publisher = get_aws_publisher();
  const S3_HEADERS = {
    'x-amz-acl': 'public-read',
    'Cache-Control': 'max-age=300, no-transform, public',
  };

  return gulp
    .src('dist/**')
    .pipe(awspublish.gzip())
    .pipe(
      parallelize(
        publisher.publish(S3_HEADERS, { createOnly: false, force: true }, 10),
      ),
    )
    .pipe(awspublish.reporter());
}

function invalidate() {
  return gulp
    .src('*')
    .pipe(get_cloudfront_invalidator());
}
gulp.task('invalidate', invalidate);

gulp.task('deploy', gulp.series(clean, build, push, invalidate));

gulp.task('default', cb => {
  console.error('Please specify an operation: deploy, invalidate, push, build, etc');
  cb();
});
