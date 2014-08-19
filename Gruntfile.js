module.exports = function(grunt){
  //dojo build will always warn/error, if this gruntfile expands, consider forcing 'run' alone
  grunt.option('force', true);

  grunt.initConfig({
    uglify:{
      options:{
        mangle:true,
        compress:true
      },
      my_target:{
        files:{
          './built/modules/modules.js':['./built/modules/modules.js.uncompressed.js']
        }
      }
    },
  run: {
    build:{
      cmd: 'node',
      args: [
        'dojo/dojo.js',
        'load=build',
        '-p',
        'build.profile.js',
        '-r'
      ]
    }
  }
  })

  
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-run");


  grunt.registerTask('default',['run:build','uglify'])
};