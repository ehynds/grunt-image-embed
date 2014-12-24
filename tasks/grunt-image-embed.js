/*
 * Grunt Image Embed
 * https://github.com/ehynds/grunt-image-embed
 *
 * Copyright (c) 2013 Eric Hynds
 * Licensed under the MIT license.
 */
'use strict';

module.exports = function(grunt) {
  var encode = require('./lib/encode');

  grunt.registerMultiTask('imageEmbed', 'Embed images as base64 data URIs inside your stylesheets', function() {
    var opts = this.options();
    var done = this.async();
    var filesCount = this.files.length;
    var doneCount = 0;

    if (filesCount === 0) {
      grunt.log.warn('No files defined');
      return done();
    }

    // Process each src file
    this.files.forEach(function(file) {
      var dest = file.dest;
      var tasks;

      tasks = file.src.map(function(srcFile) {
        return function(callback) {
          encode.stylesheet(srcFile, opts, callback);
        };
      });

      if(!tasks.length) {
        grunt.log.writeln('No files found');
        return done();
      }

      // Once all files have been processed write them out.
      grunt.util.async.parallel(tasks, function(err, output) {
        grunt.file.write(dest, output);
        grunt.log.writeln('File "' + dest + '" created.');

        // call done() exactly once, after all files are processed
        if(++doneCount >= filesCount) {
          done();
        }
      });
    });
  });

};
