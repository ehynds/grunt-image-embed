module.exports = function(grunt) {
  grunt.initConfig({
    nodeunit: {
      all: ['test/*.js']
    },
    jshint: {
      options: {
        jshintrc: true
      },
      all: {
        src: [
          'Gruntfile.js',
          'tasks/**/*.js',
          'test/**/*.js'
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint', 'nodeunit']);
};
