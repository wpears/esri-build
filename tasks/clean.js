var fs = require('fs');
var rimraf = require('rimraf');
var async = require('async');

module.exports = function(grunt){

  grunt.registerTask('clean','Remove all but the newest build.', function(){

    grunt.log.writeln("\n\nRemoving old builds.\n");
    var done = this.async();

    fs.readdir('.',function(err,files){

      if(err){
        grunt.log.error("\nError checking for old builds.\n");
        done();
      }

      var buildReg = /build\d{8}/; //Will break in November 2286!

      var buildSorter = function(a,b){return a<b};

      var builds = files.filter(function(v){
        return buildReg.test(v);
      });

      builds.sort(buildSorter);
      builds.shift();

      async.each(builds,rimraf,function(err){
        if(err){
          grunt.log.error("\nDidn't delete builds properly.\n");
          done();
        }
        grunt.log.writeln("\nBuilds cleaned.\n")
        done();
      });
    });
  });
}