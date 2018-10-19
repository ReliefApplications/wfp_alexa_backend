var gulp  = require('gulp');
var shell = require('gulp-shell');


gulp.task('default', shell.task([
    'echo',
    'echo COMMANDS LIST :',
    'echo - push  : Push the project on the server',
    'echo'
]));

gulp.task('push', shell.task([
    'echo',
    'echo Deploying the project on the server ...',
    'echo',
    'rm -rf node_modules',
    'echo',
    'scp -r . tester@217.70.189.97:/var/www/html/wfp-alexa/wfp-alexa-backend',
    'echo',
    'npm i',
    'echo',
    'echo Deployment finished',
    'echo',
]));
