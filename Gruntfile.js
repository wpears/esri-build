var fs = require('fs');
var rimraf = require('rimraf');
var async = require('async');

function getBuildTag(){
  return (Date.now()/100000 >>0).toString();
}

module.exports = function(grunt){

  var buildDir = 'build'+getBuildTag()+'/';
  var homeDir = '../bathymetry/js/'
  var jsMin = buildDir + 'modules/modules.js';

  var uglifyFiles = {};

  uglifyFiles[jsMin] = [jsMin+'.uncompressed.js'];

  var dojoArgs = [
        'dojo/dojo.js',
        'load=build',
        '-p',
        'build.profile.js',
        '-r',
        'releaseDir='+buildDir
      ]



  //dojo build will always warn/error, if this gruntfile expands, consider forcing 'run' alone
  grunt.option('force', true);

  grunt.initConfig({
    uglify:{
      options:{
        mangle:true,
        compress:true
      },
      my_target:{
        files:uglifyFiles
      }
    },
  run: {
    build:{
      cmd: 'node',
      args: dojoArgs
    }
  },
  copy: {
      deploy: {
        files:[
          {
            expand:true,
            cwd: buildDir + "modules/",
            src: ['modules.js'],
            dest: homeDir
          }
        ]
      }
  }
  })

  
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks("grunt-run");

  grunt.loadTasks('./tasks/') //clean


  grunt.registerTask('default',['run:build','uglify','copy:deploy'])
};