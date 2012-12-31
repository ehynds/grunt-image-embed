module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    nodeunit: {
      all: ["test/test_image_encoder.js", "test/test_css_encoder.js"]
    },
    watch: {
      files: "<%= jshint.tasks.src %>",
      tasks: ["jshint:tasks", "nodeunit"]
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true
      },
      tasks: {
        src: ["tasks/**/*.js"]
      },
      general: {
        options: { strict: false },
        src: ["GruntFile.js", "test/**/*.js"]
      }
    }
  });

  grunt.loadTasks("tasks");
  grunt.loadNpmTasks("grunt-contrib-nodeunit");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", ["jshint", "nodeunit"]);
};
