/*
 * Grunt Image Embed
 * https://github.com/ehynds/grunt-image-embed
 *
 * Copyright (c) 2013 Eric Hynds
 * Licensed under the MIT license.
 */

// Internal libs
var grunt_encode = require("./lib/encode");

module.exports = function(grunt) {
  "use strict";

  // Grunt lib init
  var encode = grunt_encode.init(grunt);

  // Grunt utils
  var async = grunt.util.async;

  grunt.registerMultiTask("imageEmbed", "Embed images as base64 data URIs inside your stylesheets", function() {
    var opts = this.options();
    var done = this.async();

    // Process each src file
    this.files.forEach(function(file) {
      var dest = file.dest;
      var tasks;

      tasks = file.src.map(function(srcFile) {
        return function(callback) {
          encode.stylesheet(srcFile, opts, callback);
        };
      });

      // Once all files have been processed write them out.
      async.parallel(tasks, function(err, output) {
        grunt.file.write(dest, output);
        grunt.log.writeln('File "' + dest + '" created.');
        done();
      });
    });
  });

};
