/*global module:false*/
module.exports = function(grunt) {
  "use strict";

  grunt.loadTasks("../tasks");

  grunt.initConfig({
    imageEmbed: {
      dist: {
        src: "css/styles.css",
        dest: "css/output.css",

        options: {
          // Specify a max image size. Default is 32768 (32kb is IE8's limit).
          // maxImageSize: 0,

          // Base directory if you use absolute paths in your stylesheet
          // baseDir: "/Users/ehynds/projects/grunt-image-embed/"

          // Include certain files types based on a regex
          // regexInclude: /\.(jpg|png|gif|jpeg)/gi

          // Exclude certain file types based on a regex
          // regexExclude: /\.(eot|woff|ttf|svg)/gi
        }

      }
    }
  });

  grunt.registerTask("default", ["imageEmbed"]);
};
